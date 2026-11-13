-- ==============================================================================
-- Storage Buckets & Policies for Atyab Al Zohour
-- Run this in Supabase SQL Editor to configure all storage buckets
-- ==============================================================================

-- 1. Create storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('ticket-attachments', 'ticket-attachments', true),
  ('payment-receipts', 'payment-receipts', false),
  ('store-assets', 'store-assets', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 2. Storage Policies for product-images (Public Read, Authenticated/Admin Write)
CREATE POLICY "Public Read product-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin Upload product-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Admin Update product-images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images');

CREATE POLICY "Admin Delete product-images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images');

-- 3. Storage Policies for ticket-attachments
CREATE POLICY "Public Read ticket-attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'ticket-attachments');

CREATE POLICY "Authenticated Upload ticket-attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'ticket-attachments');

-- 4. Storage Policies for payment-receipts
CREATE POLICY "Clients Upload payment-receipts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'payment-receipts');

CREATE POLICY "Admin and Owner View payment-receipts" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-receipts');

-- 5. Storage Policies for store-assets
CREATE POLICY "Public Read store-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'store-assets');

CREATE POLICY "Admin Upload store-assets" ON storage.objects
  FOR ALL USING (bucket_id = 'store-assets');

