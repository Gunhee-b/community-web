# 삭제된 사용자 재로그인 문제 해결 가이드

## 문제 상황

관리자가 소셜 로그인 사용자를 삭제한 후, 동일한 Google 계정으로 다시 로그인을 시도하면:
- ❌ 로그인이 되지 않음
- ❌ 무한 로딩 또는 에러 발생

## 원인

1. 사용자 삭제 시:
   - ✅ `users` 테이블에서 삭제됨
   - ✅ `social_connections` 테이블에서 CASCADE로 삭제됨
   - ❌ **Supabase Auth 사용자는 남아있음**

2. 재로그인 시:
   - Google OAuth는 성공 (Supabase Auth 계정 존재)
   - 하지만 `find_or_create_social_user` 함수가 제대로 처리하지 못함

## 해결 방법

### 1. 먼저 적용할 마이그레이션

Supabase Dashboard > SQL Editor에서 다음 두 SQL 파일을 **순서대로** 실행하세요:

#### 1-1. find_or_create_social_user 함수 수정

파일: `web/supabase/migrations/20250209_fix_deleted_user_relogin.sql`

이 SQL을 실행하면:
- 삭제된 사용자가 다시 로그인할 때 새 계정을 자동으로 생성
- orphaned social_connections를 정리

#### 1-2. delete_user_permanently 함수 업데이트

파일: `web/supabase/migrations/20250209_delete_supabase_auth_user.sql`

이 SQL을 실행하면:
- 사용자 삭제 시 provider 정보를 로그에 기록
- 관리자가 Supabase Auth에서도 삭제할 수 있도록 안내

### 2. 기존 삭제된 사용자의 Supabase Auth 계정 정리

이미 삭제했지만 Supabase Auth에 남아있는 사용자를 정리해야 합니다:

#### 방법 1: Supabase Dashboard 사용

```
1. Supabase Dashboard 접속
2. Authentication > Users 메뉴
3. 해당 사용자 이메일 검색 (예: ksw10110@gmail.com)
4. 사용자 선택 > "Delete user" 클릭
5. 확인
```

#### 방법 2: SQL로 확인 (읽기 전용)

```sql
-- Supabase Auth 사용자 목록 확인
SELECT
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'ksw10110@gmail.com';

-- 우리 users 테이블에 해당 이메일이 있는지 확인
SELECT id, username, email
FROM users
WHERE email = 'ksw10110@gmail.com';
```

만약 `auth.users`에는 있지만 `users` 테이블에는 없다면, Supabase Dashboard에서 삭제해야 합니다.

### 3. 테스트

마이그레이션 적용 후:

```
1. 시크릿 모드로 사이트 접속
2. "Google로 계속하기" 클릭
3. 이전에 삭제된 계정으로 로그인
4. 브라우저 콘솔(F12) 확인:
   - "Syncing social user with params"
   - "RPC Response: {success: true, ...}"
   - "User sync successful"
5. 홈페이지로 이동하고 로그인 상태 확인
```

## 향후 사용자 삭제 시 권장 절차

1. **우리 앱에서 삭제**
   ```
   Admin > 회원 관리 > 해당 사용자 > "영구 삭제" 버튼
   ```

2. **Supabase Auth에서도 삭제** (소셜 로그인 사용자인 경우)
   ```
   Supabase Dashboard > Authentication > Users > 해당 사용자 검색 > Delete user
   ```

## 자동화 (선택사항)

완전한 자동화를 원한다면 Supabase Management API를 사용해야 합니다:

```javascript
// 이는 서버 사이드 또는 Edge Function에서만 실행 가능
// Service Role Key 필요
const deleteAuthUser = async (userId) => {
  const response = await fetch(
    `https://<project-ref>.supabase.co/auth/v1/admin/users/${userId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      }
    }
  )
  return response
}
```

하지만 보안상 Service Role Key를 클라이언트에 노출할 수 없으므로,
당분간은 수동으로 Supabase Dashboard에서 삭제하는 것을 권장합니다.

## 요약

✅ **즉시 적용**: 두 마이그레이션 SQL 실행
✅ **기존 문제 해결**: Supabase Dashboard에서 orphaned auth users 삭제
✅ **앞으로**: 사용자 삭제 시 Supabase Auth에서도 수동 삭제

이제 삭제된 사용자도 다시 로그인하면 새 계정이 자동으로 생성됩니다!
