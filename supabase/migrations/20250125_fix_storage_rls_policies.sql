-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload meeting images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for meeting images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update meeting images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete meeting images" ON storage.objects;

-- Create new permissive policies for custom auth system
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
