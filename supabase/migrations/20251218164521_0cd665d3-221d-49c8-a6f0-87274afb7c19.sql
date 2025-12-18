-- Allow public (unauthenticated) access to view landing pages for preview
CREATE POLICY "Public can view landing pages for preview"
ON public.landing_pages
FOR SELECT
USING (true);