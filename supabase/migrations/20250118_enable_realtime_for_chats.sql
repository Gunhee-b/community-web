-- Enable Realtime for meeting_chats table
-- This allows real-time updates for chat messages

-- Add meeting_chats to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE meeting_chats;

-- Grant necessary permissions for realtime to work
GRANT SELECT ON meeting_chats TO anon;
GRANT INSERT ON meeting_chats TO anon;

-- Add RLS policy to allow users to see chats for meetings they're participating in
-- (if not already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'meeting_chats'
    AND policyname = 'Users can view chats for their meetings'
  ) THEN
    CREATE POLICY "Users can view chats for their meetings"
    ON meeting_chats
    FOR SELECT
    TO anon
    USING (
      EXISTS (
        SELECT 1 FROM meeting_participants
        WHERE meeting_participants.meeting_id = meeting_chats.meeting_id
        AND meeting_participants.cancelled_at IS NULL
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'meeting_chats'
    AND policyname = 'Participants can send chats'
  ) THEN
    CREATE POLICY "Participants can send chats"
    ON meeting_chats
    FOR INSERT
    TO anon
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM meeting_participants
        WHERE meeting_participants.meeting_id = meeting_chats.meeting_id
        AND meeting_participants.cancelled_at IS NULL
      )
    );
  END IF;
END $$;
