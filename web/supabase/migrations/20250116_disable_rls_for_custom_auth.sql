-- ============================================
-- Disable RLS for custom authentication
-- Since we're using custom auth (not Supabase Auth),
-- we'll handle permissions at the application level
-- ============================================

-- Disable RLS on all tables
-- Note: Make sure your application properly checks user permissions

-- Users table - keep RLS but simplify policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Voting periods table
ALTER TABLE voting_periods DISABLE ROW LEVEL SECURITY;

-- Posts nominations table
ALTER TABLE posts_nominations DISABLE ROW LEVEL SECURITY;

-- Votes table
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;

-- Post comments table
ALTER TABLE post_comments DISABLE ROW LEVEL SECURITY;

-- Offline meetings table
ALTER TABLE offline_meetings DISABLE ROW LEVEL SECURITY;

-- Meeting participants table
ALTER TABLE meeting_participants DISABLE ROW LEVEL SECURITY;

-- Meeting chats table
ALTER TABLE meeting_chats DISABLE ROW LEVEL SECURITY;

-- Invitation codes table
ALTER TABLE invitation_codes DISABLE ROW LEVEL SECURITY;

-- Grant SELECT, INSERT, UPDATE permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;

-- Note: This is less secure but necessary for custom auth
-- Make sure to implement proper permission checks in your application code
