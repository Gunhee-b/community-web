-- ============================================
-- Add description column to offline_meetings table
-- ============================================

-- Add description column (optional)
ALTER TABLE offline_meetings
ADD COLUMN description TEXT;

-- Add comment
COMMENT ON COLUMN offline_meetings.description IS
'Description or details about the meeting purpose and activities';
