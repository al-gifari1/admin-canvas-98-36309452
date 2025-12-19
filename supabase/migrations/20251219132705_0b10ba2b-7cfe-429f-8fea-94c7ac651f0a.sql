-- Add new columns to products table for type, sale price, sizes
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sale_price numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS product_type text DEFAULT 'physical' CHECK (product_type IN ('physical', 'digital'));

-- Update checkout_profiles table with shipping rules and free shipping
ALTER TABLE public.checkout_profiles 
ADD COLUMN IF NOT EXISTS shipping_rules jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS free_shipping_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS free_shipping_threshold numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS notes_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS address_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS city_enabled boolean DEFAULT true;

-- Create product-images storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for product-images bucket
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their uploaded images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their uploaded images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);