-- Allow developers to manage their personal files (shop_id is null)
CREATE POLICY "Developers can manage their personal files"
ON public.media_files
FOR ALL
USING (
  shop_id IS NULL 
  AND created_by = auth.uid() 
  AND has_role(auth.uid(), 'developer'::app_role)
)
WITH CHECK (
  shop_id IS NULL 
  AND created_by = auth.uid() 
  AND has_role(auth.uid(), 'developer'::app_role)
);

-- Allow developers to manage their personal folders (shop_id is null)
CREATE POLICY "Developers can manage their personal folders"
ON public.media_folders
FOR ALL
USING (
  shop_id IS NULL 
  AND created_by = auth.uid() 
  AND has_role(auth.uid(), 'developer'::app_role)
)
WITH CHECK (
  shop_id IS NULL 
  AND created_by = auth.uid() 
  AND has_role(auth.uid(), 'developer'::app_role)
);