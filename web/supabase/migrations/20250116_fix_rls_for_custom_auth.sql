-- ============================================
-- Fix RLS policies for custom authentication
-- Since auth.uid() returns null with custom auth,
-- we'll use a different approach with service role
-- ============================================

-- For custom authentication, we have two options:
-- 1. Disable RLS and handle permissions in application (simpler but less secure)
-- 2. Use service role key in backend (more secure but more complex)

-- Option 1: Disable RLS for simplicity (recommended for this use case)
-- The application will handle all permission checks

-- Drop all existing policies first
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE voting_periods DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts_nominations DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE offline_meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_codes DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated and anon roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Important: Since we disabled RLS, make sure your application code
-- properly validates user permissions before any database operations
-- Especially for:
-- - Admin-only operations (user management, etc.)
-- - User-specific data access (own profile, own votes, etc.)
