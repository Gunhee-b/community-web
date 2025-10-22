-- ============================================
-- Add 'confirmed' status to meeting_status enum
-- ============================================

-- Add 'confirmed' to the meeting_status enum
-- Note: PostgreSQL doesn't allow direct ALTER TYPE, so we need to recreate
ALTER TYPE meeting_status ADD VALUE IF NOT EXISTS 'confirmed';

-- Create function to confirm meeting (only host can confirm)
CREATE OR REPLACE FUNCTION confirm_meeting(
    p_meeting_id UUID,
    p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_is_host BOOLEAN;
    v_result JSON;
BEGIN
    -- Check if user is the host of this meeting
    SELECT EXISTS(
        SELECT 1 FROM offline_meetings
        WHERE id = p_meeting_id
        AND host_id = p_user_id
    ) INTO v_is_host;

    IF NOT v_is_host THEN
        RETURN json_build_object(
            'success', false,
            'error', '모임장만 모임을 확정할 수 있습니다'
        );
    END IF;

    -- Update meeting status to confirmed
    UPDATE offline_meetings
    SET status = 'confirmed'
    WHERE id = p_meeting_id;

    -- Return success
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
