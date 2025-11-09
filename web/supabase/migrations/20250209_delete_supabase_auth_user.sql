-- Update delete_user_permanently to also delete Supabase Auth user
-- This requires the Service Role key permissions

CREATE OR REPLACE FUNCTION delete_user_permanently(user_id UUID, admin_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_admin users;
  v_user_provider TEXT;
  v_user_provider_id TEXT;
BEGIN
  -- Check if admin exists and is admin
  SELECT * INTO v_admin FROM users WHERE id = admin_user_id;

  IF NOT FOUND OR v_admin.role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;

  -- Prevent self-deletion
  IF user_id = admin_user_id THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;

  -- Get user's provider info for potential Auth deletion
  SELECT provider, provider_id INTO v_user_provider, v_user_provider_id
  FROM users
  WHERE id = user_id;

  -- Delete user from our users table
  -- This will CASCADE delete social_connections, posts, etc.
  DELETE FROM users WHERE id = user_id;

  -- Note: We cannot directly delete Supabase Auth users from SQL
  -- The admin should also manually delete the user from:
  -- Supabase Dashboard > Authentication > Users
  -- Or use the Supabase Management API

  -- Log the deletion for manual cleanup
  RAISE NOTICE 'User % deleted. Provider: %, Provider ID: %. Please also delete from Supabase Auth if applicable.',
    user_id, v_user_provider, v_user_provider_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION delete_user_permanently TO authenticated;
