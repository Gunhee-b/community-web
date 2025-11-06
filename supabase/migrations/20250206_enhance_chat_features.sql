-- Add image support to meeting_chats table
ALTER TABLE meeting_chats
ADD COLUMN image_url TEXT;

-- Create table for typing indicators (temporary real-time data)
CREATE TABLE IF NOT EXISTS meeting_typing_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES offline_meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Seoul', NOW()) NOT NULL,
    UNIQUE(meeting_id, user_id)
);

-- Create index for typing indicators
CREATE INDEX idx_meeting_typing_indicators_meeting ON meeting_typing_indicators(meeting_id, updated_at DESC);

-- Create table for read receipts
CREATE TABLE IF NOT EXISTS meeting_chat_read_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES meeting_chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Seoul', NOW()) NOT NULL,
    UNIQUE(chat_id, user_id)
);

-- Create index for read receipts
CREATE INDEX idx_meeting_chat_read_receipts_chat ON meeting_chat_read_receipts(chat_id);
CREATE INDEX idx_meeting_chat_read_receipts_user ON meeting_chat_read_receipts(user_id);

-- Enable RLS for new tables
ALTER TABLE meeting_typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_chat_read_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for typing indicators
-- Allow participants to view typing indicators
CREATE POLICY "Participants can view typing indicators"
ON meeting_typing_indicators FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM meeting_participants
        WHERE meeting_participants.meeting_id = meeting_typing_indicators.meeting_id
        AND meeting_participants.user_id = auth.uid()
        AND meeting_participants.cancelled_at IS NULL
    )
);

-- Allow participants to insert their own typing indicator
CREATE POLICY "Participants can insert their own typing indicator"
ON meeting_typing_indicators FOR INSERT
WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM meeting_participants
        WHERE meeting_participants.meeting_id = meeting_typing_indicators.meeting_id
        AND meeting_participants.user_id = auth.uid()
        AND meeting_participants.cancelled_at IS NULL
    )
);

-- Allow participants to update their own typing indicator
CREATE POLICY "Participants can update their own typing indicator"
ON meeting_typing_indicators FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow participants to delete their own typing indicator
CREATE POLICY "Participants can delete their own typing indicator"
ON meeting_typing_indicators FOR DELETE
USING (user_id = auth.uid());

-- RLS Policies for read receipts
-- Allow participants to view read receipts
CREATE POLICY "Participants can view read receipts"
ON meeting_chat_read_receipts FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM meeting_chats
        JOIN meeting_participants ON meeting_participants.meeting_id = meeting_chats.meeting_id
        WHERE meeting_chats.id = meeting_chat_read_receipts.chat_id
        AND meeting_participants.user_id = auth.uid()
        AND meeting_participants.cancelled_at IS NULL
    )
);

-- Allow participants to insert their own read receipts
CREATE POLICY "Participants can insert their own read receipts"
ON meeting_chat_read_receipts FOR INSERT
WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM meeting_chats
        JOIN meeting_participants ON meeting_participants.meeting_id = meeting_chats.meeting_id
        WHERE meeting_chats.id = meeting_chat_read_receipts.chat_id
        AND meeting_participants.user_id = auth.uid()
        AND meeting_participants.cancelled_at IS NULL
    )
);

-- Function to automatically clean up old typing indicators (older than 10 seconds)
CREATE OR REPLACE FUNCTION cleanup_old_typing_indicators()
RETURNS trigger AS $$
BEGIN
    DELETE FROM meeting_typing_indicators
    WHERE updated_at < timezone('Asia/Seoul', NOW()) - INTERVAL '10 seconds';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to clean up old typing indicators periodically
CREATE TRIGGER trigger_cleanup_old_typing_indicators
    AFTER INSERT OR UPDATE ON meeting_typing_indicators
    EXECUTE FUNCTION cleanup_old_typing_indicators();

-- Function to mark all messages in a meeting as read for a user
CREATE OR REPLACE FUNCTION mark_meeting_chats_as_read(
    p_meeting_id UUID,
    p_user_id UUID
)
RETURNS void AS $$
BEGIN
    -- Insert read receipts for all unread messages in the meeting
    INSERT INTO meeting_chat_read_receipts (chat_id, user_id)
    SELECT mc.id, p_user_id
    FROM meeting_chats mc
    WHERE mc.meeting_id = p_meeting_id
    AND mc.user_id != p_user_id  -- Don't mark own messages
    AND NOT EXISTS (
        SELECT 1 FROM meeting_chat_read_receipts rcr
        WHERE rcr.chat_id = mc.id
        AND rcr.user_id = p_user_id
    )
    ON CONFLICT (chat_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION mark_meeting_chats_as_read(UUID, UUID) TO authenticated;

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE meeting_typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE meeting_chat_read_receipts;

-- Comment for documentation
COMMENT ON TABLE meeting_typing_indicators IS 'Stores temporary typing indicators for meeting chats';
COMMENT ON TABLE meeting_chat_read_receipts IS 'Stores read receipts for meeting chat messages';
COMMENT ON COLUMN meeting_chats.image_url IS 'URL of image attached to chat message (optional)';
