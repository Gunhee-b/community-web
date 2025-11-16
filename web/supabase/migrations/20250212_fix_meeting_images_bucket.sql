-- Fix meeting-images bucket to be public and ensure proper RLS policies

-- First, check if bucket exists and update it to be public
UPDATE storage.buckets
SET public = true
WHERE id = 'meeting-images';

-- If bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public)
VALUES ('meeting-images', 'meeting-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop all existing policies for meeting-images to start fresh
DROP POLICY IF EXISTS "Anyone can upload meeting images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for meeting images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update meeting images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete meeting images" ON storage.objects;

-- Create new permissive policies
-- Allow anyone to read (SELECT) objects in meeting-images bucket
CREATE POLICY "Public read access for meeting images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'meeting-images');

-- Allow anyone to insert objects into meeting-images bucket
CREATE POLICY "Anyone can upload meeting images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'meeting-images');

-- Allow anyone to update objects in meeting-images bucket
CREATE POLICY "Anyone can update meeting images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'meeting-images');

-- Allow anyone to delete objects from meeting-images bucket
CREATE POLICY "Anyone can delete meeting images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'meeting-images');

-- Verify the bucket is public
SELECT id, name, public, created_at
FROM storage.buckets
WHERE id = 'meeting-images';

-- Verify the policies are created
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND policyname LIKE '%meeting images%';
