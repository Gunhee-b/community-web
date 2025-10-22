-- ============================================
-- Add confirm_meeting function only
-- No enum changes needed - status column accepts text values
-- ============================================

-- Create function to confirm meeting (only host can confirm)
CREATE OR REPLACE FUNCTION confirm_meeting(
    p_meeting_id UUID,
    p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_is_host BOOLEAN;
    v_current_status TEXT;
    v_result JSON;
BEGIN
    -- Check if user is the host of this meeting
    SELECT
        (host_id = p_user_id),
        status
    INTO v_is_host, v_current_status
    FROM offline_meetings
    WHERE id = p_meeting_id;

    -- Check if meeting exists
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', '모임을 찾을 수 없습니다'
        );
    END IF;

    -- Check if user is the host
    IF NOT v_is_host THEN
        RETURN json_build_object(
            'success', false,
            'error', '모임장만 모임을 확정할 수 있습니다'
        );
    END IF;

    -- Check if already confirmed or closed
    IF v_current_status = 'confirmed' THEN
        RETURN json_build_object(
            'success', false,
            'error', '이미 확정된 모임입니다'
        );
    END IF;

    IF v_current_status = 'closed' THEN
        RETURN json_build_object(
            'success', false,
            'error', '마감된 모임은 확정할 수 없습니다'
        );
    END IF;

    -- Update meeting status to confirmed
    UPDATE offline_meetings
    SET status = 'confirmed'
    WHERE id = p_meeting_id;

    -- Return success with updated meeting data
    SELECT json_build_object(
        'success', true,
        'meeting', row_to_json(m.*)
    ) INTO v_result
    FROM offline_meetings m
    WHERE m.id = p_meeting_id;

    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION confirm_meeting(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION confirm_meeting(UUID, UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION confirm_meeting(UUID, UUID) IS
'Allows meeting host to confirm a meeting, preventing new participants from joining';
