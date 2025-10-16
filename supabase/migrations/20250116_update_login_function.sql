-- Update login_user function to check is_active status

CREATE OR REPLACE FUNCTION login_user(
  p_username TEXT,
  p_password TEXT
) RETURNS JSON AS $$
DECLARE
  v_user users%ROWTYPE;
  v_password_valid BOOLEAN;
BEGIN
  -- Get user by username
  SELECT * INTO v_user
  FROM users
  WHERE username = p_username;

  -- Check if user exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', '아이디 또는 비밀번호가 잘못되었습니다'
    );
  END IF;

  -- Check if user account is active
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
