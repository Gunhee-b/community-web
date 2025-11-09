# 프로덕션 환경 소셜 로그인 디버깅 가이드

## 현재 문제 상황

✅ **성공:** Supabase Auth 인증 완료 (access_token 받음)
❌ **실패:** 웹 애플리케이션에서 로그인 상태 반영 안 됨
❌ **에러:** 406 Not Acceptable 발생

## 의심되는 원인들

### 1. 배포된 코드에 OAuthHandler가 없을 가능성

**확인 방법:**

1. 프로덕션 사이트 접속 (https://www.tongchalbang.com)
2. F12 > Sources 탭
3. 검색 (Ctrl+Shift+F)에서 "OAuthHandler" 검색
4. 찾아지면 ✅ 배포됨, 못 찾으면 ❌ 배포 안 됨

**해결:**
```bash
# web 디렉토리에서
git add .
git commit -m "Add OAuthHandler for OAuth callback processing"
git push

# Vercel에서 자동 배포되거나 수동 배포
```

### 2. authStore.js의 INITIAL_SESSION 핸들러가 여전히 users 테이블 조회 시도

**확인 방법:**

프로덕션 사이트에서 F12 > Sources > authStore.js 파일 열어서 `onAuthStateChange` 함수 확인

**올바른 코드 (Line 142-163):**
```javascript
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state change:', event, session)

  const store = useAuthStore.getState()

  if (event === 'SIGNED_IN' && session) {
    // OAuthHandler will handle user sync
    console.log('User signed in, OAuthHandler will handle sync')
  } else if (event === 'SIGNED_OUT') {
    if (store.authType === 'social') {
      store.logout()
    }
  } else if (event === 'TOKEN_REFRESHED' && session) {
    store.setSession(session)
  } else if (event === 'INITIAL_SESSION' && session) {
    // Don't fetch user here, let OAuthHandler handle it
    console.log('Initial session detected, OAuthHandler will process if needed')
  }
})
```

**잘못된 코드 (이렇게 되어있으면 안 됨):**
```javascript
if (event === 'INITIAL_SESSION' && session) {
  // ❌ 이런 코드가 있으면 안 됨
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('email', authUser.email)
    .single()  // 또는 .maybeSingle()
}
```

### 3. find_or_create_social_user 함수가 제대로 배포되지 않음

**확인 방법:**

Supabase Dashboard에서 확인:
```sql
-- SQL Editor에서 실행
SELECT routine_name, created
FROM information_schema.routines
WHERE routine_name = 'find_or_create_social_user'
AND routine_schema = 'public';
```

**재배포:**
```sql
-- 20250209_fix_deleted_user_relogin.sql 파일 내용을 다시 실행
-- Supabase Dashboard > SQL Editor > New Query에서 실행
```

### 4. RLS 정책 문제

**확인 방법:**
```sql
-- users 테이블 RLS 상태 확인
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';

-- rowsecurity가 true면 RLS 활성화, false면 비활성화
```

**예상 결과:**
- `rowsecurity: false` (RLS 비활성화 - 정상)

**만약 true라면:**
```sql
-- RLS 비활성화
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections DISABLE ROW LEVEL SECURITY;
```

### 5. API 엔드포인트 문제

Supabase의 PostgREST API가 406을 반환할 수 있는 경우:

1. **Accept 헤더 문제** - supabase-js가 잘못된 Accept 헤더 전송
2. **RPC 함수 반환 타입 불일치** - JSONB를 예상했는데 다른 타입 반환
3. **Content-Type 협상 실패**

**확인 방법:**

F12 > Network 탭에서 `find_or_create_social_user` 요청 확인:
- Request Headers의 `Accept` 확인
- Response Headers의 `Content-Type` 확인
- Response 본문 확인

## 완전한 테스트 절차

### 단계 1: 코드 배포 확인

```bash
# 1. 로컬에서 변경사항 확인
cd /Users/baegeonhui/Documents/Programming/vote-example/web
git status

# 2. OAuthHandler 존재 확인
ls -la src/components/common/OAuthHandler.jsx

# 3. App.jsx에 OAuthHandler import 확인
grep "OAuthHandler" src/App.jsx

# 4. 변경사항 커밋 및 푸시
git add .
git commit -m "Fix OAuth callback handling with enhanced logging"
git push origin main  # 또는 배포 브랜치
```

### 단계 2: Vercel 배포 확인

```
1. https://vercel.com 접속
2. 프로젝트 선택
3. Deployments 탭
4. 최신 배포가 "Ready" 상태인지 확인
5. 배포 시간이 최근 코드 푸시 이후인지 확인
```

### 단계 3: Supabase 마이그레이션 확인

Supabase Dashboard > SQL Editor:

```sql
-- 1. find_or_create_social_user 함수 존재 확인
SELECT
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'find_or_create_social_user'
AND routine_schema = 'public';

-- 2. RLS 상태 확인
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'social_connections');

-- 3. INSERT 정책 확인
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users';
```

**예상 결과:**
- `find_or_create_social_user` 함수가 존재하고 최신 버전
- `users.rowsecurity = false`
- `social_connections.rowsecurity = false`

### 단계 4: 프로덕션 테스트

**중요: 시크릿 모드에서 테스트!**

1. **시크릿 모드 브라우저 열기**
   - Chrome: Ctrl+Shift+N
   - 완전히 깨끗한 상태에서 테스트

2. **사이트 접속 및 콘솔 열기**
   ```
   https://www.tongchalbang.com
   F12 > Console 탭
   ```

3. **"Google로 계속하기" 클릭**

4. **콘솔 로그 확인 (순서대로 나와야 함):**
   ```
   ✅ OAuthHandler: Checking hash: #access_token=...
   ✅ OAuth callback detected in hash
   ✅ Hash length: 450
   ✅ Calling handleOAuthCallback...
   ✅ 🔄 handleOAuthCallback: Starting...
   ✅ 📡 Getting Supabase session...
   ✅ Session exists: true
   ✅ 👤 Getting auth user...
   ✅ Auth user exists: user@example.com
   ✅ 🔄 Syncing user to database...
   ✅ Syncing social user with params: {...}
   ✅ RPC Response: {data: {...}, error: null}
   ✅ User sync successful
   ✅ Sync successful, user created
   ✅ OAuth callback successful, setting user: 사용자이름
   ✅ Clearing hash and redirecting to home
   ```

5. **에러 발생 시 로그 패턴:**

   **Pattern A: OAuthHandler가 실행 안 됨**
   ```
   ❌ Auth state change: SIGNED_IN
   ❌ Auth state change: INITIAL_SESSION
   ❌ (OAuthHandler 로그 없음)
   ```
   → 배포 문제: OAuthHandler가 번들에 포함 안 됨

   **Pattern B: RPC 호출 실패**
   ```
   ✅ OAuthHandler: Checking hash...
   ✅ 🔄 handleOAuthCallback: Starting...
   ✅ Session exists: true
   ✅ Auth user exists: user@example.com
   ✅ 🔄 Syncing user to database...
   ❌ RPC Error Details: {message: "...", code: "..."}
   ```
   → 데이터베이스 문제: RPC 함수 또는 RLS 문제

   **Pattern C: 406 에러**
   ```
   ✅ Session exists: true
   ✅ Auth user exists: user@example.com
   ✅ Syncing social user with params...
   ❌ 406 Not Acceptable
   ```
   → API 문제: Accept 헤더 또는 Content-Type 협상 실패

### 단계 5: Network 탭에서 상세 확인

F12 > Network 탭:

1. **필터: "find_or_create"**
2. **요청 찾기**
3. **Headers 탭 확인:**
   ```
   Request URL: https://...supabase.co/rest/v1/rpc/find_or_create_social_user
   Request Method: POST
   Status Code: 200 (정상) 또는 406 (문제)
   ```

4. **Request Headers 확인:**
   ```
   Content-Type: application/json
   Accept: application/json
   apikey: ...
   ```

5. **Response 확인:**
   - 200: 정상적인 JSON 응답
   - 406: API가 요청을 거부

## 406 에러 해결 방법

### 해결책 1: Supabase 클라이언트 헤더 명시

`src/lib/supabase.js` 수정:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
})
```

### 해결책 2: RPC 호출 방식 변경

`src/utils/socialAuth.js`의 `syncSocialUser` 함수를 POST 요청으로 변경:

```javascript
// 기존 방식 대신
const response = await fetch(`${supabaseUrl}/rest/v1/rpc/find_or_create_social_user`, {
  method: 'POST',
  headers: {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({
    p_provider: provider,
    p_provider_user_id: providerId,
    p_email: email,
    p_username: username,
    p_avatar_url: avatarUrl,
    p_display_name: username
  })
})

const data = await response.json()
```

### 해결책 3: API 설정 확인

Supabase Dashboard > Settings > API:

- **Enforce statement timeout** 확인
- **JWT expiry limit** 확인
- **API Rate Limiting** 확인

## 빠른 체크리스트

**배포 전:**
- [ ] `OAuthHandler.jsx` 파일 존재
- [ ] `App.jsx`에 OAuthHandler import됨
- [ ] `authStore.js` INITIAL_SESSION 핸들러 수정됨
- [ ] `socialAuth.js` 향상된 로깅 적용됨
- [ ] Git commit & push 완료

**Supabase 확인:**
- [ ] `find_or_create_social_user` 함수 최신 버전
- [ ] `users` 테이블 RLS 비활성화
- [ ] `social_connections` 테이블 RLS 비활성화
- [ ] INSERT 정책 존재 (RLS 활성화된 경우)

**프로덕션 테스트:**
- [ ] 시크릿 모드 브라우저 사용
- [ ] F12 콘솔 열고 로그 확인
- [ ] OAuthHandler 로그 나타남
- [ ] handleOAuthCallback 로그 나타남
- [ ] RPC 호출 성공
- [ ] 로그인 상태 반영됨

**406 에러 발생 시:**
- [ ] Network 탭에서 요청/응답 확인
- [ ] Accept 헤더 확인
- [ ] RPC 함수 반환 타입 확인
- [ ] Supabase 클라이언트 헤더 설정 시도
- [ ] 직접 fetch로 RPC 호출 시도

## 추가 디버깅 팁

### Console에서 수동 테스트

브라우저 콘솔에서:

```javascript
// Supabase 클라이언트 직접 테스트
const testSync = async () => {
  const { data, error } = await supabase.rpc('find_or_create_social_user', {
    p_provider: 'google',
    p_provider_user_id: 'test123',
    p_email: 'test@example.com',
    p_username: 'TestUser',
    p_avatar_url: null,
    p_display_name: 'Test User'
  })
  console.log('Result:', { data, error })
}
testSync()
```

정상이면:
```
Result: {
  data: {success: true, user: {...}, is_new: true},
  error: null
}
```

에러면:
```
Result: {
  data: null,
  error: {message: "...", code: "...", details: "..."}
}
```

이 가이드를 따라 단계별로 확인하면 정확한 문제 원인을 파악할 수 있습니다!
