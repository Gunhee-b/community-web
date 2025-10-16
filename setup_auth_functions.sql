-- ============================================
-- Setup Authentication Functions with Server-Side Password Hashing
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to register a new user (with server-side password hashing)
CREATE OR REPLACE FUNCTION register_user(
    p_username TEXT,
    p_kakao_nickname TEXT,
    p_password TEXT,
    p_invitation_code TEXT
)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_code_valid BOOLEAN;
    v_kakao_exists BOOLEAN;
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

    -- Check if kakao nickname already exists
    SELECT EXISTS(
        SELECT 1 FROM users
        WHERE kakao_nickname = p_kakao_nickname
    ) INTO v_kakao_exists;

    IF v_kakao_exists THEN
        RETURN json_build_object(
            'success', false,
            'error', '이미 가입된 카카오 닉네임입니다'
        );
    END IF;

    -- Create user with hashed password using crypt
    INSERT INTO users (username, kakao_nickname, password_hash)
    VALUES (
        p_username,
        p_kakao_nickname,
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

-- Function to login user (with server-side password verification)
CREATE OR REPLACE FUNCTION login_user(
    p_username TEXT,
    p_password TEXT
)
RETURNS JSON AS $$
DECLARE
    v_user users%ROWTYPE;
    v_password_valid BOOLEAN;
BEGIN
    -- Get user by username
    SELECT * INTO v_user
    FROM users
    WHERE username = p_username;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', '아이디 또는 비밀번호가 잘못되었습니다'
        );
    END IF;

    -- Check if user is active
    IF NOT v_user.is_active THEN
        RETURN json_build_object(
            'success', false,
            'error', '비활성화된 계정입니다'
        );
    END IF;

    -- Verify password using crypt
    SELECT (v_user.password_hash = crypt(p_password, v_user.password_hash))
    INTO v_password_valid;

    IF NOT v_password_valid THEN
        RETURN json_build_object(
            'success', false,
            'error', '아이디 또는 비밀번호가 잘못되었습니다'
        );
    END IF;

    -- Return success with user data
    RETURN json_build_object(
        'success', true,
        'user', row_to_json(v_user)
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to anon role
GRANT EXECUTE ON FUNCTION register_user(TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION login_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION validate_invitation_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION use_invitation_code(TEXT, UUID) TO anon;

-- Add INSERT policy for users table during registration
DROP POLICY IF EXISTS "Allow user registration" ON users;
CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (true);
