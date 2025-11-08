-- ============================================
-- Debug Login Issues
-- Run these queries in Supabase SQL Editor
-- ============================================

-- 1. Check if login_user function exists and its definition
SELECT
    proname as function_name,
    pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'login_user';

-- 2. Test direct password verification for a specific user
-- Replace 'YOUR_USERNAME' with your actual username
SELECT
    username,
    kakao_nickname,
    role,
    is_active,
    password_hash IS NOT NULL as has_password,
    -- Test password (replace 'YOUR_PASSWORD' with your actual password)
    -- crypt('YOUR_PASSWORD', password_hash) = password_hash as password_matches
    created_at
FROM users
WHERE username = 'YOUR_USERNAME';

-- 3. Check if pgcrypto extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pgcrypto';

-- 4. Manually test the login_user function
-- Replace with your actual credentials
SELECT login_user('YOUR_USERNAME', 'YOUR_PASSWORD');

-- 5. Check for any policies that might be blocking
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users';

-- 6. List all users to verify data
SELECT
    id,
    username,
    kakao_nickname,
    role,
    is_active,
    password_hash IS NOT NULL as has_password_hash,
    created_at
FROM users
ORDER BY created_at;
