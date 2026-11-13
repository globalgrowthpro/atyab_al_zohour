-- ==============================================================================
-- Client Addresses (Multi-Address Book) Schema
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.client_addresses (
  id TEXT PRIMARY KEY DEFAULT ('ADDR-' || substr(md5(random()::text), 1, 8)),
  client_phone TEXT NOT NULL,
  label TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  street TEXT NOT NULL,
  building TEXT,
  notes TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_client_addresses_phone ON public.client_addresses(client_phone);

-- RLS Policies
ALTER TABLE public.client_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read own addresses" ON public.client_addresses
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert own addresses" ON public.client_addresses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update own addresses" ON public.client_addresses
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete own addresses" ON public.client_addresses
  FOR DELETE USING (true);
