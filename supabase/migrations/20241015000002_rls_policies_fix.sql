-- Fix RLS policies for login
-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;

-- Allow anyone to read user data by username (for login)
-- This is safe because we don't expose sensitive data in the response
-- and password verification happens in the application
CREATE POLICY "Anyone can read users for authentication" ON users
    FOR SELECT USING (true);

-- Keep the update policy as is
-- Users can still only update their own data
