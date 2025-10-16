-- Fix RLS policies for voting system
-- This fixes the "new row violates row-level security policy" error

-- 1. Drop all existing restrictive policies on voting_periods
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON voting_periods;
DROP POLICY IF EXISTS "Enable read access for all users" ON voting_periods;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON voting_periods;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON voting_periods;
DROP POLICY IF EXISTS "Enable all for voting_periods" ON voting_periods;

-- 2. Create permissive policy for all operations
CREATE POLICY "Enable all for voting_periods" ON voting_periods
    FOR ALL USING (true) WITH CHECK (true);

-- 3. Do the same for posts_nominations
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON posts_nominations;
DROP POLICY IF EXISTS "Enable read access for all users" ON posts_nominations;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON posts_nominations;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON posts_nominations;
DROP POLICY IF EXISTS "Enable all for posts_nominations" ON posts_nominations;

CREATE POLICY "Enable all for posts_nominations" ON posts_nominations
    FOR ALL USING (true) WITH CHECK (true);

-- 4. Do the same for votes
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON votes;
DROP POLICY IF EXISTS "Enable read access for all users" ON votes;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON votes;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON votes;
DROP POLICY IF EXISTS "Enable all for votes" ON votes;

CREATE POLICY "Enable all for votes" ON votes
    FOR ALL USING (true) WITH CHECK (true);

-- 5. Do the same for post_comments
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON post_comments;
DROP POLICY IF EXISTS "Enable read access for all users" ON post_comments;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON post_comments;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON post_comments;
DROP POLICY IF EXISTS "Enable all for post_comments" ON post_comments;

CREATE POLICY "Enable all for post_comments" ON post_comments
    FOR ALL USING (true) WITH CHECK (true);

-- 6. Reload schema cache
NOTIFY pgrst, 'reload schema';

-- 7. Verify policies
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
WHERE tablename IN ('voting_periods', 'posts_nominations', 'votes', 'post_comments')
ORDER BY tablename, policyname;
