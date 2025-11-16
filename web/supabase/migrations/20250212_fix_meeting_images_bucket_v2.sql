-- Fix meeting-images bucket RLS policies with proper syntax

-- Step 1: Drop ALL existing policies (including any with wrong syntax)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname LIKE '%meeting%image%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
    END LOOP;
END $$;

-- Step 2: Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('meeting-images', 'meeting-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Step 3: Create policies with proper WITH CHECK clauses

-- SELECT policy (read access)
CREATE POLICY "meeting_images_select_policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'meeting-images');

-- INSERT policy (upload access) - WITH CHECK is crucial for INSERT
CREATE POLICY "meeting_images_insert_policy"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'meeting-images');

-- UPDATE policy (update access)
CREATE POLICY "meeting_images_update_policy"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'meeting-images')
WITH CHECK (bucket_id = 'meeting-images');

-- DELETE policy (delete access)
CREATE POLICY "meeting_images_delete_policy"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'meeting-images');

-- Step 4: Verify the setup
SELECT 'Bucket status:' as info;
SELECT id, name, public, created_at
FROM storage.buckets
WHERE id = 'meeting-images';

SELECT 'Policies status:' as info;
SELECT
    policyname,
    cmd,
    CASE
        WHEN qual IS NULL THEN 'NULL (WARNING!)'
        ELSE qual::text
    END as using_clause,
    CASE
        WHEN with_check IS NULL THEN 'NULL'
        ELSE with_check::text
    END as with_check_clause
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND policyname LIKE '%meeting_images%'
ORDER BY cmd;
