-- Add checkout_config column to landing_pages for storing delivery fees, rules, etc.
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS checkout_config JSONB DEFAULT '{
  "delivery_fee": 0,
  "free_delivery_threshold": null,
  "free_delivery_message": "",
  "allow_all_locations": true,
  "allowed_cities": []
}'::jsonb;