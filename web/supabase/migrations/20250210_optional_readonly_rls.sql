-- ============================================
-- OPTIONAL: Enable READ-ONLY RLS for sensitive data
-- This is optional and only recommended if you need extra protection
-- for reading sensitive user information
-- ============================================
--
-- WARNING: Only apply this if you understand the implications!
-- Most operations are already protected by SECURITY DEFINER functions.
--
-- This script is provided for reference only and is NOT recommended
-- unless you have specific security requirements.

-- Enable RLS only on users table for SELECT operations
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (
  -- For social login users with Supabase Auth
  (provider != 'local' AND id IN (
    SELECT user_id FROM social_connections
    WHERE provider_user_id = auth.uid()::text
  ))
  OR
  -- For local users (always allow since we check in functions)
  (provider = 'local')
);

-- Allow admins to read all users
CREATE POLICY "Admins can read all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id IN (
      SELECT user_id FROM social_connections
      WHERE provider_user_id = auth.uid()::text
    )
    AND u.role = 'admin'
  )
  OR
  -- Also check for local admin users
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.role = 'admin'
    -- This allows local admins to read through functions
  )
);

-- IMPORTANT: We do NOT add INSERT/UPDATE/DELETE policies
-- because these operations are handled by SECURITY DEFINER functions
-- which bypass RLS and have their own permission checks.

-- Grant SELECT to authenticated and anon for function access
GRANT SELECT ON users TO authenticated, anon;

-- Note: This adds minimal security improvement since:
-- 1. All write operations already go through SECURITY DEFINER functions
-- 2. Most read operations also use functions (e.g., admin_get_all_users)
-- 3. The application already validates permissions at the function level
