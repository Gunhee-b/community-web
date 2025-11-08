-- Add meeting types for regular vs casual meetings
-- 정기 모임(regular)과 즉흥 모임(casual) 구분
-- 즉흥 모임은 취미(hobby)와 토론(discussion)으로 세분화

-- 1. Create new enums for meeting types
CREATE TYPE meeting_type AS ENUM ('regular', 'casual');
CREATE TYPE casual_meeting_type AS ENUM ('hobby', 'discussion');

-- 2. Add new columns to offline_meetings table
ALTER TABLE offline_meetings
ADD COLUMN meeting_type meeting_type DEFAULT 'casual' NOT NULL,
ADD COLUMN casual_meeting_type casual_meeting_type,
ADD COLUMN recurrence_day_of_week INTEGER CHECK (recurrence_day_of_week BETWEEN 0 AND 6),
ADD COLUMN recurrence_time TIME;

-- 3. Update existing data - set all existing meetings to hobby type
-- 기존 모임들을 모두 취미 모임으로 설정
UPDATE offline_meetings
SET casual_meeting_type = 'hobby'
WHERE meeting_type = 'casual' AND casual_meeting_type IS NULL;

-- 4. Add constraints (after updating existing data)
-- 정기 모임일 경우 recurrence_day_of_week와 recurrence_time은 필수
ALTER TABLE offline_meetings
ADD CONSTRAINT check_regular_meeting_has_recurrence
CHECK (
  (meeting_type = 'regular' AND recurrence_day_of_week IS NOT NULL AND recurrence_time IS NOT NULL) OR
  (meeting_type = 'casual')
);

-- 즉흥 모임일 경우 casual_meeting_type은 필수
ALTER TABLE offline_meetings
ADD CONSTRAINT check_casual_meeting_has_type
CHECK (
  (meeting_type = 'casual' AND casual_meeting_type IS NOT NULL) OR
  (meeting_type = 'regular')
);

-- 5. Add comments for documentation
COMMENT ON COLUMN offline_meetings.meeting_type IS '모임 유형: regular(정기), casual(즉흥)';
COMMENT ON COLUMN offline_meetings.casual_meeting_type IS '즉흥 모임 세부 유형: hobby(취미), discussion(토론)';
COMMENT ON COLUMN offline_meetings.recurrence_day_of_week IS '정기 모임 요일: 0(일요일) ~ 6(토요일)';
COMMENT ON COLUMN offline_meetings.recurrence_time IS '정기 모임 시간 (예: 19:00)';

-- 6. Create index for filtering
CREATE INDEX idx_offline_meetings_type ON offline_meetings(meeting_type, status);
