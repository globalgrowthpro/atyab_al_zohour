-- ==============================================================================
-- CMS Pages Schema (Dynamic Public Static Pages)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.cms_pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  meta_title TEXT,
  meta_description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- RLS Policies
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read cms_pages" ON public.cms_pages
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage cms_pages" ON public.cms_pages
  FOR ALL USING (true);
