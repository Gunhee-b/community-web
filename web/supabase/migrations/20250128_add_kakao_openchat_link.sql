-- Add kakao_openchat_link column to offline_meetings table
ALTER TABLE offline_meetings
ADD COLUMN IF NOT EXISTS kakao_openchat_link TEXT;

-- Add comment to the column
COMMENT ON COLUMN offline_meetings.kakao_openchat_link IS 'Kakao open chat link for the meeting';
