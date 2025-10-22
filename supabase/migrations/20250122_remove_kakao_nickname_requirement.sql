-- ============================================
-- Remove kakao_nickname requirement from users table
-- Run this in Supabase SQL Editor
-- ============================================

-- Make kakao_nickname column nullable and remove UNIQUE constraint
ALTER TABLE users
ALTER COLUMN kakao_nickname DROP NOT NULL;

-- Drop the unique constraint on kakao_nickname
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_kakao_nickname_key;

-- Update the register_user function to remove kakao_nickname parameter
DROP FUNCTION IF EXISTS register_user(TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION register_user(
    p_username TEXT,
    p_password TEXT,
    p_invitation_code TEXT
)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_code_valid BOOLEAN;
    v_username_exists BOOLEAN;
    v_result JSON;
BEGIN
    -- Check if invitation code is valid
    SELECT EXISTS(
        SELECT 1 FROM invitation_codes
        WHERE code = p_invitation_code
        AND NOT is_used
        AND expires_at > NOW()
    ) INTO v_code_valid;

    IF NOT v_code_valid THEN
        RETURN json_build_object(
            'success', false,
            'error', '유효하지 않은 초대 코드입니다'
        );
    END IF;

    -- Check if username already exists
    SELECT EXISTS(
        SELECT 1 FROM users
        WHERE username = p_username
    ) INTO v_username_exists;

    IF v_username_exists THEN
        RETURN json_build_object(
            'success', false,
            'error', '이미 사용 중인 아이디입니다'
        );
    END IF;

    -- Create user with hashed password using crypt
    INSERT INTO users (username, password_hash)
    VALUES (
        p_username,
        crypt(p_password, gen_salt('bf', 10))  -- bcrypt with 10 rounds
    )
    RETURNING id INTO v_user_id;

    -- Mark invitation code as used
    UPDATE invitation_codes
    SET is_used = true, used_by = v_user_id
    WHERE code = p_invitation_code;

    -- Return success with user data
    SELECT json_build_object(
        'success', true,
        'user', row_to_json(u.*)
    ) INTO v_result
    FROM users u
    WHERE u.id = v_user_id;

    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to anon role
GRANT EXECUTE ON FUNCTION register_user(TEXT, TEXT, TEXT) TO anon;
