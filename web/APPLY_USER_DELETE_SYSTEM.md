# 사용자 삭제/복구 시스템 적용 가이드

**최종 업데이트**: 2025-02-12
**문제**: `get_deleted_users` 400 에러 수정 및 soft delete 시스템 적용

---

## 📋 수정 내용

### 1. 주요 변경사항
- ✅ `get_deleted_users` 함수를 TABLE에서 JSONB 반환으로 변경
- ✅ UPDATE 문의 ORDER BY 구문 오류 수정
- ✅ 관리자 페이지에 상세 로깅 추가
- ✅ RLS 정책 개선 (deleted_at IS NULL 체크 추가)

### 2. 파일 목록
```
web/
├── supabase/migrations/
│   ├── 20250212_user_soft_delete_and_archive.sql (수정됨)
│   └── 20250212_fix_get_deleted_users.sql (신규, 별도 적용용)
├── src/pages/admin/
│   └── AdminUsersPage.jsx (수정됨)
└── 디버깅 파일:
    ├── TEST_DELETED_USERS.sql
    └── DEBUG_SOFT_DELETE.sql
```

---

## 🚀 적용 절차

### 단계 1: Supabase Dashboard 접속

1. **브라우저에서 Supabase Dashboard 열기**
   ```
   https://app.supabase.com
   ```

2. **프로젝트 선택**
   - 프로젝트: `wghrshqnexgaojxrtiit`

3. **SQL Editor 열기**
   - 왼쪽 메뉴 > **SQL Editor** 클릭

---

### 단계 2: 메인 마이그레이션 적용

1. **새 쿼리 생성**
   - "New query" 버튼 클릭

2. **SQL 복사 & 붙여넣기**
   - 파일 경로: `web/supabase/migrations/20250212_user_soft_delete_and_archive.sql`
   - **전체 내용** 복사
   - SQL Editor에 붙여넣기

3. **실행**
   - **Run** 버튼 클릭 (또는 Ctrl/Cmd + Enter)

4. **예상 결과**
   ```
   Success. No rows returned
   ```

   또는 여러 개의 성공 메시지가 표시됨

---

### 단계 3: 테스트 및 검증

#### 3-1. 함수 생성 확인

SQL Editor에서 다음 쿼리 실행:

```sql
-- 함수 확인
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
```

**예상 결과**: 4개 함수 모두 표시되어야 함

#### 3-2. 테이블 컬럼 확인

```sql
-- users 테이블에 deleted_at, deleted_by 컬럼 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('deleted_at', 'deleted_by');
```

**예상 결과**:
```
deleted_at  | timestamp with time zone | YES
deleted_by  | uuid                     | YES
```

#### 3-3. Archive 테이블 확인

```sql
-- Archive 테이블 존재 확인
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'deleted_users_archive'
) AS archive_table_exists;
```

**예상 결과**: `true`

---

### 단계 4: 웹 애플리케이션 재배포

1. **로컬에서 빌드**
   ```bash
   cd /Users/baegeonhui/Documents/Programming/vote-example/web
   npm run build
   ```

2. **Git 커밋 및 푸시** (Vercel 자동 배포)
   ```bash
   git add .
   git commit -m "fix: User soft delete and recovery system"
   git push
   ```

3. **Vercel 배포 확인**
   - https://vercel.com 에서 배포 상태 확인
   - 또는 자동 배포 완료 대기 (약 1-2분)

---

### 단계 5: 기능 테스트

1. **관리자 페이지 접속**
   - 웹사이트 > 관리 > 회원 관리

2. **브라우저 콘솔 열기**
   - Chrome/Edge: F12 또는 Ctrl+Shift+I
   - Safari: Cmd+Option+I
   - Firefox: Ctrl+Shift+K

3. **테스트용 사용자 삭제**
   - "활성 회원" 탭에서 테스트 회원 선택
   - "삭제" 버튼 클릭
   - 삭제 사유 입력 (예: "테스트 삭제")
   - "삭제" 버튼 클릭

4. **콘솔 로그 확인**
   ```
   🗑️ Deleting user: {user_id: "...", username: "...", ...}
   🗑️ Delete response: {data: {...}, error: null}
   ✅ Delete successful: {success: true, message: "...", ...}
   ```

5. **삭제된 회원 탭 확인**
   - "삭제된 회원 (1)" 탭으로 이동
   - 방금 삭제한 회원이 표시되는지 확인

6. **복구 테스트**
   - 삭제된 회원의 "복구" 버튼 클릭
   - 콘솔 로그 확인:
     ```
     ♻️ Restoring user: {user_id: "...", ...}
     ♻️ Restore response: {data: {...}, error: null}
     ✅ Restore successful: {success: true, ...}
     ```
   - "활성 회원" 탭에서 복구된 회원 확인

---

## 🐛 문제 해결

### 문제 1: "get_deleted_users function does not exist" 에러

**원인**: 함수가 생성되지 않았거나 이름이 다름

**해결**:
```sql
-- 함수 목록 확인
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%delete%';

-- 함수 재생성
DROP FUNCTION IF EXISTS get_deleted_users(UUID);

-- 그리고 마이그레이션 파일의 get_deleted_users 부분만 다시 실행
```

### 문제 2: "Only active admins can view deleted users" 에러

**원인**:
- 현재 사용자가 관리자가 아님
- 또는 관리자가 비활성화됨

**해결**:
```sql
-- 자신의 관리자 상태 확인
SELECT id, username, role, is_active, deleted_at
FROM users
WHERE email = 'your-email@example.com';

-- 관리자 권한이 없다면 부여
UPDATE users
SET role = 'admin', is_active = true
WHERE email = 'your-email@example.com';
```

### 문제 3: 삭제는 성공하지만 "삭제된 회원" 탭에 표시 안됨

**원인**: `get_deleted_users` 함수가 JSONB를 제대로 반환하지 못함

**해결**:
```sql
-- 수동으로 삭제된 사용자 확인
SELECT id, username, email, deleted_at, deleted_by
FROM users
WHERE deleted_at IS NOT NULL;

-- Archive 확인
SELECT user_id, deleted_at, deletion_reason
FROM deleted_users_archive;

-- get_deleted_users 함수를 직접 호출하여 테스트
SELECT get_deleted_users('<your-admin-user-id>');
```

### 문제 4: RPC 호출 시 403 Forbidden

**원인**: RLS 정책이나 권한 문제

**해결**:
```sql
-- 함수 권한 재부여
GRANT EXECUTE ON FUNCTION soft_delete_user(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_deleted_user(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_deleted_users(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION permanently_delete_user(UUID, UUID, BOOLEAN) TO authenticated;

-- 또는 anon 역할에도 부여 (필요시)
GRANT EXECUTE ON FUNCTION get_deleted_users(UUID) TO anon;
```

---

## 📊 디버깅 SQL

문제가 발생하면 다음 파일의 SQL을 사용하여 디버깅:

### `TEST_DELETED_USERS.sql`
```bash
web/supabase/TEST_DELETED_USERS.sql
```
- 테이블 및 함수 존재 확인
- 사용자 상태 확인
- Archive 데이터 확인

### `DEBUG_SOFT_DELETE.sql`
```bash
web/supabase/DEBUG_SOFT_DELETE.sql
```
- Soft delete 수동 테스트
- 함수 시그니처 확인
- 관리자 및 사용자 ID 조회

---

## ✅ 검증 체크리스트

마이그레이션 적용 후 다음 항목을 모두 확인하세요:

- [ ] `users` 테이블에 `deleted_at`, `deleted_by` 컬럼 존재
- [ ] `deleted_users_archive` 테이블 존재
- [ ] `soft_delete_user` 함수 생성됨
- [ ] `restore_deleted_user` 함수 생성됨
- [ ] `get_deleted_users` 함수 생성됨 (JSONB 반환)
- [ ] `permanently_delete_user` 함수 생성됨
- [ ] 웹 애플리케이션 재배포 완료
- [ ] 관리자 페이지에서 "활성 회원" 탭 표시
- [ ] 관리자 페이지에서 "삭제된 회원" 탭 표시
- [ ] 사용자 삭제 테스트 성공
- [ ] 사용자 복구 테스트 성공
- [ ] 브라우저 콘솔에 상세 로그 출력됨

---

## 🔗 참고 자료

- **전체 가이드**: `web/USER_DELETE_AND_RECOVERY_GUIDE.md`
- **메인 마이그레이션**: `web/supabase/migrations/20250212_user_soft_delete_and_archive.sql`
- **관리자 페이지**: `web/src/pages/admin/AdminUsersPage.jsx`

---

## 💡 다음 단계

마이그레이션이 성공적으로 적용되면:

1. **프로덕션에서 테스트**
   - 실제 사용자 삭제/복구 테스트
   - 삭제 사유 기록 확인
   - Archive 데이터 확인

2. **모니터링**
   - 삭제된 사용자 수 추적
   - 복구 요청 빈도 확인

3. **정책 수립**
   - 삭제 사유 템플릿 작성
   - 자동 정리 정책 (N개월 후 영구 삭제 등)

---

**문제가 발생하면 브라우저 콘솔 로그를 확인하고, SQL Editor에서 디버깅 쿼리를 실행하세요!**
