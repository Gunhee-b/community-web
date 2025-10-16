-- ============================================
-- Check and Setup Admin Account
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Check current admin accounts
SELECT
    id,
    username,
    kakao_nickname,
    role,
    is_active,
    created_at
FROM users
WHERE role = 'admin'
ORDER BY created_at;

-- 2. If no admin exists or you need to create a new admin,
--    uncomment and modify the following query:

/*
UPDATE users
SET role = 'admin'
WHERE username = 'YOUR_USERNAME_HERE';
*/

-- 3. Verify the update:
/*
SELECT
    id,
    username,
    kakao_nickname,
    role,
    is_active,
    created_at
FROM users
WHERE username = 'YOUR_USERNAME_HERE';
*/

-- 4. Make sure the account is active:
/*
UPDATE users
SET is_active = true
WHERE username = 'YOUR_USERNAME_HERE';
*/

-- 5. View all users (for reference):
SELECT
    username,
    kakao_nickname,
    role,
    is_active,
    created_at
FROM users
ORDER BY created_at;
