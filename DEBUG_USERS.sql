-- ============================================================
-- 사용자 조회 디버깅
-- ============================================================

-- ============================================================
-- 1. 현재 로그인 상태 확인
-- ============================================================
SELECT
    auth.uid() as current_user_id,
    CASE
        WHEN auth.uid() IS NULL THEN '❌ 로그인되지 않음'
        ELSE '✅ 로그인됨'
    END as login_status;

-- ============================================================
-- 2. auth.users 테이블 확인 (Supabase 인증 사용자)
-- ============================================================
SELECT
    id,
    email,
    created_at,
    raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================
-- 3. public.users 테이블 확인 (앱의 사용자 테이블)
-- ============================================================
SELECT
    id,
    username,
    email,
    created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================
-- 4. 모든 사용자 테이블 찾기
-- ============================================================
SELECT
    schemaname,
    tablename
FROM pg_tables
WHERE tablename LIKE '%user%'
ORDER BY schemaname, tablename;
