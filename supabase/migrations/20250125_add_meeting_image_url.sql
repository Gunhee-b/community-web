-- Add image_url column to offline_meetings table
-- This column will store the URL of the meeting image uploaded to Supabase Storage

ALTER TABLE offline_meetings
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN offline_meetings.image_url IS 'URL of the meeting image stored in Supabase Storage';
