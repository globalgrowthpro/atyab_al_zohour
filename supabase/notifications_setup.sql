-- ==============================================================================
-- Web Push & Notifications Schema
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.notification_subscriptions (
  id TEXT PRIMARY KEY DEFAULT ('SUB-' || substr(md5(random()::text), 1, 8)),
  user_phone TEXT,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT,
  auth TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert subscriptions" ON public.notification_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read subscriptions" ON public.notification_subscriptions
  FOR SELECT USING (true);
