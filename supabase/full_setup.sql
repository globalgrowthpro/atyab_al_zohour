-- ==============================================================================
-- أطياب الزهور (Atyab Al Zohour) - Complete Supabase Backend Architecture
-- Perishable Floral Cold-Chain, B2B Tiered Pricing, WhatsApp Hub & Orders
-- ==============================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. جدول شحنات الورود وسلسلة التبريد (Perishable Flower Batches)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.perishable_batches (
    id TEXT PRIMARY KEY, -- e.g. "LOT-NL-2601"
    product_slug TEXT NOT NULL,
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    origin TEXT NOT NULL CHECK (origin IN ('هولندا', 'الإكوادور', 'كينيا', 'كولومبيا', 'محلي')),
    farm TEXT NOT NULL,
    airway_bill TEXT NOT NULL,
    flight_number TEXT NOT NULL,
    arrival_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    vase_life_days INT NOT NULL DEFAULT 10,
    cold_storage_temp TEXT NOT NULL DEFAULT '2°C - 4°C',
    unit TEXT NOT NULL DEFAULT 'كرتون',
    on_hand_qty INT NOT NULL CHECK (on_hand_qty >= 0),
    reserved_qty INT NOT NULL DEFAULT 0 CHECK (reserved_qty >= 0),
    status TEXT NOT NULL DEFAULT 'fresh' CHECK (status IN ('fresh', 'normal', 'clearing', 'incoming', 'expired')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_batches_slug ON public.perishable_batches(product_slug, status);

-- ------------------------------------------------------------------------------
-- 3. جدول حجز الكميات من الشحنات المبردة (Stock Reservations)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stock_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT NOT NULL,
    batch_id TEXT REFERENCES public.perishable_batches(id) ON DELETE CASCADE,
    product_slug TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    reserved_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (timezone('utc'::text, now()) + interval '48 hours') NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_reservations_order ON public.stock_reservations(order_id);

-- ------------------------------------------------------------------------------
-- 4. جدول الطلبات وعروض الأسعار (Orders)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- e.g. ORD-2026-7841
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    street TEXT NOT NULL,
    delivery_method TEXT NOT NULL,
    delivery_slot TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    client_tier TEXT NOT NULL DEFAULT 'bronze',
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'ready', 'shipping', 'delivered', 'cancelled')),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    vat_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tier_discount_savings NUMERIC(10, 2) NOT NULL DEFAULT 0,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    events JSONB NOT NULL DEFAULT '[]'::jsonb,
    cold_chain_status TEXT NOT NULL DEFAULT 'certified_2_to_4_celsius',
    whatsapp_notified BOOLEAN NOT NULL DEFAULT false,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(client_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);

-- ------------------------------------------------------------------------------
-- 5. جدول عملاء B2B والشرائح (Clients & Corporate Accounts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    city TEXT,
    district TEXT,
    address TEXT,
    tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'hotel_contract')),
    cr_number TEXT,
    vat_number TEXT,
    credit_limit NUMERIC(10, 2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. جدول سجلات رسائل وتنبيهات الواتساب (WhatsApp Hub Logs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
    recipient_phone TEXT NOT NULL,
    event_type TEXT NOT NULL,
    message_body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    cost_sar NUMERIC(6, 4) DEFAULT 0.1200,
    meta_message_id TEXT
);

-- ------------------------------------------------------------------------------
-- 7. جدول تذاكر الدعم الفني (Support Tickets)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tickets (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_phone TEXT NOT NULL,
    order_id TEXT,
    subject TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('order', 'delivery', 'account', 'other')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'pending', 'closed')),
    replies JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- ------------------------------------------------------------------------------
-- 8. منطق الحجز الذري للورود وتفادي البيع المزدوج (Atomic Stock Reservation)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reserve_flower_stock(
    p_order_id TEXT,
    p_product_slug TEXT,
    p_quantity INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_batch RECORD;
    v_remaining INT := p_quantity;
    v_alloc INT;
    v_reservations JSONB := '[]'::jsonb;
BEGIN
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be positive';
    END IF;

    -- قفل الصفوف بالترتيب لمنع التعارض والبيع المزدوج (Lock row with FOR UPDATE)
    FOR v_batch IN 
        SELECT id, on_hand_qty, reserved_qty, (on_hand_qty - reserved_qty) AS available
        FROM public.perishable_batches
        WHERE product_slug = p_product_slug
          AND status IN ('fresh', 'normal')
          AND (on_hand_qty - reserved_qty) > 0
        ORDER BY expiry_date ASC
        FOR UPDATE
    LOOP
        v_alloc := LEAST(v_remaining, v_batch.available);
        
        -- زيادة الكمية المحجوزة
        UPDATE public.perishable_batches
        SET reserved_qty = reserved_qty + v_alloc,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_batch.id;

        -- إنشاء سجل حجز مرتبط برقم الطلب
        INSERT INTO public.stock_reservations (order_id, batch_id, product_slug, quantity)
        VALUES (p_order_id, v_batch.id, p_product_slug, v_alloc);

        v_reservations := v_reservations || jsonb_build_object('batch_id', v_batch.id, 'allocated', v_alloc);
        v_remaining := v_remaining - v_alloc;

        EXIT WHEN v_remaining = 0;
    END LOOP;

    IF v_remaining > 0 THEN
        RAISE EXCEPTION 'Insufficient fresh stock for product: % (Remaining needed: %)', p_product_slug, v_remaining;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'product_slug', p_product_slug,
        'allocated_total', p_quantity,
        'details', v_reservations
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 9. تحديث الصلاحية التلقائي (Automatic Perishable Expiry & Vase-Life Check)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_vase_life_statuses()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.perishable_batches
    SET status = 'expired',
        updated_at = timezone('utc'::text, now())
    WHERE expiry_date < CURRENT_DATE
      AND status != 'expired';

    UPDATE public.perishable_batches
    SET status = 'clearing',
        updated_at = timezone('utc'::text, now())
    WHERE expiry_date <= (CURRENT_DATE + interval '2 days')
      AND expiry_date >= CURRENT_DATE
      AND status NOT IN ('clearing', 'expired');
END;
$$;

-- ------------------------------------------------------------------------------
-- 10. تفعيل سياسات الأمان Row Level Security (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.perishable_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- تنظيف السياسات السابقة إن وُجدت
DROP POLICY IF EXISTS "Public can view batches" ON public.perishable_batches;
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public can select orders" ON public.orders;
DROP POLICY IF EXISTS "Public can view clients" ON public.clients;
DROP POLICY IF EXISTS "Public can insert tickets" ON public.tickets;
DROP POLICY IF EXISTS "Public can read tickets" ON public.tickets;

-- 1. الزوار يمكنهم قراءة شحنات الورود والمخزون المتاح فقط
CREATE POLICY "Public can view batches" ON public.perishable_batches
    FOR SELECT TO public
    USING (status IN ('fresh', 'normal', 'clearing'));

-- 2. الزوار يمكنهم تقديم طلبات جديدة
CREATE POLICY "Public can insert orders" ON public.orders
    FOR INSERT TO public
    WITH CHECK (true);

-- 3. الزوار يمكنهم قراءة وتتبع طلباتهم (عبر رقم الطلب أو الجوال)
CREATE POLICY "Public can select orders" ON public.orders
    FOR SELECT TO public
    USING (true);

-- 4. إتاحة تذاكر الدعم الفني للعملاء
CREATE POLICY "Public can insert tickets" ON public.tickets
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Public can read tickets" ON public.tickets
    FOR SELECT TO public
    USING (true);

-- ------------------------------------------------------------------------------
-- 11. إدراج الشحنات والبيانات الأولية (Seed Data)
-- ------------------------------------------------------------------------------
INSERT INTO public.perishable_batches (
    id, product_slug, product_name, sku, origin, farm, airway_bill, flight_number,
    arrival_date, expiry_date, vase_life_days, cold_storage_temp, unit, on_hand_qty, reserved_qty, status
) VALUES 
('LOT-NL-2601', 'red-naomi-rose', 'ورد أحمر فاخر (Red Naomi)', 'RS-001', 'هولندا', 'Porta Nova Farms', 'KLM-749-8831', 'KLM 561 (أمستردام - الرياض)', '2026-10-28', '2026-11-12', 14, '2°C - 3°C', 'كرتون', 120, 18, 'fresh'),
('LOT-EC-1842', 'pink-rose-luxury', 'ورد وردي فاخر (Pink Mondial)', 'RS-002', 'الإكوادور', 'BellaRosa Cayambe', 'LATAM-932-1120', 'LA 8102 (كيتو - جدة)', '2026-10-29', '2026-11-14', 16, '2°C - 4°C', 'كرتون', 80, 15, 'fresh'),
('LOT-KE-9011', 'white-rose-avalanche', 'ورد أبيض أفالانش (Avalanche White)', 'RS-003', 'كينيا', 'Tambuzi Specialty Roses', 'KQ-105-4491', 'KQ 310 (نيروبي - الرياض)', '2026-10-27', '2026-11-09', 12, '2°C - 3°C', 'كرتون', 60, 10, 'normal'),
('LOT-NL-2603', 'gypsophila-million-stars', 'جبسوفيلا مليون ستارز (Million Stars)', 'GY-001', 'هولندا', 'Danziger Group', 'KLM-749-9002', 'KLM 561 (أمستردام - الرياض)', '2026-10-30', '2026-11-15', 16, '3°C - 5°C', 'كرتون', 90, 8, 'fresh'),
('LOT-CO-5520', 'hydrangea-white-premium', 'هيدرانجيا بيضاء فاخرة (Premium Hydrangea)', 'HY-001', 'كولومبيا', 'Flores del Este', 'AV-201-9032', 'AV 080 (بوغوتا - الرياض)', '2026-10-28', '2026-11-10', 13, '2°C - 4°C', 'كرتون', 40, 20, 'normal')
ON CONFLICT (id) DO NOTHING;

-- إتاحة الاستماع الفوري للطلبات والمخزون عبر Supabase Realtime
DO $$
BEGIN
    PERFORM 1 FROM pg_publication WHERE pubname = 'supabase_realtime';
    IF FOUND THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders, public.perishable_batches;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Realtime table publication addition if already exists
    NULL;
END;
$$;

