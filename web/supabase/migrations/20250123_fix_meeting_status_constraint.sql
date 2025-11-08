-- ============================================
-- Fix meeting status check constraint to allow 'confirmed'
-- ============================================

-- First, drop the existing check constraint
ALTER TABLE offline_meetings
DROP CONSTRAINT IF EXISTS offline_meetings_status_check;

-- Add new check constraint that includes 'confirmed'
ALTER TABLE offline_meetings
ADD CONSTRAINT offline_meetings_status_check
CHECK (status IN ('recruiting', 'closed', 'confirmed'));

-- Add comment
COMMENT ON CONSTRAINT offline_meetings_status_check ON offline_meetings IS
'Allows status values: recruiting, closed, confirmed';
