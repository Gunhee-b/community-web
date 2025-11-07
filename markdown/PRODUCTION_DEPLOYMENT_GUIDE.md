# 🚀 프로덕션 배포 가이드 (소셜 로그인 포함)

**작성일**: 2025-11-07
**대상**: ING:K 커뮤니티 (통찰방) 프로젝트
**플랫폼**: Vercel + Supabase

---

## 📋 목차

1. [배포 전 체크리스트](#배포-전-체크리스트)
2. [1단계: 프로덕션 도메인 확인](#1단계-프로덕션-도메인-확인)
3. [2단계: Supabase Dashboard 설정](#2단계-supabase-dashboard-설정)
4. [3단계: Google Cloud Console 설정](#3단계-google-cloud-console-설정)
5. [4단계: Kakao Developers 설정](#4단계-kakao-developers-설정)
6. [5단계: Vercel 환경 변수 설정](#5단계-vercel-환경-변수-설정)
7. [6단계: Vercel 배포](#6단계-vercel-배포)
8. [7단계: 배포 후 테스트](#7단계-배포-후-테스트)
9. [문제 해결](#문제-해결)

---

## 배포 전 체크리스트

### ✅ 필수 확인 사항

- [ ] Supabase 프로젝트 생성 완료
- [ ] 모든 마이그레이션 실행 완료
- [ ] Google OAuth 클라이언트 생성 완료
- [ ] Kakao 앱 생성 및 REST API 키 발급 완료
- [ ] localhost에서 Google 및 Kakao 로그인 테스트 완료
- [ ] Vercel 계정 생성 완료
- [ ] 프로덕션 도메인 결정 (Vercel 기본 도메인 또는 커스텀 도메인)

### 📝 준비물

현재 프로젝트 정보:
```
Supabase URL: https://wghrshqnexgaojxrtiit.supabase.co
Supabase Project Ref: wghrshqnexgaojxrtiit
Kakao Client ID: 57450a0289e45de479273c9fc168f4fb
Kakao Client Secret: (설정됨)
```

---

## 1단계: 프로덕션 도메인 확인

### 1.1 Vercel 프로젝트 생성 또는 확인

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 기존 프로젝트가 있다면 확인, 없다면 새로 생성
3. 프로덕션 도메인 확인:
   - **Vercel 기본 도메인**: `your-project-name.vercel.app`
   - **커스텀 도메인**: 예) `ingk.app`, `tongchalban.com` 등

### 1.2 도메인 기록

배포 후 도메인을 다음과 같이 기록하세요:
```
프로덕션 도메인: _____________________
예시: ingk-community.vercel.app
```

---

## 2단계: Supabase Dashboard 설정

### 2.1 Google Provider Redirect URI 추가

1. [Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 선택
2. **Authentication** → **URL Configuration** 이동
3. **Site URL** 설정:
   ```
   https://YOUR-PRODUCTION-DOMAIN.vercel.app
   ```
   또는 커스텀 도메인:
   ```
   https://ingk.app
   ```

4. **Redirect URLs** 섹션에 추가:
   ```
   https://YOUR-PRODUCTION-DOMAIN.vercel.app/**
   https://YOUR-PRODUCTION-DOMAIN.vercel.app/auth/callback
   ```

5. **Save** 클릭

### 2.2 Google Provider 확인

1. **Authentication** → **Providers** → **Google**
2. 다음 정보가 올바르게 설정되어 있는지 확인:
   - ✅ Google Provider 활성화됨
   - ✅ Client ID 입력됨
   - ✅ Client Secret 입력됨

3. **Authorized redirect URI** 확인:
   ```
   https://wghrshqnexgaojxrtiit.supabase.co/auth/v1/callback
   ```
   (이 URI는 Supabase가 자동으로 관리합니다)

---

## 3단계: Google Cloud Console 설정

### 3.1 Authorized redirect URIs 추가

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 선택
3. **APIs & Services** → **Credentials**
4. 기존 OAuth 2.0 Client ID 선택
5. **Authorized redirect URIs** 섹션에 다음 추가:

   ```
   https://wghrshqnexgaojxrtiit.supabase.co/auth/v1/callback
   ```

   **중요**: localhost URI는 그대로 두세요 (로컬 개발용)
   ```
   http://localhost:5173/auth/callback
   ```

6. **Save** 클릭

### 3.2 Authorized JavaScript origins 추가

**Authorized JavaScript origins** 섹션에 추가:
```
https://YOUR-PRODUCTION-DOMAIN.vercel.app
```

예시:
```
https://ingk-community.vercel.app
https://wghrshqnexgaojxrtiit.supabase.co
```

---

## 4단계: Kakao Developers 설정

### 4.1 플랫폼 추가

1. [Kakao Developers](https://developers.kakao.com) 접속
2. **내 애플리케이션** → 앱 선택
3. **앱 설정** → **플랫폼**
4. **Web 플랫폼 등록** (아직 안 했다면):
   - **사이트 도메인**:
     ```
     https://YOUR-PRODUCTION-DOMAIN.vercel.app
     ```

### 4.2 Redirect URI 추가

1. **제품 설정** → **카카오 로그인**
2. **Redirect URI** 섹션에 다음 추가:

   **프로덕션 URI**:
   ```
   https://YOUR-PRODUCTION-DOMAIN.vercel.app/auth/callback
   ```

   **기존 localhost URI 유지** (로컬 개발용):
   ```
   http://localhost:5173/auth/callback
   ```

3. **저장** 클릭

### 4.3 Web 사이트 도메인 설정

1. **앱 설정** → **플랫폼** → **Web**
2. **사이트 도메인** 추가:
   ```
   https://YOUR-PRODUCTION-DOMAIN.vercel.app
   ```

### 4.4 동의 항목 확인

1. **제품 설정** → **카카오 로그인** → **동의항목**
2. 다음 항목이 활성화되어 있는지 확인:
   - ✅ **프로필 정보 (닉네임/프로필 사진)**: 필수 동의
   - ✅ **카카오계정(이메일)**: 필수 동의

---

## 5단계: Vercel 환경 변수 설정

### 5.1 Vercel Dashboard에서 설정

1. [Vercel Dashboard](https://vercel.com/dashboard) → 프로젝트 선택
2. **Settings** → **Environment Variables**
3. 다음 환경 변수 추가:

#### 필수 환경 변수

| 변수명 | 값 | 환경 |
|--------|-----|------|
| `VITE_SUPABASE_URL` | `https://wghrshqnexgaojxrtiit.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |
| `VITE_KAKAO_CLIENT_ID` | `57450a0289e45de479273c9fc168f4fb` | Production, Preview, Development |
| `VITE_KAKAO_CLIENT_SECRET` | `8RH5CP2H6mm78j9D3BxMbjMeWE8eV0b9` | Production, Preview, Development |

**주의**:
- Supabase Anon Key는 `.env` 파일에서 전체 값을 복사하세요
- 모든 환경 변수 이름이 `VITE_`로 시작하는지 확인하세요 (Vite 필수)

### 5.2 환경 변수 추가 방법

각 변수마다:
1. **Key** 입력: `VITE_SUPABASE_URL`
2. **Value** 입력: 해당 값
3. **Environments** 선택: `Production`, `Preview`, `Development` 모두 체크
4. **Add** 클릭

---

## 6단계: Vercel 배포

### 6.1 Git Repository 연결 (처음 배포하는 경우)

1. GitHub/GitLab/Bitbucket에 코드 푸시
   ```bash
   git add .
   git commit -m "Add social login for production"
   git push origin main
   ```

2. Vercel Dashboard → **Add New Project**
3. Repository 선택
4. **Import** 클릭

### 6.2 프로젝트 설정

**Framework Preset**: Vite
**Build Command**: `npm run build`
**Output Directory**: `dist`
**Install Command**: `npm install`

### 6.3 배포 시작

1. **Deploy** 버튼 클릭
2. 빌드 로그 확인 (약 1-2분 소요)
3. 배포 완료 후 도메인 확인

### 6.4 이미 배포된 프로젝트 재배포

환경 변수만 변경한 경우:
1. Vercel Dashboard → 프로젝트 선택
2. **Deployments** 탭
3. 최신 배포 항목에서 **⋯** → **Redeploy**
4. **Redeploy** 확인

또는 코드 푸시:
```bash
git add .
git commit -m "Update environment variables"
git push origin main
```
→ Vercel이 자동으로 재배포합니다

---

## 7단계: 배포 후 테스트

### 7.1 웹 브라우저에서 테스트

1. 프로덕션 도메인 접속:
   ```
   https://YOUR-PRODUCTION-DOMAIN.vercel.app
   ```

2. **Google 로그인 테스트**:
   - 로그인 페이지 이동
   - "Google로 계속하기" 버튼 클릭
   - Google 계정 선택
   - 로그인 성공 확인
   - 홈 페이지로 리다이렉트 확인

3. **Kakao 로그인 테스트**:
   - 로그인 페이지 이동
   - "카카오로 계속하기" 버튼 클릭
   - 카카오 계정 로그인
   - 동의 화면에서 "동의하고 계속하기"
   - 로그인 성공 확인
   - 홈 페이지로 리다이렉트 확인

### 7.2 테스트 체크리스트

- [ ] Google 로그인 성공
- [ ] Kakao 로그인 성공
- [ ] 로그인 후 사용자 정보 표시됨
- [ ] 페이지 새로고침 후 세션 유지됨
- [ ] 로그아웃 후 재로그인 가능
- [ ] 프로필 페이지 정상 표시
- [ ] 소셜 계정 아바타 이미지 표시됨 (있는 경우)

### 7.3 브라우저 개발자 도구 확인

F12 키를 눌러 개발자 도구 열기:

1. **Console 탭**: 에러 메시지가 없는지 확인
2. **Network 탭**:
   - `/auth/callback` 요청이 성공하는지 확인
   - Supabase API 요청이 정상적으로 처리되는지 확인
3. **Application 탭** → **Local Storage**:
   - `supabase.auth.token` 확인
   - 토큰이 제대로 저장되어 있는지 확인

---

## 문제 해결

### ❌ 문제 1: "Redirect URI mismatch" 오류

**증상**:
```
Error: redirect_uri_mismatch
The redirect URI in the request does not match...
```

**원인**: OAuth Provider에 Redirect URI가 등록되지 않음

**해결방법**:

1. **Google 로그인 오류인 경우**:
   - Google Cloud Console → Credentials
   - OAuth 2.0 Client ID 선택
   - Authorized redirect URIs에 다음 확인:
     ```
     https://wghrshqnexgaojxrtiit.supabase.co/auth/v1/callback
     ```

2. **Kakao 로그인 오류인 경우**:
   - Kakao Developers → 카카오 로그인 → Redirect URI
   - 다음 URI가 등록되어 있는지 확인:
     ```
     https://YOUR-PRODUCTION-DOMAIN.vercel.app/auth/callback
     ```

### ❌ 문제 2: 환경 변수를 찾을 수 없음

**증상**:
```
Kakao Client ID is not configured
```

**원인**: Vercel 환경 변수가 설정되지 않았거나 이름이 잘못됨

**해결방법**:
1. Vercel Dashboard → Settings → Environment Variables
2. 모든 변수가 `VITE_`로 시작하는지 확인
3. 변수 값에 따옴표(`"`) 없이 입력되어 있는지 확인
4. 환경 변수 추가/수정 후 **Redeploy** 필수

### ❌ 문제 3: 로그인 후 빈 화면

**증상**: OAuth 로그인 후 페이지가 로딩되지 않음

**원인**: Supabase Redirect URLs 설정 오류

**해결방법**:
1. Supabase Dashboard → Authentication → URL Configuration
2. **Site URL** 확인:
   ```
   https://YOUR-PRODUCTION-DOMAIN.vercel.app
   ```
3. **Redirect URLs** 확인:
   ```
   https://YOUR-PRODUCTION-DOMAIN.vercel.app/**
   ```

### ❌ 문제 4: Kakao "KOE006" 오류

**증상**:
```
KOE006: Invalid redirect_uri
```

**원인**: Kakao Redirect URI와 실제 요청 URI가 일치하지 않음

**해결방법**:
1. Kakao Developers → 카카오 로그인 → Redirect URI
2. 정확히 다음 형식으로 등록:
   ```
   https://YOUR-PRODUCTION-DOMAIN.vercel.app/auth/callback
   ```
3. **http** vs **https** 확인
4. 끝에 슬래시(`/`) 있는지 확인 (있으면 제거)
5. 대소문자 정확히 일치하는지 확인

### ❌ 문제 5: 로그인은 되는데 사용자 정보가 없음

**증상**: 로그인 성공하지만 프로필 정보가 표시되지 않음

**원인**: 데이터베이스 함수 또는 RLS 정책 문제

**해결방법**:
1. Supabase SQL Editor에서 확인:
   ```sql
   SELECT * FROM users WHERE email = 'your-email@gmail.com';
   ```
2. 사용자가 생성되었는지 확인
3. 생성되지 않았다면 마이그레이션 재실행:
   ```sql
   -- 20250131_add_social_login_support.sql 실행
   ```

### ❌ 문제 6: 빌드 실패

**증상**: Vercel 빌드 중 에러 발생

**원인**: 환경 변수 없음 또는 의존성 문제

**해결방법**:
1. **환경 변수 확인**: 모든 `VITE_*` 변수가 설정되어 있는지 확인
2. **로컬에서 빌드 테스트**:
   ```bash
   npm run build
   ```
3. 에러 메시지 확인 및 해결
4. 수정 후 다시 푸시

---

## 📊 배포 완료 체크리스트

### Supabase 설정
- [ ] Site URL 설정 완료
- [ ] Redirect URLs 추가 완료
- [ ] Google Provider 활성화 확인

### Google Cloud Console
- [ ] Authorized redirect URIs 추가 완료
- [ ] Authorized JavaScript origins 추가 완료

### Kakao Developers
- [ ] Web 플랫폼 도메인 등록 완료
- [ ] Redirect URI 추가 완료
- [ ] 동의 항목 설정 확인

### Vercel 설정
- [ ] 환경 변수 모두 추가 완료
- [ ] 배포 성공
- [ ] 프로덕션 도메인 접속 확인

### 기능 테스트
- [ ] Google 로그인 작동
- [ ] Kakao 로그인 작동
- [ ] 사용자 정보 표시
- [ ] 세션 유지
- [ ] 로그아웃 및 재로그인

---

## 🎉 배포 완료!

모든 단계를 완료하셨다면 프로덕션 환경에서 소셜 로그인이 정상적으로 작동할 것입니다.

### 다음 단계

1. **사용자 공지**: 새로운 소셜 로그인 기능 안내
2. **모니터링**: Supabase Dashboard에서 로그인 통계 확인
3. **피드백 수집**: 사용자 피드백 받기
4. **최적화**: 필요시 추가 개선

### 유용한 링크

- **프로덕션 사이트**: `https://YOUR-PRODUCTION-DOMAIN.vercel.app`
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Google Cloud Console**: https://console.cloud.google.com
- **Kakao Developers**: https://developers.kakao.com

---

**작성자**: Claude Code
**최종 업데이트**: 2025-11-07
**버전**: 1.0.0
