-- ==============================================================================
-- أطياب الزهور (Atyab Al Zohour) - Complete Supabase Master Backend Architecture
-- Production Ready for Saudi B2B Perishable Floral Trade & Logistics
-- ==============================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. جدول التصنيفات (Categories)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    image TEXT NOT NULL,
    item_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. جدول المنتجات والزهور (Products Catalog)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    category_slug TEXT NOT NULL REFERENCES public.categories(slug) ON UPDATE CASCADE ON DELETE RESTRICT,
    origin TEXT NOT NULL,
    grade TEXT NOT NULL DEFAULT 'A1',
    stem_length TEXT,
    color TEXT NOT NULL,
    color_code TEXT,
    unit TEXT NOT NULL DEFAULT 'باقة',
    moq INT NOT NULL DEFAULT 1,
    stems_per_bunch INT,
    bunches_per_carton INT,
    available BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    storage_temp TEXT DEFAULT '2°C - 4°C مبرد',
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_available ON public.products(available);

-- ------------------------------------------------------------------------------
-- 4. جدول شحنات الورود وسلسلة التبريد (Perishable Flower Batches)
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
-- 5. جدول حجز الكميات من الشحنات المبردة (Stock Reservations)
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
-- 6. جدول الطلبات وعروض الأسعار (Orders & Tax Invoices)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- e.g. ORD-2026-7841
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    company_name TEXT,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    street TEXT NOT NULL,
    delivery_method TEXT NOT NULL, -- 'cold_delivery' or 'warehouse_pickup'
    delivery_slot TEXT NOT NULL,
    payment_method TEXT NOT NULL, -- 'bank_transfer', 'mada', 'visa', 'apple_pay', 'cod', 'credit_terms'
    client_tier TEXT NOT NULL DEFAULT 'bronze',
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'ready', 'shipping', 'delivered', 'cancelled')),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    vat_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    zatca_invoice_hash TEXT,
    zatca_qr TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(client_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ------------------------------------------------------------------------------
-- 7. جدول مناديب التوصيل وأسطول التبريد (Couriers & Cold Fleet)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.couriers (
    id TEXT PRIMARY KEY, -- e.g. CR-01
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    city TEXT NOT NULL,
    vehicle TEXT NOT NULL,
    temperature_celsius NUMERIC(3, 1) DEFAULT 3.2,
    active BOOLEAN NOT NULL DEFAULT true,
    total_deliveries INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 8. جدول مهام التوصيل المبرد (Delivery Tasks)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.delivery_tasks (
    id TEXT PRIMARY KEY, -- e.g. TSK-1044
    order_id TEXT REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL,
    courier_id TEXT REFERENCES public.couriers(id) ON UPDATE CASCADE ON DELETE SET NULL,
    delivery_date DATE NOT NULL,
    delivery_slot TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    street TEXT NOT NULL,
    instruction TEXT,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'out_for_delivery', 'delivered', 'failed')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high')),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
    recipient_name TEXT,
    failure_reason TEXT CHECK (failure_reason IN ('unavailable', 'address', 'vehicle', 'other')),
    delivery_temp NUMERIC(3, 1),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_delivery_tasks_courier ON public.delivery_tasks(courier_id, status);
CREATE INDEX IF NOT EXISTS idx_delivery_tasks_date ON public.delivery_tasks(delivery_date);

-- ------------------------------------------------------------------------------
-- 9. جدول إدارة علاقات العملاء والصفقات (CRM Deals & B2B Pipeline)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_deals (
    id TEXT PRIMARY KEY, -- e.g. DL-01
    company TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    business_type TEXT NOT NULL,
    city TEXT NOT NULL,
    deal_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'contacted', 'proposal', 'negotiation', 'won', 'lost')),
    owner TEXT NOT NULL,
    next_follow_up DATE,
    source TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON public.crm_deals(stage);

-- ------------------------------------------------------------------------------
-- 10. جدول العملاء التجاريين (Clients / Florists / Event Planners)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    company_name TEXT,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    commercial_register TEXT,
    vat_number TEXT,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    address TEXT,
    tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    credit_limit NUMERIC(10, 2) DEFAULT 0.00,
    outstanding_balance NUMERIC(10, 2) DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 11. جدول شرائح الأسعار B2B (Pricing Tiers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pricing_tiers (
    tier TEXT PRIMARY KEY, -- 'bronze', 'silver', 'gold', 'platinum'
    label_ar TEXT NOT NULL,
    label_en TEXT NOT NULL,
    min_spend NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    benefits JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- ------------------------------------------------------------------------------
-- 12. جدول الاستفسارات والتواصل (Contact & Quote Inquiries)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'responded', 'archived')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 13. جدول إعدادات المتجر وسلسلة التبريد (Store & Cold Chain Settings)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 14. جدول سجلات رسائل وتنبيهات الواتساب (WhatsApp Hub Logs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    recipient_phone TEXT NOT NULL,
    message_type TEXT NOT NULL, -- 'order_confirmation', 'status_update', 'price_quote', 'temperature_alert'
    order_id TEXT,
    template_name TEXT,
    payload JSONB,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'failed')),
    gateway_response JSONB
);

-- ------------------------------------------------------------------------------
-- 15. جدول تذاكر خدمة العملاء (Tickets & Support Requests)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    ticket_number TEXT NOT NULL UNIQUE,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    order_id TEXT,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- ------------------------------------------------------------------------------
-- 16. Functions & Stored Procedures (Atomic Stock Reservations & Logic)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reserve_flower_stock(
    p_order_id TEXT,
    p_product_slug TEXT,
    p_quantity INT
) RETURNS JSONB AS $$
DECLARE
    v_remaining INT := p_quantity;
    v_batch RECORD;
    v_to_reserve INT;
    v_total_reserved INT := 0;
BEGIN
    FOR v_batch IN 
        SELECT id, (on_hand_qty - reserved_qty) AS available
        FROM public.perishable_batches
        WHERE product_slug = p_product_slug
          AND status IN ('fresh', 'normal', 'clearing')
          AND (on_hand_qty - reserved_qty) > 0
        ORDER BY expiry_date ASC
        FOR UPDATE
    LOOP
        EXIT WHEN v_remaining <= 0;

        v_to_reserve := LEAST(v_batch.available, v_remaining);

        UPDATE public.perishable_batches
        SET reserved_qty = reserved_qty + v_to_reserve,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_batch.id;

        INSERT INTO public.stock_reservations (order_id, batch_id, product_slug, quantity)
        VALUES (p_order_id, v_batch.id, p_product_slug, v_to_reserve);

        v_remaining := v_remaining - v_to_reserve;
        v_total_reserved := v_total_reserved + v_to_reserve;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'requested', p_quantity,
        'reserved', v_total_reserved,
        'unfulfilled', v_remaining
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_vase_life_statuses()
RETURNS VOID AS $$
BEGIN
    UPDATE public.perishable_batches
    SET status = 'expired',
        updated_at = timezone('utc'::text, now())
    WHERE expiry_date < CURRENT_DATE
      AND status != 'expired';

    UPDATE public.perishable_batches
    SET status = 'clearing',
        updated_at = timezone('utc'::text, now())
    WHERE expiry_date >= CURRENT_DATE 
      AND expiry_date <= (CURRENT_DATE + INTERVAL '2 days')
      AND status NOT IN ('clearing', 'expired');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 17. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perishable_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- قراءة الكتالوج والتصنيفات والشرائح متاحة للجميع
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public can view pricing tiers" ON public.pricing_tiers FOR SELECT USING (true);
CREATE POLICY "Public can view store settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Public can view batches" ON public.perishable_batches FOR SELECT TO public USING (status IN ('fresh', 'normal', 'clearing'));

-- تقديم الطلبات وتتبعها
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can select orders" ON public.orders FOR SELECT TO public USING (true);

-- إرسال استفسارات التواصل وتذاكر الدعم
CREATE POLICY "Public can submit inquiries" ON public.contact_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert tickets" ON public.tickets FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public can read tickets" ON public.tickets FOR SELECT TO public USING (true);

-- مهام المناديب وإدارة CRM
CREATE POLICY "Allow select delivery tasks" ON public.delivery_tasks FOR SELECT USING (true);
CREATE POLICY "Allow couriers update delivery status" ON public.delivery_tasks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow select couriers" ON public.couriers FOR SELECT USING (true);
CREATE POLICY "Allow select crm deals" ON public.crm_deals FOR SELECT USING (true);
CREATE POLICY "Allow manage crm deals" ON public.crm_deals FOR ALL USING (true);
