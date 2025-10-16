-- Fix RLS policies for invitation_codes table to allow deletion
-- This fixes the delete functionality for invite codes

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON invitation_codes;
DROP POLICY IF EXISTS "Enable read access for all users" ON invitation_codes;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON invitation_codes;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON invitation_codes;
DROP POLICY IF EXISTS "Enable all for invitation_codes" ON invitation_codes;

-- Create permissive policy for all operations
CREATE POLICY "Enable all for invitation_codes" ON invitation_codes
    FOR ALL USING (true) WITH CHECK (true);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

-- Verify policies
SELECT
    tablename,
    policyname,
    cmd,
    CASE
        WHEN qual::text = 'true' THEN 'permissive (USING)'
        ELSE 'restrictive (USING)'
    END as using_type,
    CASE
        WHEN with_check::text = 'true' THEN 'permissive (CHECK)'
        WHEN with_check IS NULL THEN 'no check'
        ELSE 'restrictive (CHECK)'
    END as check_type
FROM pg_policies
WHERE tablename = 'invitation_codes'
ORDER BY policyname;
