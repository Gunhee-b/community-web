# Localhost Port 3000 OAuth 설정 가이드

## 중요: 개발 서버 포트 변경됨

현재 프로젝트의 Vite 개발 서버는 **port 3000**에서 실행됩니다.
(이전 가이드에서 언급한 5173이 아닙니다)

```bash
npm run dev
# → 서버가 http://localhost:3000 에서 실행됨
```

## Supabase Dashboard 설정 필수

Google 소셜 로그인이 localhost에서 작동하려면, Supabase Dashboard에 다음 URL들을 추가해야 합니다:

### 1. Supabase Dashboard 접속

```
1. https://app.supabase.com 접속
2. 프로젝트 선택 (wghrshqnexgaojxrtiit)
3. Authentication > URL Configuration 메뉴
4. "Redirect URLs" 섹션 찾기
```

### 2. 추가해야 할 URL들 (Port 3000)

**반드시 추가:**
```
http://localhost:3000
http://localhost:3000/auth/callback
```

### 3. 완전한 Redirect URLs 설정 예시

```
# Localhost (개발)
http://localhost:3000
http://localhost:3000/auth/callback

# Production
https://www.tongchalbang.com
https://www.tongchalbang.com/auth/callback
```

### 4. Site URL 설정 확인

**Site URL은 프로덕션 주소 유지:**
```
https://www.tongchalbang.com
```

### 5. 저장 및 테스트

1. "Save" 버튼 클릭
2. 브라우저 완전히 종료
3. 새 브라우저 창에서 http://localhost:3000 접속
4. F12 > Console 탭 열기
5. "Google로 계속하기" 클릭
6. 콘솔에서 확인:
   ```
   OAuth Redirect URL: http://localhost:3000/auth/callback
   ```

## 테스트 체크리스트

**로그인 테스트 전:**
- [ ] Supabase Dashboard에 localhost:3000 URL 추가함
- [ ] 설정 저장함
- [ ] 브라우저 완전히 종료함
- [ ] 새 브라우저에서 localhost:3000 접속
- [ ] F12 콘솔 열림

**로그인 시도:**
- [ ] "Google로 계속하기" 클릭
- [ ] Google 계정 선택
- [ ] localhost:3000으로 리다이렉트됨 (프로덕션 아님!)
- [ ] 콘솔에서 "OAuthHandler: Checking hash:" 로그 보임
- [ ] 콘솔에서 "✅ OAuth callback successful" 로그 보임
- [ ] 홈페이지로 이동하고 로그인 상태 확인

## 예상되는 콘솔 로그 (정상)

성공적인 OAuth 로그인 시:

```
OAuthHandler: Checking hash: #access_token=...
✅ OAuth callback detected in hash
Hash length: 450
Calling handleOAuthCallback...
Auth state change: SIGNED_IN {access_token: "..."}
Getting Supabase session...
✅ Session exists
Getting auth user...
✅ Auth user exists: user@example.com
Syncing social user with params: {email: "user@example.com", ...}
✅ Sync successful, user created
handleOAuthCallback result: {success: true, user: {...}, session: {...}}
✅ OAuth callback successful, setting user: 사용자이름
Clearing hash and redirecting to home
```

## 여전히 프로덕션으로 리다이렉트되는 경우

### 문제 1: Supabase 설정 미적용
- 설정 저장 후 최대 5분 정도 소요될 수 있음
- 잠시 기다린 후 다시 시도

### 문제 2: 브라우저 캐시
```bash
# 브라우저에서:
F12 > Application > Storage > Clear site data
Ctrl+Shift+R (하드 리프레시)

# 또는 완전히 새 브라우저 프로필 사용
```

### 문제 3: 잘못된 포트 사용
- 반드시 http://localhost:3000 접속 (5173 아님!)
- vite.config.js 확인: `server: { port: 3000 }`

## 중요 참고사항

1. **로컬 테스트는 반드시 localhost:3000 사용**
2. **Redirect URL은 정확히 일치해야 함** (슬래시, 포트 포함)
3. **개발 환경과 프로덕션 환경이 자동으로 분리됨** (코드 수정 불필요)
4. **소셜 로그인 테스트 시 항상 콘솔 로그 확인**

## 현재 서버 상태 확인

```bash
# 터미널에서 실행 중인 포트 확인
npm run dev

# 출력:
# ➜  Local:   http://localhost:3000/
```

이 포트 번호와 Supabase Redirect URL이 일치해야 합니다!
