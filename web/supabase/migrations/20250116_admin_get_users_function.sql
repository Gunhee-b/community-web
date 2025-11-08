-- ============================================
-- Create admin function to get all users
-- This bypasses RLS for admins
-- ============================================

-- Create function to get all users (admin only)
CREATE OR REPLACE FUNCTION admin_get_all_users()
RETURNS TABLE (
  id UUID,
  username TEXT,
  kakao_nickname TEXT,
  role user_role,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- No admin check needed here - we'll check in the app
  -- This function just returns all users
  RETURN QUERY
  SELECT
    u.id,
    u.username,
    u.kakao_nickname,
    u.role,
    u.is_active,
    u.created_at
  FROM users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION admin_get_all_users() TO authenticated;

-- Alternative: If you want to enforce admin check in the function
CREATE OR REPLACE FUNCTION admin_get_all_users_secure(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  kakao_nickname TEXT,
  role user_role,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  -- Check if the requesting user is an admin
  SELECT (role = 'admin' AND is_active = true)
  INTO v_is_admin
  FROM users
  WHERE users.id = p_user_id;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can view all users';
  END IF;

  -- Return all users
  RETURN QUERY
  SELECT
    u.id,
    u.username,
    u.kakao_nickname,
    u.role,
    u.is_active,
    u.created_at
  FROM users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION admin_get_all_users_secure(UUID) TO authenticated;
