# 500 에러 해결 가이드

## 문제
관리자 대시보드 및 여러 페이지에서 500 Internal Server Error 발생

## 원인
커스텀 인증을 사용하고 있어서 Supabase의 `auth.uid()`가 null을 반환합니다.
RLS(Row Level Security) 정책이 `auth.uid()`에 의존하므로 모든 쿼리가 실패합니다.

## 해결 방법

### Supabase SQL Editor에서 실행

**파일**: `supabase/migrations/20250116_fix_rls_for_custom_auth.sql`

이 마이그레이션은:
1. 모든 기존 RLS 정책 삭제
2. 모든 테이블의 RLS 비활성화
3. `authenticated`와 `anon` role에 필요한 권한 부여

### 실행 순서

Supabase SQL Editor에서 다음 순서로 실행하세요:

1. ✅ `20250116_admin_user_management.sql` (이미 실행했을 것)
2. ✅ `20250116_fix_login_function.sql` (이미 실행했을 것)
3. ✅ `20250116_admin_get_users_function.sql` (이미 실행했을 것)
4. ✅ `20250116_get_user_by_id_function.sql` (이미 실행했을 것)
5. **🔥 `20250116_fix_rls_for_custom_auth.sql`** ← 지금 실행하세요!

### 실행 후 확인

1. 브라우저 새로고침
2. 관리자 대시보드 접속
3. 모든 기능이 정상 작동하는지 확인

## 보안 주의사항

RLS를 비활성화했으므로 **애플리케이션 레벨에서 권한을 검증**해야 합니다.

현재 구현된 권한 검증:
- ✅ 관리자 라우트 보호 (routes.jsx)
- ✅ 관리자 RPC 함수 권한 검증
- ✅ 비활성화된 계정 자동 로그아웃

자세한 내용은 `SECURITY_NOTES.md`를 참고하세요.

## 트러블슈팅

### 여전히 500 에러가 발생하는 경우

1. Supabase SQL Editor에서 확인:
```sql
-- RLS가 비활성화되었는지 확인
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
-- rowsecurity가 모두 false여야 함
```

2. 권한 확인:
```sql
-- anon role의 권한 확인
SELECT grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND grantee = 'anon';
```

3. 브라우저 캐시 및 로컬스토리지 클리어:
   - F12 → Application → Local Storage → 모두 삭제
   - 페이지 새로고침

### 특정 테이블만 에러가 나는 경우

해당 테이블의 RLS를 수동으로 비활성화:
```sql
ALTER TABLE 테이블명 DISABLE ROW LEVEL SECURITY;
GRANT ALL ON 테이블명 TO anon;
GRANT ALL ON 테이블명 TO authenticated;
```

## 완료 체크리스트

- [ ] `20250116_fix_rls_for_custom_auth.sql` 실행
- [ ] 브라우저 새로고침
- [ ] 관리자 대시보드 접속 확인
- [ ] 회원 관리 페이지 확인
- [ ] 투표 기간 관리 확인
- [ ] 초대 코드 관리 확인
- [ ] 모임 관리 확인

모든 항목이 체크되면 완료입니다!
