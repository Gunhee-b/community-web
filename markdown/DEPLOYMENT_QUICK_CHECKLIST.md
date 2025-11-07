# ⚡ 배포 빠른 체크리스트

**목적**: 배포 시 빠르게 확인할 수 있는 요약 가이드

---

## 🎯 배포 전 준비 (5분)

### 1. 프로덕션 도메인 확인
```
프로덕션 도메인: _____________________
예시: ingk-community.vercel.app
```

---

## ⚙️ 설정 단계 (각 15분)

### 📍 Step 1: Supabase Dashboard

[Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 선택

#### URL Configuration
- [ ] **Site URL**: `https://YOUR-DOMAIN.vercel.app`
- [ ] **Redirect URLs**: `https://YOUR-DOMAIN.vercel.app/**`
- [ ] **Save** 클릭

#### Google Provider 확인
- [ ] Authentication → Providers → Google 활성화 확인

---

### 📍 Step 2: Google Cloud Console

[Google Cloud Console](https://console.cloud.google.com)

#### Credentials 설정
- [ ] **Authorized redirect URIs** 추가:
  ```
  https://wghrshqnexgaojxrtiit.supabase.co/auth/v1/callback
  ```

- [ ] **Authorized JavaScript origins** 추가:
  ```
  https://YOUR-DOMAIN.vercel.app
  https://wghrshqnexgaojxrtiit.supabase.co
  ```

- [ ] **Save** 클릭

---

### 📍 Step 3: Kakao Developers

[Kakao Developers](https://developers.kakao.com) → 내 애플리케이션

#### 플랫폼 설정
- [ ] **앱 설정** → **플랫폼** → **Web 플랫폼 등록**
- [ ] **사이트 도메인**: `https://YOUR-DOMAIN.vercel.app`

#### Redirect URI 설정
- [ ] **제품 설정** → **카카오 로그인** → **Redirect URI**
- [ ] 추가: `https://YOUR-DOMAIN.vercel.app/auth/callback`
- [ ] **저장** 클릭

#### 동의 항목 확인
- [ ] **프로필 정보**: 필수 동의 ✅
- [ ] **카카오계정(이메일)**: 필수 동의 ✅

---

### 📍 Step 4: Vercel 환경 변수

[Vercel Dashboard](https://vercel.com/dashboard) → 프로젝트 → Settings → Environment Variables

#### 환경 변수 추가 (모든 환경 선택)

- [ ] `VITE_SUPABASE_URL` = `https://wghrshqnexgaojxrtiit.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- [ ] `VITE_KAKAO_CLIENT_ID` = `57450a0289e45de479273c9fc168f4fb`
- [ ] `VITE_KAKAO_CLIENT_SECRET` = `8RH5CP2H6mm78j9D3BxMbjMeWE8eV0b9`

**주의**: 각 변수마다 Production, Preview, Development 모두 체크!

---

### 📍 Step 5: Vercel 배포

#### 처음 배포
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```
→ Vercel Dashboard → Add New Project → Import

#### 재배포 (환경 변수만 변경)
→ Vercel Dashboard → Deployments → 최신 배포 → ⋯ → Redeploy

---

## ✅ 배포 후 테스트 (5분)

### 필수 테스트

1. [ ] **사이트 접속**: `https://YOUR-DOMAIN.vercel.app`
2. [ ] **Google 로그인**:
   - "Google로 계속하기" 클릭
   - 계정 선택 → 로그인 성공
3. [ ] **Kakao 로그인**:
   - "카카오로 계속하기" 클릭
   - 로그인 → 동의 → 성공
4. [ ] **세션 유지**: 페이지 새로고침 → 로그인 상태 유지
5. [ ] **로그아웃**: 정상 작동 확인

### 개발자 도구 확인 (F12)
- [ ] Console: 에러 없음
- [ ] Network: `/auth/callback` 요청 성공
- [ ] Application → Local Storage: `supabase.auth.token` 존재

---

## 🔥 자주 발생하는 문제

### ❌ "Redirect URI mismatch"
→ **해결**: Google/Kakao Console에서 Redirect URI 다시 확인

### ❌ "Kakao KOE006 에러"
→ **해결**: Kakao Redirect URI가 정확히 일치하는지 확인
- https vs http
- 끝에 슬래시(/) 없는지
- 대소문자 일치

### ❌ "환경 변수를 찾을 수 없음"
→ **해결**: Vercel 환경 변수 재확인 → Redeploy

### ❌ "빌드 실패"
→ **해결**: 로컬에서 `npm run build` 테스트 → 에러 수정

---

## 🎉 완료!

모든 체크박스가 체크되었다면 배포 완료!

### 문제 발생 시
👉 상세 가이드: `PRODUCTION_DEPLOYMENT_GUIDE.md` 참조

---

**작성일**: 2025-11-07
**소요 시간**: 약 40-50분
