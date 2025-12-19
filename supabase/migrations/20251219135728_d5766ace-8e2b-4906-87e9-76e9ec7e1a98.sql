-- Add RLS policy for developers to manage their personal products (without shop)
CREATE POLICY "Developers can manage their personal products" 
ON public.products FOR ALL 
USING (
  (shop_id IS NULL) AND 
  (created_by = auth.uid()) AND 
  has_role(auth.uid(), 'developer'::app_role)
)
WITH CHECK (
  (shop_id IS NULL) AND 
  (created_by = auth.uid()) AND 
  has_role(auth.uid(), 'developer'::app_role)
);

-- Add digital_config column for storing digital product settings
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS digital_config JSONB DEFAULT NULL;

COMMENT ON COLUMN public.products.digital_config IS 
'Stores digital product settings: fulfillment_type, expiry_days, max_downloads, show_on_thankyou, delivery_mode, license_keys, requires_email, duration_days, template_key';