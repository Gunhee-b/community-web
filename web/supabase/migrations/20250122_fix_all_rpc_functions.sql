-- ============================================
-- Fix all RPC functions for custom auth system
-- This file recreates all necessary RPC functions
-- ============================================

-- 1. Get user by ID function (for session refresh)
CREATE OR REPLACE FUNCTION get_user_by_id(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user users%ROWTYPE;
BEGIN
  -- Get user by ID
  SELECT * INTO v_user
  FROM users
  WHERE id = p_user_id;

  -- Check if user exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Check if user is active
  IF NOT v_user.is_active THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Account is deactivated'
    );
  END IF;

  -- Return user data
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

-- Grant execute permissions for get_user_by_id
GRANT EXECUTE ON FUNCTION get_user_by_id(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_user_by_id(UUID) TO authenticated;


-- 2. Change user role function (admin only)
CREATE OR REPLACE FUNCTION change_user_role(
  p_user_id UUID,
  p_new_role user_role,
  p_admin_user_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_role user_role;
BEGIN
  -- Check if the requesting user is an admin
  SELECT role INTO v_admin_role
  FROM users
  WHERE id = p_admin_user_id;

  IF v_admin_role != 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', '권한이 없습니다'
    );
  END IF;

  -- Prevent changing own role
  IF p_user_id = p_admin_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', '자신의 역할은 변경할 수 없습니다'
    );
  END IF;

  -- Update user role
  UPDATE users
  SET role = p_new_role
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', '사용자를 찾을 수 없습니다'
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true
  );
END;
$$;

-- Grant execute permissions for change_user_role
GRANT EXECUTE ON FUNCTION change_user_role(UUID, user_role, UUID) TO anon;
GRANT EXECUTE ON FUNCTION change_user_role(UUID, user_role, UUID) TO authenticated;
