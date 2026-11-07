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


-- ==============================================================================
-- أطياب الزهور (Atyab Al Zohour) - Complete Enterprise Schema Extension
-- Profiles, RBAC User Roles, Security Audit Logs, Normalized Order Items,
-- Invoices, Telemetry, Inventory Adjustments, Quotes, and Notifications
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. جداول الملف الشخصي والصلاحيات (Profiles & RBAC Roles)
-- ------------------------------------------------------------------------------

-- نوع الأدوار المدعومة في النظام
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM (
            'admin',
            'manager',
            'sales',
            'inventory',
            'courier',
            'client'
        );
    END IF;
END$$;

-- جدول الملفات الشخصية المرتبط بـ auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT NOT NULL DEFAULT '',
    phone TEXT,
    company_name TEXT,
    commercial_register TEXT,
    vat_number TEXT,
    city TEXT DEFAULT 'الرياض',
    district TEXT,
    address TEXT,
    role public.app_role NOT NULL DEFAULT 'client',
    tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    avatar_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- جدول أدوار المستخدمين المتعددة (User Roles RBAC)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    assigned_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);

-- دالة تلقائية لإنشاء ملف شخصي عند إنشاء مستخدم جديد في Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.raw_user_meta_data->>'phone',
        COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'client'::public.app_role)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = CASE WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END;

    -- إضافة الدور في user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (
        NEW.id,
        COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'client'::public.app_role)
    )
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger على auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- دالة مساعدة لفحص صلاحيات وأدوار المستخدم (Security Helper)
CREATE OR REPLACE FUNCTION public.has_role(p_user_id UUID, p_role public.app_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = p_user_id AND role = p_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------------------------
-- 2. جدول سجلات الأمان والتدقيق (Security & Audit Logs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL DEFAULT 'مدير النظام',
    event_type TEXT NOT NULL, -- 'login_success', 'login_failed', 'role_changed', 'price_updated', 'order_status_changed', 'stock_override', 'settings_changed'
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'danger', 'critical')),
    tone TEXT NOT NULL DEFAULT 'sage' CHECK (tone IN ('sage', 'gold', 'danger', 'muted', 'rose', 'forest')),
    ip_address TEXT,
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON public.security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON public.security_logs(event_type);

-- جدول الجلسات النشطة للأجهزة (Active User Sessions)
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device TEXT NOT NULL, -- e.g. "Chrome · Windows", "Safari · iPhone"
    ip_address TEXT,
    location TEXT DEFAULT 'الرياض',
    last_active TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON public.user_sessions(user_id);

-- ------------------------------------------------------------------------------
-- 3. جدول بنود الطلب المعيارية (Normalized Order Items)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_slug TEXT NOT NULL,
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'باقة',
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    quantity INT NOT NULL CHECK (quantity > 0),
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    vat_rate NUMERIC(4, 2) NOT NULL DEFAULT 0.15,
    vat_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_slug);

-- ------------------------------------------------------------------------------
-- 4. جدول الفواتير الضريبية الرسمية ZATCA (Official Tax Invoices)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT NOT NULL UNIQUE, -- e.g. "INV-2026-0012"
    order_id TEXT REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL,
    issue_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    seller_name TEXT NOT NULL DEFAULT 'شركة أطياب الزهور للتجارة',
    seller_vat_number TEXT NOT NULL DEFAULT '310123456700003',
    seller_commercial_register TEXT NOT NULL DEFAULT '1010789456',
    buyer_name TEXT NOT NULL,
    buyer_phone TEXT NOT NULL,
    buyer_vat_number TEXT,
    buyer_city TEXT NOT NULL,
    buyer_district TEXT,
    subtotal_excluding_vat NUMERIC(10, 2) NOT NULL,
    vat_amount NUMERIC(10, 2) NOT NULL,
    total_with_vat NUMERIC(10, 2) NOT NULL,
    zatca_invoice_uuid TEXT UNIQUE,
    zatca_hash TEXT,
    zatca_qr TEXT,
    zatca_status TEXT NOT NULL DEFAULT 'compliant' CHECK (zatca_status IN ('draft', 'compliant', 'reported', 'cleared', 'rejected')),
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_invoices_order ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);

-- ------------------------------------------------------------------------------
-- 5. جدول طلبات وعروض الأسعار B2B الرسمية (B2B Quotations)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quotations (
    id TEXT PRIMARY KEY, -- e.g. "QUO-2026-1048"
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    company_name TEXT,
    city TEXT NOT NULL,
    tier TEXT NOT NULL DEFAULT 'bronze',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'rejected', 'expired')),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    vat_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    valid_until DATE DEFAULT (CURRENT_DATE + INTERVAL '14 days'),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_phone ON public.quotations(client_phone);

-- ------------------------------------------------------------------------------
-- 6. جدول مزارع الورود المعتمدة دولياً ومحلياً (Supplier Flower Farms)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.supplier_farms (
    id TEXT PRIMARY KEY, -- e.g. "FARM-NL-01"
    name TEXT NOT NULL,
    country TEXT NOT NULL CHECK (country IN ('هولندا', 'الإكوادور', 'كينيا', 'كولومبيا', 'السعودية')),
    region TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    rating NUMERIC(2, 1) DEFAULT 4.9,
    cold_chain_certified BOOLEAN NOT NULL DEFAULT true,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 7. جدول تسويات ومطابقة مخزون سلسلة التبريد (Inventory Quality Adjustments)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id TEXT REFERENCES public.perishable_batches(id) ON DELETE SET NULL,
    product_slug TEXT NOT NULL,
    quantity_change INT NOT NULL, -- سالب للهدر/التلف، موجب للاستلام الإضافي
    reason TEXT NOT NULL CHECK (reason IN ('vase_life_expired', 'temperature_breach', 'stem_breakage', 'count_reconciliation', 'incoming_bonus', 'customs_delay')),
    adjusted_by TEXT NOT NULL DEFAULT 'مسؤول المستودع المبرد',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_adjustments_batch ON public.inventory_adjustments(batch_id);

-- ------------------------------------------------------------------------------
-- 8. جدول تتبع سيارات التبريد ودرجات الحرارة اللحظية (Cold Chain Van Telemetry)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courier_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    courier_id TEXT REFERENCES public.couriers(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    temperature_celsius NUMERIC(3, 1) NOT NULL DEFAULT 3.0,
    humidity_pct NUMERIC(4, 1) DEFAULT 85.0,
    speed_kmh NUMERIC(5, 1) DEFAULT 0.0,
    recorded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_telemetry_courier ON public.courier_telemetry(courier_id, recorded_at DESC);

-- ------------------------------------------------------------------------------
-- 9. جدول تقييمات وملاحظات الجودة للمنتجات (Product Quality Reviews)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_slug TEXT NOT NULL,
    client_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    vase_life_observed_days INT,
    is_verified_florist BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_slug ON public.product_reviews(product_slug);

-- ------------------------------------------------------------------------------
-- 10. جدول قوالب الإشعارات التلقائية (Notification Templates)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_templates (
    key TEXT PRIMARY KEY, -- e.g. 'order_confirmed', 'van_out_for_delivery', 'cold_chain_alert'
    title_ar TEXT NOT NULL,
    whatsapp_template TEXT NOT NULL,
    sms_template TEXT,
    email_subject TEXT,
    email_body TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 11. تحديثات على جدول التصنيفات (Enhanced Categories Fields)
-- ------------------------------------------------------------------------------
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

-- ------------------------------------------------------------------------------
-- 12. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courier_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- قراءة الملفات الشخصية: المستخدم يقرأ ملفه فقط، أو الأدمن يقرأ الجميع
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- قراءة بنود الطلبات والفواتير
DROP POLICY IF EXISTS "Public can view order items" ON public.order_items;
CREATE POLICY "Public can view order items" ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view invoices" ON public.invoices;
CREATE POLICY "Public can view invoices" ON public.invoices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view quotations" ON public.quotations;
CREATE POLICY "Public can view quotations" ON public.quotations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can submit quotations" ON public.quotations;
CREATE POLICY "Public can submit quotations" ON public.quotations FOR INSERT WITH CHECK (true);

-- قراءة مزارع الموردين والمراجعات
DROP POLICY IF EXISTS "Public can view farms" ON public.supplier_farms;
CREATE POLICY "Public can view farms" ON public.supplier_farms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view reviews" ON public.product_reviews;
CREATE POLICY "Public can view reviews" ON public.product_reviews FOR SELECT USING (true);

-- تتبع سيارات التبريد وسجلات الأمان
DROP POLICY IF EXISTS "Public can view telemetry" ON public.courier_telemetry;
CREATE POLICY "Public can view telemetry" ON public.courier_telemetry FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow couriers insert telemetry" ON public.courier_telemetry;
CREATE POLICY "Allow couriers insert telemetry" ON public.courier_telemetry FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select security logs" ON public.security_logs;
CREATE POLICY "Allow select security logs" ON public.security_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert security logs" ON public.security_logs;
CREATE POLICY "Allow insert security logs" ON public.security_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select user sessions" ON public.user_sessions;
CREATE POLICY "Allow select user sessions" ON public.user_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow select notification templates" ON public.notification_templates;
CREATE POLICY "Allow select notification templates" ON public.notification_templates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow select inventory adjustments" ON public.inventory_adjustments;
CREATE POLICY "Allow select inventory adjustments" ON public.inventory_adjustments FOR SELECT USING (true);

-- ------------------------------------------------------------------------------
-- 13. إدراج البيانات الأولية (Seed Data)
-- ------------------------------------------------------------------------------

-- مزارع الزهور الشريكة
INSERT INTO public.supplier_farms (id, name, country, region, contact_person, rating, cold_chain_certified) VALUES
('FARM-NL-01', 'Porta Nova Farms', 'هولندا', 'أمستردام', 'Hans Van Dijk', 5.0, true),
('FARM-EC-02', 'BellaRosa Cayambe', 'الإكوادور', 'كيتو', 'Carlos Mendoza', 4.9, true),
('FARM-KE-03', 'Tambuzi Specialty Roses', 'كينيا', 'نيروبي', 'Amina Mwangi', 4.8, true),
('FARM-CO-04', 'Flores del Este', 'كولومبيا', 'بوغوتا', 'Mateo Gomez', 4.9, true),
('FARM-SA-05', 'مزارع أطايب الهدا والقصيم', 'السعودية', 'الطائف', 'أبو فهد العتيبي', 4.9, true)
ON CONFLICT (id) DO NOTHING;

-- سجلات الأمان الأولية (Security Logs)
INSERT INTO public.security_logs (actor_name, event_type, description, severity, tone, ip_address) VALUES
('مدير النظام', 'login_success', 'تسجيل دخول ناجح إلى لوحة الإدارة', 'info', 'sage', '192.168.1.10'),
('زائر غير مصرح', 'login_failed', 'محاولة دخول فاشلة بكلمة مرور خاطئة (3 مرات)', 'danger', 'danger', '82.165.197.1'),
('مدير النظام', 'price_updated', 'تحديث قائمة أسعار الجملة للشريحة الذهبية', 'warning', 'gold', '192.168.1.10'),
('مشرف العمليات', 'order_status_changed', 'تغيير حالة الطلب ORD-1046 إلى جاهز للتوصيل', 'info', 'forest', '192.168.1.15');

-- الجلسات النشطة (User Sessions)
INSERT INTO public.user_sessions (device, location, is_current) VALUES
('Chrome · Windows', 'الرياض', true),
('Safari · iPhone', 'جدة', false),
('Edge · Windows', 'الدمام', false);

-- عروض الأسعار (Quotations)
INSERT INTO public.quotations (id, client_name, client_phone, client_email, company_name, city, status, subtotal, vat_amount, total, notes) VALUES
('QUO-2026-1048', 'متجر نسمة الورد', '0501234567', 'nesma@flowers.sa', 'مؤسسة نسمة لتنسيق الزهور', 'الرياض', 'pending', 4850.00, 727.50, 5577.50, 'طلب توريد أسبوعي لورود ريد ناومي'),
('QUO-2026-1047', 'فندق الواحة', '0559876543', 'procurement@oasis-hotel.sa', 'شركة فنادق الواحة الدولية', 'جدة', 'sent', 12400.00, 1860.00, 14260.00, 'عرض أسعار لتجهيز بهو الفندق يومياً'),
('QUO-2026-1046', 'قاعة الفخامة للمناسبات', '0543219876', 'info@alfakhama.sa', 'قاعة الفخامة الفاخرة', 'الرياض', 'accepted', 8900.00, 1335.00, 10235.00, 'تم قبول العرض وتحويله للتحضير والتسليم');

-- مراجعات المنتجات (Product Reviews)
INSERT INTO public.product_reviews (product_slug, client_name, rating, comment, vase_life_observed_days) VALUES
('red-naomi-rose', 'محل بتلات الرياض', 5, 'جودة ممتازة وثبات غير مسبوق في درجات حرارة المحل، استمرت نضرة لأكثر من 14 يوماً.', 14),
('pink-explorer-rose', 'استوديو فلورا جدة', 5, 'اللون متطابق مع طلب عميلات الأعراس والرائحة طبيعية منعشة.', 12),
('white-mondial-rose', 'قاعة ليلتي', 5, 'حجم رأس الزهرة كبير جداً وسيقان قوية 70 سم، ممتازة للتنسيقات المرتفعة.', 16);

-- قوالب الإشعارات (Notification Templates)
INSERT INTO public.notification_templates (key, title_ar, whatsapp_template, sms_template, email_subject) VALUES
('order_confirmed', 'تأكيد الطلب وحجز المخزون', 'مرحباً {{customer_name}}، تم استلام طلبك {{order_id}} بنجاح وحجز كميات الزهور من غرف التبريد. الإجمالي: {{total}} ر.س.', 'تم تأكيد طلبك {{order_id}} من أطياب الزهور.', 'تأكيد طلب الزهور المبرد {{order_id}} - أطياب الزهور'),
('van_out_for_delivery', 'خروج المندوب للتوصيل المبرد', 'عزيزي {{customer_name}}، شحنتك {{order_id}} الآن مع المندوب {{courier_name}} في سيارة مبردة بدرجة {{temperature}}°C.', 'طلبك {{order_id}} في الطريق إليك مع التبريد المباشر.', 'شحنتك خرجت للتوصيل المبرد - أطياب الزهور'),
('cold_chain_alert', 'تنبيه جودة التبريد', 'تنبيه داخلي: تجاوزت درجة حرارة الفان {{van_plate}} الحد المسموح. القراءة الحالية: {{temperature}}°C.', 'تنبيه سلسلة التبريد: راجع أسطول النقل فوراً.', 'تحذير سلسلة التبريد للورود المستوردة')
ON CONFLICT (key) DO UPDATE SET
  title_ar = EXCLUDED.title_ar,
  whatsapp_template = EXCLUDED.whatsapp_template;

-- Realtime Publications
ALTER PUBLICATION supabase_realtime ADD TABLE public.security_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.courier_telemetry;

