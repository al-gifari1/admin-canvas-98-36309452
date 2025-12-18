-- Allow public (unauthenticated) users to INSERT orders
CREATE POLICY "Public can insert orders"
ON public.orders
FOR INSERT
WITH CHECK (true);

-- Add landing_page_id column to orders for tracking which page generated the order
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS landing_page_id uuid REFERENCES public.landing_pages(id),
ADD COLUMN IF NOT EXISTS delivery_address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1;