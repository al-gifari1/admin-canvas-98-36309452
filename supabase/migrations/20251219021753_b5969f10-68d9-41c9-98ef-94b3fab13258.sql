-- Create storage bucket for builder assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('builder-assets', 'builder-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload builder assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'builder-assets');

-- Allow public read access
CREATE POLICY "Public read access for builder assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'builder-assets');

-- Allow users to update their own uploads
CREATE POLICY "Users can update own builder assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'builder-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own builder assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'builder-assets' AND auth.uid()::text = (storage.foldername(name))[1]);