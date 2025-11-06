-- Create notifications table for persistent notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'meeting', 'chat', 'vote', 'question', etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    meeting_id UUID REFERENCES offline_meetings(id) ON DELETE CASCADE,
    related_id TEXT, -- Generic field for any related entity ID
    read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Seoul', NOW()) NOT NULL
);

-- Create index for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON notifications FOR DELETE
USING (user_id = auth.uid());

-- System can insert notifications for any user
-- This policy allows server-side inserts (through triggers or functions)
CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Function to create notification for all users when a new meeting is created
CREATE OR REPLACE FUNCTION notify_new_meeting()
RETURNS trigger AS $$
DECLARE
    meeting_type_text TEXT;
    meeting_purpose_text TEXT;
    host_name TEXT;
BEGIN
    -- Get host username
    SELECT username INTO host_name
    FROM users
    WHERE id = NEW.host_id;

    -- Determine meeting type text
    IF NEW.meeting_type = 'regular' THEN
        meeting_type_text := '정기 모임';
    ELSE
        IF NEW.casual_meeting_type = 'hobby' THEN
            meeting_type_text := '즉흥 취미 모임';
        ELSE
            meeting_type_text := '즉흥 토론 모임';
        END IF;
    END IF;

    -- Determine purpose text
    IF NEW.purpose = 'coffee' THEN
        meeting_purpose_text := '☕ 커피';
    ELSE
        meeting_purpose_text := '🍺 술';
    END IF;

    -- Insert notification for all active users except the host
    INSERT INTO notifications (user_id, type, title, message, meeting_id)
    SELECT
        id,
        'meeting',
        '🎉 새로운 모임이 오픈되었습니다!',
        meeting_type_text || ' | ' || meeting_purpose_text || ' | 📍 ' || NEW.location || ' | 👤 ' || host_name,
        NEW.id
    FROM users
    WHERE id != NEW.host_id
    AND is_active = true;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to send notifications when a new meeting is created
CREATE TRIGGER trigger_notify_new_meeting
    AFTER INSERT ON offline_meetings
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_meeting();

-- Function to get unread notification count for a user
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM notifications
        WHERE user_id = p_user_id
        AND read = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(p_user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE notifications
    SET read = true
    WHERE user_id = p_user_id
    AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION mark_all_notifications_as_read(UUID) TO authenticated;

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Comment for documentation
COMMENT ON TABLE notifications IS 'Stores persistent notifications for users across all features';
COMMENT ON FUNCTION notify_new_meeting() IS 'Automatically creates notifications for all users when a new meeting is created';
