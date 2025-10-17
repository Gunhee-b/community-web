-- Add end_datetime column to offline_meetings table
ALTER TABLE offline_meetings
ADD COLUMN end_datetime TIMESTAMP WITH TIME ZONE;

-- Rename meeting_datetime to start_datetime for clarity
ALTER TABLE offline_meetings
RENAME COLUMN meeting_datetime TO start_datetime;

-- For existing meetings, set end_datetime to 2 hours after start_datetime
UPDATE offline_meetings
SET end_datetime = start_datetime + INTERVAL '2 hours'
WHERE end_datetime IS NULL;

-- Make end_datetime required for new meetings
ALTER TABLE offline_meetings
ALTER COLUMN end_datetime SET NOT NULL;

-- Add check constraint to ensure end_datetime is after start_datetime
ALTER TABLE offline_meetings
ADD CONSTRAINT check_end_after_start CHECK (end_datetime > start_datetime);

-- Update index
DROP INDEX IF EXISTS idx_offline_meetings_status;
CREATE INDEX idx_offline_meetings_status ON offline_meetings(status, start_datetime);
