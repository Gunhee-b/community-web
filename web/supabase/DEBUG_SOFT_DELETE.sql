-- ============================================================================
-- Soft Delete 함수 디버깅 및 테스트
-- ============================================================================

-- 1. 먼저 관리자 ID 확인
SELECT id, username, role, is_active, deleted_at
FROM users
WHERE role = 'admin'
ORDER BY created_at DESC
LIMIT 5;

-- 2. 일반 사용자 확인 (삭제할 테스트 대상)
SELECT id, username, email, role, deleted_at
FROM users
WHERE role != 'admin'
AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 5;

-- 3. soft_delete_user 함수 테스트 (실제 관리자 ID와 사용자 ID로 교체)
-- SELECT soft_delete_user(
--   '<user-id-to-delete>',
--   '<admin-user-id>',
--   '테스트 삭제'
-- );

-- 4. 삭제 후 확인
-- SELECT id, username, deleted_at, deleted_by
-- FROM users
-- WHERE id = '<user-id-that-was-deleted>';

-- 5. Archive 테이블 확인
-- SELECT id, user_id, deleted_at, deletion_reason
-- FROM deleted_users_archive
-- WHERE user_id = '<user-id-that-was-deleted>';

-- ============================================================================
-- 함수가 제대로 생성되었는지 확인
-- ============================================================================

-- 모든 관련 함수 확인
SELECT
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'soft_delete_user',
    'restore_deleted_user',
    'get_deleted_users',
    'permanently_delete_user'
);

-- ============================================================================
-- 수동 soft delete 테스트 (함수 없이)
-- ============================================================================

-- 이 쿼리로 수동으로 soft delete를 테스트할 수 있습니다
-- (실제 ID로 교체)

/*
BEGIN;

-- 사용자 삭제
UPDATE users
SET
    deleted_at = timezone('Asia/Seoul', NOW()),
    deleted_by = '<admin-user-id>',
    is_active = false
WHERE id = '<user-id-to-delete>';

-- invitation_codes 업데이트
UPDATE invitation_codes
SET used_by = NULL
WHERE used_by = '<user-id-to-delete>';

-- 확인
SELECT id, username, deleted_at, is_active
FROM users
WHERE id = '<user-id-to-delete>';

ROLLBACK;  -- 테스트이므로 롤백 (실제 적용하려면 COMMIT으로 변경)
*/
