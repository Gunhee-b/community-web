-- ============================================
-- Fix leave_meeting function
-- Remove reference to non-existent anonymous_name column
-- ============================================

-- Drop and recreate the function with correct logic
DROP FUNCTION IF EXISTS leave_meeting(UUID, UUID);

CREATE OR REPLACE FUNCTION leave_meeting(
    p_meeting_id UUID,
    p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_is_participant BOOLEAN;
    v_host_id UUID;
    v_participant_number INTEGER;
    v_anonymous_name TEXT;
    v_result JSON;
BEGIN
    -- Check if user is a participant and get host_id
    SELECT
        EXISTS(
            SELECT 1 FROM meeting_participants
            WHERE meeting_id = p_meeting_id
            AND user_id = p_user_id
            AND cancelled_at IS NULL
        ),
        (SELECT host_id FROM offline_meetings WHERE id = p_meeting_id)
    INTO v_is_participant, v_host_id;

    -- Check if meeting exists
    IF v_host_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', '모임을 찾을 수 없습니다'
        );
    END IF;

    -- Check if user is the host
    IF p_user_id = v_host_id THEN
        RETURN json_build_object(
            'success', false,
            'error', '모임장은 모임을 나갈 수 없습니다. 모임을 삭제해주세요.'
        );
    END IF;

    -- Check if user is a participant
    IF NOT v_is_participant THEN
        RETURN json_build_object(
            'success', false,
            'error', '참가하지 않은 모임입니다'
        );
    END IF;

    -- Get participant number (for anonymous name)
    SELECT COUNT(*) INTO v_participant_number
    FROM meeting_participants
    WHERE meeting_id = p_meeting_id
    AND cancelled_at IS NULL
    AND joined_at <= (
        SELECT joined_at FROM meeting_participants
        WHERE meeting_id = p_meeting_id
        AND user_id = p_user_id
        AND cancelled_at IS NULL
    );

    -- Create anonymous name
    v_anonymous_name := '참가자' || v_participant_number::TEXT;

    -- Delete the participant record
    DELETE FROM meeting_participants
    WHERE meeting_id = p_meeting_id
    AND user_id = p_user_id;

    -- Return success with host_id for notification
    SELECT json_build_object(
        'success', true,
        'host_id', v_host_id,
        'anonymous_name', v_anonymous_name
    ) INTO v_result;

    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION leave_meeting(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION leave_meeting(UUID, UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION leave_meeting(UUID, UUID) IS
'Allows participants to leave a meeting. Host cannot leave their own meeting.';
