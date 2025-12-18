-- Make shop_id nullable in landing_pages so pages can be created without client assignment
ALTER TABLE public.landing_pages ALTER COLUMN shop_id DROP NOT NULL;