-- ============================================
-- Fix admin functions for custom authentication
-- These functions now accept admin_user_id parameter instead of using auth.uid()
-- ============================================

-- Create user_role enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'member');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Drop existing functions
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS deactivate_user(UUID);
DROP FUNCTION IF EXISTS activate_user(UUID);
DROP FUNCTION IF EXISTS delete_user_permanently(UUID);
DROP FUNCTION IF EXISTS admin_get_all_users_secure(UUID);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  SELECT (role::text = 'admin' AND is_active = true)
  INTO v_is_admin
  FROM users
  WHERE id = p_user_id;

  RETURN COALESCE(v_is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all users (admin only)
CREATE OR REPLACE FUNCTION admin_get_all_users_secure(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  kakao_nickname TEXT,
  role TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Check if the requesting user is an admin
  IF NOT is_admin(p_user_id) THEN
    RAISE EXCEPTION 'Only admins can view all users';
  END IF;

  -- Return all users
  RETURN QUERY
  SELECT
    u.id,
    u.username,
    u.kakao_nickname,
    u.role::text,
    u.is_active,
    u.created_at
  FROM users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to deactivate user (soft delete)
CREATE OR REPLACE FUNCTION deactivate_user(user_id UUID, admin_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Check if caller is admin
  IF NOT is_admin(admin_user_id) THEN
    RAISE EXCEPTION 'Only admins can deactivate users';
  END IF;

  -- Prevent self-deactivation
  IF user_id = admin_user_id THEN
    RAISE EXCEPTION 'Cannot deactivate your own account';
  END IF;

  -- Deactivate user
  UPDATE users
  SET is_active = false
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to activate user
CREATE OR REPLACE FUNCTION activate_user(user_id UUID, admin_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Check if caller is admin
  IF NOT is_admin(admin_user_id) THEN
    RAISE EXCEPTION 'Only admins can activate users';
  END IF;

  -- Activate user
  UPDATE users
  SET is_active = true
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to delete user (hard delete)
CREATE OR REPLACE FUNCTION delete_user_permanently(user_id UUID, admin_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Check if caller is admin
  IF NOT is_admin(admin_user_id) THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;

  -- Prevent self-deletion
  IF user_id = admin_user_id THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;

  -- Delete user (CASCADE will handle related records)
  DELETE FROM users
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions to anon role (since we're using custom auth)
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO anon;
GRANT EXECUTE ON FUNCTION admin_get_all_users_secure(UUID) TO anon;
GRANT EXECUTE ON FUNCTION deactivate_user(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION activate_user(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION delete_user_permanently(UUID, UUID) TO anon;
