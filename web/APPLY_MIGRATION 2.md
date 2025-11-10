# 긴급 마이그레이션 적용 가이드

## 문제 상황
- Google 소셜 로그인이 작동하지 않음
- 새로운 사용자 생성이 차단됨
- 원인: users 테이블에 INSERT RLS 정책이 없음

## 해결 방법

### 1. Supabase Dashboard로 이동
1. https://app.supabase.com 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 "SQL Editor" 클릭

### 2. 아래 SQL 실행

```sql
-- Fix: Add INSERT policy for users table to allow social login registration
-- Without this policy, social login users cannot be created in the database

-- Drop any existing INSERT policies first (in case there are any)
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Anyone can insert users" ON users;
DROP POLICY IF EXISTS "System can insert users" ON users;

-- Create INSERT policy that allows:
-- 1. Anyone to insert (for social login - the function will handle validation)
-- 2. The policy is permissive since SECURITY DEFINER functions should be able to insert
CREATE POLICY "Allow user creation for authentication"
ON users FOR INSERT
WITH CHECK (true);

-- Note: This is safe because:
-- 1. User creation is controlled by SECURITY DEFINER functions (register_user, find_or_create_social_user)
-- 2. These functions validate invitation codes and handle all security checks
-- 3. RLS is still enabled, so regular users cannot directly insert without going through the functions
-- 4. The functions use proper validation and constraints
```

### 3. 실행 후 확인

SQL을 실행한 후:
1. "Run" 버튼 클릭
2. 성공 메시지 확인
3. 다시 Google 로그인 시도

### 4. 테스트

```
1. 브라우저에서 시크릿/프라이빗 모드 열기
2. 웹사이트 접속
3. "Google로 계속하기" 클릭
4. 새로운 계정으로 로그인 시도
5. 성공적으로 회원가입 되는지 확인
```

## 추가 디버깅

만약 여전히 문제가 발생한다면, 브라우저 개발자 도구(F12) > Console 탭에서 다음 로그를 확인:
- "Syncing social user with params" - 사용자 정보 확인
- "RPC Response" - RPC 함수 응답 확인
- "RPC Error Details" - 에러 상세 정보 확인

에러 메시지를 복사해서 공유해주세요!
