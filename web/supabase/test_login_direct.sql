-- ============================================
-- Direct Login Function Test
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Check if the function exists and see its signature
SELECT
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'login_user'
AND n.nspname = 'public';

-- 2. Check if pgcrypto extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pgcrypto';

-- 3. List a user to verify data structure
-- Replace 'YOUR_USERNAME' with an actual username from your database
SELECT
    id,
    username,
    kakao_nickname,
    role,
    is_active,
    password_hash IS NOT NULL as has_password,
    LENGTH(password_hash) as password_hash_length,
    created_at
FROM users
LIMIT 1;

-- 4. Test the login_user function directly
-- IMPORTANT: Replace with your actual username and password
-- Uncomment the line below and replace the values:

-- SELECT login_user('your_actual_username', 'your_actual_password');

-- 5. If you get an error, test password verification separately
-- Replace 'YOUR_USERNAME' and 'YOUR_PASSWORD' with actual values:

/*
SELECT
    username,
    password_hash,
    crypt('YOUR_PASSWORD', password_hash) as encrypted_input,
    (password_hash = crypt('YOUR_PASSWORD', password_hash)) as password_matches
FROM users
WHERE username = 'YOUR_USERNAME';
*/

-- 6. Check RLS policies that might affect the function
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- 7. Check function permissions
SELECT
    p.proname,
    array_agg(DISTINCT a.rolname) as granted_to
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
LEFT JOIN pg_proc_acl pa ON p.oid = pa.prooid
LEFT JOIN pg_authid a ON pa.grantee = a.oid
WHERE p.proname = 'login_user'
AND n.nspname = 'public'
GROUP BY p.proname;
