-- ============================================
-- Create function to get user by ID (for session refresh)
-- This bypasses RLS for authenticated users
-- ============================================

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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_by_id(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_user_by_id(UUID) TO authenticated;
