-- Automatic generation of weekly regular meetings
-- 정기 모임을 매주 자동으로 생성하는 시스템

-- 0. Drop existing views first (they will be recreated later)
DROP VIEW IF EXISTS active_regular_meetings CASCADE;
DROP VIEW IF EXISTS regular_meeting_templates CASCADE;

-- 1. Add columns to track regular meeting template and generated instances
-- Use IF NOT EXISTS to avoid errors if columns already exist
DO $$
BEGIN
    -- Add is_template column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'offline_meetings' AND column_name = 'is_template') THEN
        ALTER TABLE offline_meetings ADD COLUMN is_template BOOLEAN DEFAULT false NOT NULL;
    END IF;

    -- Add template_id column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'offline_meetings' AND column_name = 'template_id') THEN
        ALTER TABLE offline_meetings ADD COLUMN template_id UUID REFERENCES offline_meetings(id) ON DELETE SET NULL;
    END IF;

    -- Add week_number column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'offline_meetings' AND column_name = 'week_number') THEN
        ALTER TABLE offline_meetings ADD COLUMN week_number INTEGER;
    END IF;

    -- Add generated_at column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'offline_meetings' AND column_name = 'generated_at') THEN
        ALTER TABLE offline_meetings ADD COLUMN generated_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add recurrence_end_time column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'offline_meetings' AND column_name = 'recurrence_end_time') THEN
        ALTER TABLE offline_meetings ADD COLUMN recurrence_end_time TIME;
    END IF;
END $$;

-- 2. Create index for template meetings (if not exists)
CREATE INDEX IF NOT EXISTS idx_offline_meetings_template ON offline_meetings(is_template, meeting_type) WHERE is_template = true;
CREATE INDEX IF NOT EXISTS idx_offline_meetings_template_id ON offline_meetings(template_id, week_number);

-- 3. Function to calculate next meeting datetime based on day of week and time
CREATE OR REPLACE FUNCTION get_next_meeting_datetime(
    p_day_of_week INTEGER,  -- 0 = Sunday, 6 = Saturday
    p_time TIME,
    p_from_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    base_date TIMESTAMP WITH TIME ZONE;
    target_date TIMESTAMP WITH TIME ZONE;
    current_day INTEGER;
    days_until_target INTEGER;
BEGIN
    -- Use provided date or current date in Seoul timezone
    base_date := COALESCE(p_from_date, timezone('Asia/Seoul', NOW()));

    -- Get current day of week (0 = Sunday, 6 = Saturday)
    current_day := EXTRACT(DOW FROM base_date)::INTEGER;

    -- Calculate days until target day
    days_until_target := (p_day_of_week - current_day + 7) % 7;

    -- If target day is today but time has passed, add 7 days
    IF days_until_target = 0 THEN
        IF p_time <= base_date::TIME THEN
            days_until_target := 7;
        END IF;
    END IF;

    -- Calculate target datetime
    target_date := (base_date::DATE + days_until_target) + p_time;

    RETURN target_date;
END;
$$ LANGUAGE plpgsql;

-- 4. Function to generate a single meeting instance from template
CREATE OR REPLACE FUNCTION generate_meeting_from_template(
    p_template_id UUID,
    p_week_number INTEGER
)
RETURNS UUID AS $$
DECLARE
    template_record RECORD;
    new_meeting_id UUID;
    meeting_datetime TIMESTAMP WITH TIME ZONE;
    end_datetime TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get template meeting
    SELECT * INTO template_record
    FROM offline_meetings
    WHERE id = p_template_id AND is_template = true AND meeting_type = 'regular';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template meeting not found or not a regular template';
    END IF;

    -- Check if meeting for this week already exists
    IF EXISTS (
        SELECT 1 FROM offline_meetings
        WHERE template_id = p_template_id
        AND week_number = p_week_number
    ) THEN
        RAISE NOTICE 'Meeting for week % already exists', p_week_number;
        RETURN NULL;
    END IF;

    -- Calculate meeting datetime for this week
    meeting_datetime := get_next_meeting_datetime(
        template_record.recurrence_day_of_week,
        template_record.recurrence_time,
        timezone('Asia/Seoul', NOW())
    );

    -- Add week offset
    meeting_datetime := meeting_datetime + ((p_week_number - 1) * INTERVAL '7 days');

    -- Set end time from template or 2 hours after start by default
    IF template_record.recurrence_end_time IS NOT NULL THEN
        -- Use template's end time
        end_datetime := (meeting_datetime::DATE) + template_record.recurrence_end_time;
    ELSE
        -- Default: 2 hours after start
        end_datetime := meeting_datetime + INTERVAL '2 hours';
    END IF;

    -- Create new meeting instance
    INSERT INTO offline_meetings (
        host_id,
        location,
        host_introduction,
        description,
        host_style,
        host_sns_link,
        kakao_openchat_link,
        start_datetime,
        end_datetime,
        max_participants,
        purpose,
        status,
        image_url,
        meeting_type,
        recurrence_day_of_week,
        recurrence_time,
        recurrence_end_time,
        is_template,
        template_id,
        week_number,
        generated_at
    ) VALUES (
        template_record.host_id,
        template_record.location,
        template_record.host_introduction,
        template_record.description,
        template_record.host_style,
        template_record.host_sns_link,
        template_record.kakao_openchat_link,
        meeting_datetime,
        end_datetime,
        template_record.max_participants,
        template_record.purpose,
        'recruiting',
        template_record.image_url,
        'regular',
        template_record.recurrence_day_of_week,
        template_record.recurrence_time,
        template_record.recurrence_end_time,
        false,
        p_template_id,
        p_week_number,
        timezone('Asia/Seoul', NOW())
    ) RETURNING id INTO new_meeting_id;

    -- Auto-join host as participant
    INSERT INTO meeting_participants (meeting_id, user_id)
    VALUES (new_meeting_id, template_record.host_id);

    RETURN new_meeting_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to generate next week's meetings for all active templates
CREATE OR REPLACE FUNCTION generate_next_week_meetings()
RETURNS TABLE(template_id UUID, new_meeting_id UUID, week_number INTEGER) AS $$
DECLARE
    template_record RECORD;
    next_week INTEGER;
    generated_id UUID;
BEGIN
    -- Get all active regular meeting templates
    FOR template_record IN
        SELECT id FROM offline_meetings
        WHERE is_template = true
        AND meeting_type = 'regular'
        AND status = 'recruiting'
    LOOP
        -- Calculate next week number
        SELECT COALESCE(MAX(week_number), 0) + 1 INTO next_week
        FROM offline_meetings
        WHERE offline_meetings.template_id = template_record.id;

        -- Generate meeting for next week
        BEGIN
            generated_id := generate_meeting_from_template(template_record.id, next_week);

            IF generated_id IS NOT NULL THEN
                template_id := template_record.id;
                new_meeting_id := generated_id;
                week_number := next_week;
                RETURN NEXT;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error generating meeting for template %: %', template_record.id, SQLERRM;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to auto-generate meetings (called by cron or manually)
CREATE OR REPLACE FUNCTION auto_generate_weekly_meetings()
RETURNS TEXT AS $$
DECLARE
    result_count INTEGER := 0;
    result_record RECORD;
    result_text TEXT := '';
BEGIN
    -- Generate meetings for next week
    FOR result_record IN
        SELECT * FROM generate_next_week_meetings()
    LOOP
        result_count := result_count + 1;
        result_text := result_text || format('Generated meeting %s from template %s (week %s)\n',
            result_record.new_meeting_id,
            result_record.template_id,
            result_record.week_number);
    END LOOP;

    IF result_count = 0 THEN
        RETURN 'No meetings generated. All templates may already have meetings for next week.';
    ELSE
        RETURN format('Successfully generated %s meeting(s):\n%s', result_count, result_text);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant execute permissions
GRANT EXECUTE ON FUNCTION get_next_meeting_datetime(INTEGER, TIME, TIMESTAMP WITH TIME ZONE) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_meeting_from_template(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_next_week_meetings() TO authenticated;
GRANT EXECUTE ON FUNCTION auto_generate_weekly_meetings() TO authenticated;

-- 8. Add comments for documentation
COMMENT ON COLUMN offline_meetings.is_template IS '템플릿 모임 여부 (true면 실제 모임이 아닌 템플릿)';
COMMENT ON COLUMN offline_meetings.template_id IS '이 모임을 생성한 템플릿 모임의 ID';
COMMENT ON COLUMN offline_meetings.week_number IS '템플릿으로부터 생성된 몇 번째 주차 모임인지 (1부터 시작)';
COMMENT ON COLUMN offline_meetings.generated_at IS '자동 생성된 시각';
COMMENT ON COLUMN offline_meetings.recurrence_end_time IS '정기 모임 종료 시간 (예: 21:00)';

COMMENT ON FUNCTION generate_meeting_from_template(UUID, INTEGER) IS '템플릿으로부터 특정 주차의 모임 생성';
COMMENT ON FUNCTION generate_next_week_meetings() IS '모든 활성 템플릿의 다음 주 모임 생성';
COMMENT ON FUNCTION auto_generate_weekly_meetings() IS '매주 자동으로 호출되어 모임 생성 (cron job용)';

-- 9. Create a view for active regular meetings (excluding templates)
CREATE OR REPLACE VIEW active_regular_meetings AS
SELECT
    m.*,
    t.location as template_location,
    COUNT(DISTINCT mp.user_id) as participant_count
FROM offline_meetings m
LEFT JOIN offline_meetings t ON m.template_id = t.id
LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id AND mp.cancelled_at IS NULL
WHERE m.meeting_type = 'regular'
AND m.is_template = false
AND m.status IN ('recruiting', 'confirmed')
GROUP BY m.id, t.location;

-- 10. Create a view for regular meeting templates
CREATE OR REPLACE VIEW regular_meeting_templates AS
SELECT
    m.*,
    COUNT(DISTINCT generated.id) as total_generated_meetings,
    MAX(generated.week_number) as last_week_number,
    u.username as host_name
FROM offline_meetings m
LEFT JOIN offline_meetings generated ON generated.template_id = m.id
LEFT JOIN users u ON m.host_id = u.id
WHERE m.is_template = true
AND m.meeting_type = 'regular'
GROUP BY m.id, u.username;

COMMENT ON VIEW active_regular_meetings IS '활성화된 정기 모임 목록 (템플릿 제외)';
COMMENT ON VIEW regular_meeting_templates IS '정기 모임 템플릿 목록 및 통계';
