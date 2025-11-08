-- ============================================
-- Add host introduction fields to offline_meetings table
-- ============================================

-- Add host_introduction column (모임장 소개)
ALTER TABLE offline_meetings
ADD COLUMN host_introduction TEXT;

-- Add host_style column (모임 운영 방식 및 스타일)
ALTER TABLE offline_meetings
ADD COLUMN host_style TEXT;

-- Add host_sns_link column (모임장 소개 SNS 링크)
ALTER TABLE offline_meetings
ADD COLUMN host_sns_link TEXT;

-- Add comments
COMMENT ON COLUMN offline_meetings.host_introduction IS
'Introduction about the meeting host';

COMMENT ON COLUMN offline_meetings.host_style IS
'Meeting operation style and management approach';

COMMENT ON COLUMN offline_meetings.host_sns_link IS
'SNS link for host introduction';
