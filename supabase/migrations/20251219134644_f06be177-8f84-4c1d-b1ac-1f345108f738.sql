-- Make shop_id nullable in products table
ALTER TABLE public.products ALTER COLUMN shop_id DROP NOT NULL;