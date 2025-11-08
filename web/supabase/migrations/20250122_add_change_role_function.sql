-- Function to change user role (admin only)
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION change_user_role(UUID, user_role, UUID) TO anon;
GRANT EXECUTE ON FUNCTION change_user_role(UUID, user_role, UUID) TO authenticated;
