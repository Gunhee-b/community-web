-- Fix RLS policies for all meeting-related tables to allow deletion
-- This is required because the app uses custom authentication, not Supabase auth.uid()

-- 1. Fix meeting_participants table
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON meeting_participants;
DROP POLICY IF EXISTS "Users can delete their own participations" ON meeting_participants;
DROP POLICY IF EXISTS "Enable read access for all users" ON meeting_participants;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON meeting_participants;
DROP POLICY IF EXISTS "Enable all for meeting_participants" ON meeting_participants;

CREATE POLICY "Enable all for meeting_participants" ON meeting_participants
    FOR ALL USING (true) WITH CHECK (true);

-- 2. Fix meeting_chats table (if not already done)
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON meeting_chats;
DROP POLICY IF EXISTS "Enable all for meeting_chats" ON meeting_chats;

CREATE POLICY "Enable all for meeting_chats" ON meeting_chats
    FOR ALL USING (true) WITH CHECK (true);

-- 3. Fix offline_meetings table
DROP POLICY IF EXISTS "Enable delete for meeting host or admin" ON offline_meetings;
DROP POLICY IF EXISTS "Users can delete their own meetings" ON offline_meetings;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON offline_meetings;
DROP POLICY IF EXISTS "Enable delete for offline_meetings" ON offline_meetings;
DROP POLICY IF EXISTS "Enable read access for all users" ON offline_meetings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON offline_meetings;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON offline_meetings;
DROP POLICY IF EXISTS "Enable all for offline_meetings" ON offline_meetings;

CREATE POLICY "Enable all for offline_meetings" ON offline_meetings
    FOR ALL USING (true) WITH CHECK (true);

-- Verify all policies
SELECT
    tablename,
    policyname,
    cmd,
    CASE
        WHEN qual::text = 'true' THEN 'permissive'
        ELSE 'restrictive'
    END as policy_type
FROM pg_policies
WHERE tablename IN ('offline_meetings', 'meeting_participants', 'meeting_chats')
ORDER BY tablename, cmd;
