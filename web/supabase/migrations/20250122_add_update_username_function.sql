-- ============================================
-- Add function to update username
-- ============================================

-- Create function to update username
CREATE OR REPLACE FUNCTION update_username(
    p_user_id UUID,
    p_new_username TEXT
)
RETURNS JSON AS $$
DECLARE
    v_username_exists BOOLEAN;
    v_result JSON;
BEGIN
    -- Check if new username already exists (excluding current user)
    SELECT EXISTS(
        SELECT 1 FROM users
        WHERE username = p_new_username
        AND id != p_user_id
    ) INTO v_username_exists;

    IF v_username_exists THEN
        RETURN json_build_object(
            'success', false,
            'error', '이미 사용 중인 닉네임입니다'
        );
    END IF;

    -- Update username
    UPDATE users
    SET username = p_new_username
    WHERE id = p_user_id;

    -- Return success with updated user data
    SELECT json_build_object(
        'success', true,
        'user', row_to_json(u.*)
    ) INTO v_result
    FROM users u
    WHERE u.id = p_user_id;

    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION update_username(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION update_username(UUID, TEXT) TO authenticated;
