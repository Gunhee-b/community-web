-- ============================================================================
-- 현재 상태 디버깅
-- ============================================================================

-- 1. users 테이블 전체 상태 확인
SELECT
    id,
    username,
    email,
    role,
    is_active,
    deleted_at,
    deleted_by,
    created_at
FROM users
ORDER BY created_at DESC;

-- 2. deleted_at이 설정된 사용자 확인
SELECT
    id,
    username,
    email,
    role,
    is_active,
    deleted_at,
    deleted_by
FROM users
WHERE deleted_at IS NOT NULL;

-- 3. admin_get_all_users_secure 함수 확인
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name = 'admin_get_all_users_secure';

-- 4. 닉네임 중복 확인
SELECT username, COUNT(*) as count
FROM users
GROUP BY username
HAVING COUNT(*) > 1;

-- 5. UNIQUE 제약 조건 확인
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'users'
AND tc.constraint_type = 'UNIQUE';
