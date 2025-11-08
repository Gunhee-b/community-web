-- Create storage bucket for meeting images
INSERT INTO storage.buckets (id, name, public)
VALUES ('meeting-images', 'meeting-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for meeting images
-- NOTE: Using custom auth system, so we allow all operations without auth checks
-- Security is handled at application level

-- Allow anyone to upload meeting images
CREATE POLICY "Anyone can upload meeting images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'meeting-images');

-- Allow public read access to meeting images
CREATE POLICY "Public read access for meeting images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'meeting-images');

-- Allow anyone to update meeting images
CREATE POLICY "Anyone can update meeting images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'meeting-images');

-- Allow anyone to delete meeting images
CREATE POLICY "Anyone can delete meeting images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'meeting-images');
