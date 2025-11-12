-- ============================================================================
-- 삭제된 사용자 시스템 테스트 및 디버깅
-- ============================================================================

-- 1. users 테이블에 deleted_at, deleted_by 컬럼이 있는지 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('deleted_at', 'deleted_by');

-- 2. deleted_users_archive 테이블이 존재하는지 확인
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'deleted_users_archive'
) AS archive_table_exists;

-- 3. 생성된 함수 확인
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'soft_delete_user',
  'restore_deleted_user',
  'get_deleted_users',
  'permanently_delete_user'
);

-- 4. 현재 users 테이블의 deleted_at 상태 확인
SELECT id, username, email, role, deleted_at, deleted_by
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- 5. Archive 테이블 확인
SELECT id, user_id, deleted_at, restored_at
FROM deleted_users_archive
ORDER BY deleted_at DESC
LIMIT 10;
