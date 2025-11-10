# RLS 정책 및 보안 가이드

## 현재 보안 아키텍처

### 인증 시스템
이 프로젝트는 **하이브리드 인증 방식**을 사용합니다:

1. **로컬 인증**: 커스텀 구현 (username + password_hash)
2. **소셜 로그인**: Supabase Auth (Google, Kakao)

### RLS 비활성화 이유

**RLS가 비활성화된 이유:**
- Supabase Auth의 `auth.uid()`는 Supabase Auth user ID를 반환
- 우리 users 테이블의 `id`는 자체 생성한 UUID
- 두 ID가 달라서 표준 RLS 정책이 작동하지 않음

**대신 사용하는 보안 방식:**
- **44개의 SECURITY DEFINER 함수**로 모든 중요 작업 처리
- 각 함수 내부에서 권한 체크 수행
- 클라이언트는 함수만 호출 가능

## 보안 원칙

### ✅ 안전한 패턴

```javascript
// ✅ GOOD: 함수를 통한 데이터 조작
const { data, error } = await supabase.rpc('find_or_create_social_user', {
  p_provider: 'google',
  p_provider_user_id: userId,
  p_email: email
})

// ✅ GOOD: 함수를 통한 사용자 업데이트
const { data, error } = await supabase.rpc('update_username_with_limit', {
  p_user_id: userId,
  p_new_username: newName
})

// ✅ GOOD: 읽기 작업 (RLS가 비활성화되어 있지만 함수에서 권한 체크)
const { data, error } = await supabase.rpc('admin_get_all_users_secure', {
  p_user_id: currentUserId
})
```

### ❌ 위험한 패턴

```javascript
// ❌ BAD: users 테이블에 직접 INSERT (절대 사용 금지!)
const { data, error } = await supabase
  .from('users')
  .insert({ username: 'test', password_hash: 'hash' })

// ❌ BAD: users 테이블 직접 UPDATE (절대 사용 금지!)
const { data, error } = await supabase
  .from('users')
  .update({ role: 'admin' })
  .eq('id', userId)

// ❌ BAD: users 테이블 직접 DELETE (절대 사용 금지!)
const { data, error } = await supabase
  .from('users')
  .delete()
  .eq('id', userId)
```

## 주요 보안 함수들

### 인증 관련
- `login_user(p_username, p_password)` - 로그인
- `find_or_create_social_user(...)` - 소셜 로그인 사용자 생성/조회
- `update_username_with_limit(...)` - 닉네임 변경 (rate limit 적용)

### 관리자 전용
- `admin_get_all_users_secure(p_user_id)` - 사용자 목록 조회 (관리자 권한 체크)
- `delete_user_permanently(user_id, admin_user_id)` - 사용자 영구 삭제
- `deactivate_user(user_id)` - 사용자 비활성화
- `activate_user(user_id)` - 사용자 활성화

### 투표 관련
- `user_voted_for_post(user_uuid, post_uuid)` - 투표 여부 확인
- `get_vote_count(post_uuid)` - 투표 수 조회

### 모임 관련
- `get_participant_count(meeting_uuid)` - 참가자 수 조회
- `is_meeting_full(meeting_uuid)` - 모임 정원 확인
- `assign_anonymous_name(meeting_uuid, user_uuid)` - 익명 이름 할당

## RLS 활성화 옵션

### 옵션 1: 현재 상태 유지 (권장)

**권장 이유:**
- SECURITY DEFINER 함수로 충분한 보안 제공
- 하이브리드 인증 방식에 적합
- 복잡도가 낮고 유지보수 쉬움

**조건:**
- 클라이언트 코드에서 직접 INSERT/UPDATE/DELETE 금지
- 모든 중요 작업은 함수를 통해서만 수행
- 정기적으로 함수의 권한 체크 로직 검토

### 옵션 2: 읽기 전용 RLS 활성화 (선택적)

만약 추가 보안이 필요하다면:

```bash
# 선택적 RLS 마이그레이션 적용
psql $DATABASE_URL -f supabase/migrations/20250210_optional_readonly_rls.sql
```

**주의:** 이 옵션은 복잡도를 높이며 큰 보안 개선 효과가 없습니다.

### 옵션 3: 전체 Supabase Auth 마이그레이션 (권장하지 않음)

**필요한 작업:**
1. 모든 로컬 사용자를 Supabase Auth로 마이그레이션
2. users 테이블 ID를 Supabase Auth UID와 매칭
3. 모든 외래 키 재구성
4. 기존 데이터 마이그레이션

**권장하지 않는 이유:**
- 매우 복잡하고 위험한 작업
- 현재 시스템이 이미 안전하게 작동 중
- 투입 대비 효과가 낮음

## 보안 체크리스트

### 개발 시

- [ ] 새로운 테이블 생성 시 RLS 비활성화 확인
- [ ] 중요한 작업은 SECURITY DEFINER 함수로 구현
- [ ] 함수 내부에서 권한 체크 수행
- [ ] 클라이언트에서 직접 테이블 조작 금지

### 코드 리뷰 시

- [ ] `supabase.from('users').insert` 패턴 검색
- [ ] `supabase.from('users').update` 패턴 검색
- [ ] `supabase.from('users').delete` 패턴 검색
- [ ] 모든 중요 작업이 함수를 통하는지 확인

### 정기 점검

- [ ] SECURITY DEFINER 함수의 권한 체크 로직 검토
- [ ] 로그에서 비정상적인 직접 테이블 접근 확인
- [ ] 관리자 계정 권한 재확인

## 문제 발생 시

### "permission denied" 에러

**원인:** RLS가 활성화되어 있거나 권한이 잘못 설정됨

**해결:**
```sql
-- RLS 상태 확인
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- RLS 비활성화
ALTER TABLE [테이블명] DISABLE ROW LEVEL SECURITY;
```

### 함수 실행 에러

**원인:** 함수 내 권한 체크 실패

**해결:**
1. 로그에서 정확한 에러 메시지 확인
2. 함수 내 RAISE EXCEPTION 메시지 확인
3. 필요 시 함수 수정

## 추가 보안 권장사항

1. **환경 변수 보호**
   - `.env` 파일을 git에 커밋하지 말 것
   - Supabase anon key는 공개 가능 (RLS로 보호됨)
   - Service role key는 **절대 클라이언트에 노출 금지**

2. **HTTPS 사용**
   - 프로덕션에서 반드시 HTTPS 사용
   - Supabase는 기본적으로 HTTPS 제공

3. **정기 업데이트**
   - Supabase 클라이언트 라이브러리 정기 업데이트
   - 보안 패치 적용

4. **로깅 및 모니터링**
   - 중요 작업은 로그 기록
   - 비정상적인 접근 패턴 모니터링

## 관련 파일

- `migrations/EMERGENCY_FIX_RLS.sql` - RLS 비활성화
- `migrations/20250131_add_social_login_support.sql` - 소셜 로그인 함수
- `migrations/20250209_fix_users_insert_policy.sql` - INSERT 정책
- `src/lib/supabase.js` - Supabase 클라이언트 설정
- `src/utils/socialAuth.js` - 소셜 로그인 구현

## 참고 자료

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Security Functions](https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth)
