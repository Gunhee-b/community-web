-- ============================================
-- Supabase Storage Setup for Meeting Images
-- ============================================
-- Run this SQL in Supabase SQL Editor

-- Step 1: Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('meeting-images', 'meeting-images', true, 5242880, ARRAY['image/*'])
ON CONFLICT (id) DO UPDATE
SET public = true, file_size_limit = 5242880, allowed_mime_types = ARRAY['image/*'];

-- Step 2: Remove any existing policies
DROP POLICY IF EXISTS "Anyone can upload meeting images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for meeting images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update meeting images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete meeting images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload meeting images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update meeting images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete meeting images" ON storage.objects;

-- Step 3: Create permissive policies (for custom auth system)
-- Allow anyone to upload
CREATE POLICY "Anyone can upload meeting images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'meeting-images');

-- Allow public read
CREATE POLICY "Public read access for meeting images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'meeting-images');

-- Allow anyone to update
CREATE POLICY "Anyone can update meeting images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'meeting-images');

-- Allow anyone to delete
CREATE POLICY "Anyone can delete meeting images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'meeting-images');

-- Step 4: Verify setup
SELECT
    'Bucket created: meeting-images' as status,
    public as is_public,
    file_size_limit as max_size_bytes,
    allowed_mime_types as allowed_types
FROM storage.buckets
WHERE id = 'meeting-images';

SELECT
    'Storage policies:' as info,
    policyname as policy_name,
    cmd as command,
    qual as using_expression
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND policyname LIKE '%meeting images%';
