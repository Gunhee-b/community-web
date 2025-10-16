-- ============================================
-- EMERGENCY FIX: Remove infinite recursion in RLS policies
-- ============================================

-- First, disable RLS on all tables immediately
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS voting_periods DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS posts_nominations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS post_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS offline_meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS meeting_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS meeting_chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invitation_codes DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies on users table (this is causing infinite recursion)
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can update any user" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;

-- Drop ALL policies on all other tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Grant all permissions to anon and authenticated roles
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;
-- This should return no rows

-- Verify no policies exist
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
-- This should return no rows
