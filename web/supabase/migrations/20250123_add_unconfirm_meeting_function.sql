-- ============================================
-- Add unconfirm_meeting function
-- Allows host/admin to cancel meeting confirmation
-- ============================================

-- Create function to unconfirm meeting (only host or admin can unconfirm)
CREATE OR REPLACE FUNCTION unconfirm_meeting(
    p_meeting_id UUID,
    p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_is_host BOOLEAN;
    v_is_admin BOOLEAN;
    v_current_status TEXT;
    v_result JSON;
BEGIN
    -- Check if user is the host or admin
    SELECT
        (m.host_id = p_user_id),
        (u.role = 'admin'),
        m.status
    INTO v_is_host, v_is_admin, v_current_status
    FROM offline_meetings m
    JOIN users u ON u.id = p_user_id
    WHERE m.id = p_meeting_id;

    -- Check if meeting exists
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', '모임을 찾을 수 없습니다'
        );
    END IF;

    -- Check if user is the host or admin
    IF NOT v_is_host AND NOT v_is_admin THEN
        RETURN json_build_object(
            'success', false,
            'error', '모임장 또는 관리자만 확정을 취소할 수 있습니다'
        );
    END IF;

    -- Check if meeting is confirmed
    IF v_current_status != 'confirmed' THEN
        RETURN json_build_object(
            'success', false,
            'error', '확정된 모임만 취소할 수 있습니다'
        );
    END IF;

    -- Update meeting status back to recruiting
    UPDATE offline_meetings
    SET status = 'recruiting'
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
GRANT EXECUTE ON FUNCTION unconfirm_meeting(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION unconfirm_meeting(UUID, UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION unconfirm_meeting(UUID, UUID) IS
'Allows meeting host or admin to cancel meeting confirmation, reopening it for new participants';
