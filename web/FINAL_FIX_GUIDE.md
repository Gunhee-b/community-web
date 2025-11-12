# 최종 수정 가이드 - 사용자 삭제 시스템

**최종 업데이트**: 2025-02-12
**문제**: "User already deleted" 에러, 닉네임 중복 문제, 400 에러

---

## 🔴 발생한 문제들

### 1. "User is already deleted" 에러
- **증상**: 이미 `deleted_at`이 설정된 사용자를 삭제하려고 시도
- **원인**: 프론트엔드에서 삭제된 사용자가 "활성 회원"으로 표시됨

### 2. 닉네임 중복 문제
- **증상**: 삭제된 사용자의 닉네임을 새 사용자가 사용할 수 없음
- **원인**: `username UNIQUE` 제약이 삭제된 사용자에게도 적용됨

### 3. 400 에러
- **증상**: RPC 호출 시 400 에러 발생
- **원인**: 함수가 에러를 RAISE EXCEPTION으로 던져서 HTTP 400 응답

---

## ✅ 해결 방법

### 1단계: Supabase SQL 실행

**파일**: `web/supabase/FIX_ALL_ISSUES.sql`

이 파일은 다음 문제들을 해결합니다:

#### ✅ 닉네임 UNIQUE 제약 개선
```sql
-- 기존 UNIQUE 제약 제거
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;

-- 부분 UNIQUE 인덱스 생성 (deleted_at IS NULL인 경우만)
CREATE UNIQUE INDEX users_username_unique_active
ON users(username)
WHERE deleted_at IS NULL;
```

**효과**:
- ✅ 활성 사용자만 닉네임이 고유해야 함
- ✅ 삭제된 사용자의 닉네임은 다른 사람이 재사용 가능
- ✅ 예: "john" 사용자를 삭제하면, 새로운 사람이 "john" 닉네임 사용 가능

#### ✅ 함수 에러 처리 개선
```sql
-- RAISE EXCEPTION 대신 JSONB로 에러 반환
IF v_user.deleted_at IS NOT NULL THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'User is already deleted',
        'deleted_at', v_user.deleted_at
    );
END IF;
```

**효과**:
- ✅ HTTP 200 응답 + `{success: false, error: "..."}` 반환
- ✅ 400 에러 대신 명확한 에러 메시지
- ✅ 프론트엔드에서 에러 처리 가능

#### ✅ admin_get_all_users_secure 수정
```sql
-- 모든 사용자를 반환하되, 프론트엔드에서 필터링
SELECT ... FROM users ORDER BY created_at DESC
```

**효과**:
- ✅ 관리자는 모든 사용자 조회 가능
- ✅ 프론트엔드에서 `deleted_at IS NULL`로 필터링

---

### 2단계: SQL 실행

1. **Supabase Dashboard 열기**
   ```
   https://app.supabase.com
   → 프로젝트 선택
   → SQL Editor
   ```

2. **FIX_ALL_ISSUES.sql 전체 복사**
   - 파일 경로: `web/supabase/FIX_ALL_ISSUES.sql`
   - 전체 내용 복사

3. **SQL Editor에 붙여넣고 Run**
   - Run 버튼 클릭
   - 성공 메시지 확인:
     ```
     ✅ All issues fixed! Username unique constraint updated, functions improved with better error handling.
     ```

---

### 3단계: 웹 애플리케이션 재배포

```bash
cd /Users/baegeonhui/Documents/Programming/vote-example/web
npm run build
git add .
git commit -m "fix: User delete system - unique constraint, error handling"
git push
```

Vercel 자동 배포 (1-2분 소요)

---

## 🧪 테스트

### 1. 삭제된 사용자 확인

SQL Editor에서:
```sql
-- 현재 삭제된 사용자 확인
SELECT id, username, email, deleted_at, deleted_by
FROM users
WHERE deleted_at IS NOT NULL;
```

### 2. 삭제된 사용자가 "활성 회원"에 표시되지 않는지 확인

1. 관리자 페이지 접속
2. "활성 회원" 탭 확인
3. `deleted_at IS NOT NULL`인 사용자는 표시되면 안됨

### 3. 삭제 테스트

1. 브라우저 콘솔 열기 (F12)
2. 활성 회원 삭제 시도
3. 콘솔 확인:
   ```
   🗑️ Deleting user: {...}
   🗑️ Delete response: {data: {success: true, ...}, error: null}
   ✅ Delete successful: {success: true, ...}
   ```

### 4. 이미 삭제된 사용자 재삭제 시도

1. 같은 사용자를 다시 삭제 시도
2. 콘솔 확인:
   ```
   🗑️ Deleting user: {...}
   🗑️ Delete response: {data: {success: false, error: "User is already deleted"}, error: null}
   ❌ Delete failed: User is already deleted
   ```
3. 알림: "삭제 실패: User is already deleted"
4. 자동으로 목록 새로고침

### 5. 닉네임 재사용 테스트

1. 사용자 A (닉네임: "test123") 삭제
2. SQL로 확인:
   ```sql
   SELECT username, deleted_at FROM users WHERE username = 'test123';
   ```
3. 새로운 사용자를 "test123" 닉네임으로 생성
4. ✅ 성공해야 함 (이전에는 UNIQUE 제약 위반으로 실패)

---

## 📊 변경 사항 요약

### 데이터베이스 (SQL)

| 변경 사항 | 이전 | 이후 |
|----------|------|------|
| 닉네임 UNIQUE | 모든 사용자 | 활성 사용자만 (deleted_at IS NULL) |
| 에러 처리 | RAISE EXCEPTION (400) | JSONB {success: false} (200) |
| admin_get_all_users_secure | 활성 사용자만 | 모든 사용자 (프론트엔드 필터링) |
| soft_delete_user | 에러 시 예외 | 에러 시 {success: false, error: "..."} |
| restore_deleted_user | 에러 시 예외 | 에러 시 {success: false, error: "..."} |

### 프론트엔드 (React)

| 변경 사항 | 내용 |
|----------|------|
| handleDeleteConfirm | `data.success === false` 처리 추가 |
| handleRestoreUser | `data.success === false` 처리 추가 |
| fetchDeletedUsers | `data.success === false` 처리 추가 |
| 에러 표시 | 명확한 한글 메시지: "삭제 실패: ..." |

---

## 🔍 디버깅

문제가 여전히 발생하면:

### 1. 현재 상태 확인

```sql
-- DEBUG_CURRENT_STATE.sql 실행
-- 또는 직접:

-- 모든 사용자 확인
SELECT id, username, email, deleted_at, is_active
FROM users
ORDER BY created_at DESC;

-- 삭제된 사용자 확인
SELECT id, username, deleted_at
FROM users
WHERE deleted_at IS NOT NULL;

-- UNIQUE 인덱스 확인
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'users'
AND indexname LIKE '%unique%';
```

### 2. 함수 확인

```sql
-- 함수 목록
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'soft_delete_user',
    'restore_deleted_user',
    'get_deleted_users',
    'admin_get_all_users_secure'
);
```

### 3. 테스트 삭제

```sql
-- 특정 사용자 삭제 테스트
SELECT soft_delete_user(
    '<user-id>',
    '<admin-id>',
    'Test deletion'
);

-- 결과가 {success: true, ...} 또는 {success: false, error: "..."} 형태여야 함
```

---

## ❓ FAQ

### Q: "활성 회원" 탭에 삭제된 사용자가 표시됩니다

**A**: 브라우저 캐시 문제일 수 있습니다. 다음을 시도하세요:
1. 페이지 새로고침 (Ctrl+F5 / Cmd+Shift+R)
2. 브라우저 캐시 삭제
3. 시크릿 모드로 접속

### Q: 닉네임을 여전히 재사용할 수 없습니다

**A**: UNIQUE 인덱스가 제대로 생성되었는지 확인:
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'users'
AND indexname = 'users_username_unique_active';
```

예상 결과:
```
CREATE UNIQUE INDEX users_username_unique_active
ON users USING btree (username)
WHERE (deleted_at IS NULL)
```

### Q: 400 에러가 여전히 발생합니다

**A**: 함수가 제대로 업데이트되지 않았을 수 있습니다:
```sql
-- 기존 함수 완전 제거 후 재생성
DROP FUNCTION IF EXISTS soft_delete_user(UUID, UUID, TEXT);

-- 그리고 FIX_ALL_ISSUES.sql의 STEP 4 부분만 다시 실행
```

### Q: "Only active admins can view deleted users" 에러

**A**: 관리자 계정이 비활성화되었거나 삭제되었습니다:
```sql
-- 자신의 계정 확인
SELECT id, username, role, is_active, deleted_at
FROM users
WHERE email = 'your-email@example.com';

-- 관리자 권한 복구
UPDATE users
SET role = 'admin', is_active = true, deleted_at = NULL
WHERE email = 'your-email@example.com';
```

---

## 📚 참고 파일

- **종합 수정**: `web/supabase/FIX_ALL_ISSUES.sql` ⭐
- **현재 상태 확인**: `web/supabase/DEBUG_CURRENT_STATE.sql`
- **원본 마이그레이션**: `web/supabase/migrations/20250212_user_soft_delete_and_archive.sql`
- **관리자 페이지**: `web/src/pages/admin/AdminUsersPage.jsx`

---

## 🎯 최종 체크리스트

SQL 실행 후:
- [ ] UNIQUE 인덱스가 부분 인덱스로 변경됨 (deleted_at IS NULL)
- [ ] 함수들이 JSONB로 에러 반환
- [ ] 삭제된 사용자가 "활성 회원"에 표시되지 않음
- [ ] 삭제 테스트 성공
- [ ] 복구 테스트 성공
- [ ] 이미 삭제된 사용자 재삭제 시 명확한 에러 메시지
- [ ] 닉네임 재사용 가능

모든 항목이 체크되면 시스템이 정상 작동하는 것입니다! ✅

---

**문제가 계속되면 브라우저 콘솔 로그와 SQL 실행 결과를 함께 공유해주세요.**
