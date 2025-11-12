# Vercel 배포 가이드

## 🚨 문제: package.json을 찾을 수 없음

### 에러 메시지
```
npm error path /vercel/path0/package.json
npm error enoent Could not read package.json
Error: Command "npm install" exited with 254
```

### 원인
프로젝트가 **모노레포 구조**로 되어 있어, `package.json`이 루트가 아닌 `web/` 디렉토리에 있습니다.

```
vote-example/
├── web/           ← 웹 앱 (package.json 여기 있음)
├── app/           ← 모바일 앱
└── (루트에 package.json 없음!)
```

## ✅ 해결 방법

### 방법 1: Vercel Dashboard 설정 (가장 쉬움, 권장)

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard

2. **프로젝트 선택**
   - 해당 프로젝트 클릭

3. **Settings > General**
   - "Root Directory" 섹션 찾기
   - "Edit" 클릭
   - `web` 입력
   - "Save" 클릭

4. **재배포**
   - Deployments 탭으로 이동
   - 최근 실패한 배포 찾기
   - "Redeploy" 클릭

### 방법 2: vercel.json 설정 (코드로 관리)

이미 `web/vercel.json`이 업데이트되었습니다:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install"
}
```

**하지만**, Vercel Dashboard에서 Root Directory를 설정하는 것이 더 확실합니다.

## 📋 Vercel 설정 상세

### Root Directory 설정 후 확인할 것

Vercel Dashboard > Settings > General:

| 설정 항목 | 값 |
|----------|-----|
| **Root Directory** | `web` |
| **Build Command** | `npm run build` (자동 감지) |
| **Output Directory** | `dist` (자동 감지) |
| **Install Command** | `npm install` (자동 감지) |
| **Framework Preset** | `Vite` (자동 감지) |

### 환경 변수 설정

Vercel Dashboard > Settings > Environment Variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_KAKAO_CLIENT_ID=your-kakao-id
VITE_KAKAO_CLIENT_SECRET=your-kakao-secret
```

**중요:**
- 모든 환경에 적용: Production, Preview, Development 모두 체크
- `.env` 파일은 Git에 올리지 않으므로 Vercel에서 직접 설정 필요

## 🚀 배포 단계

### 1. Git 커밋 및 푸시

```bash
git add .
git commit -m "fix: Vercel 배포 설정 추가 - Root Directory 문제 해결"
git push origin main
```

### 2. Vercel Dashboard에서 Root Directory 설정

위의 "방법 1" 참조

### 3. 수동 재배포

- Deployments 탭
- "Redeploy" 버튼 클릭

### 4. 배포 로그 확인

성공 시 다음과 같은 로그가 보여야 합니다:

```
✓ Installing dependencies...
✓ Running "npm run build"...
✓ Build completed
✓ Deploying...
✓ Deployment complete
```

## 🔍 문제 해결

### 여전히 package.json을 못 찾는 경우

#### 확인 1: Root Directory가 설정되었는지
```
Vercel Dashboard > Settings > General > Root Directory
값: web
```

#### 확인 2: 경로가 올바른지
```bash
# 로컬에서 확인
ls web/package.json  # 파일이 존재해야 함
```

#### 확인 3: Git에 web/ 폴더가 포함되었는지
```bash
git ls-files | grep "web/package.json"
# 출력: web/package.json (있어야 함)
```

### 빌드는 되는데 404 에러가 나는 경우

**원인:** SPA 라우팅 문제

**해결:** `web/vercel.json`에 rewrites 설정 (이미 완료됨)

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 환경 변수가 undefined인 경우

**원인:** Vercel에 환경 변수 미설정

**해결:**
1. Vercel Dashboard > Settings > Environment Variables
2. 모든 `VITE_*` 변수 추가
3. Production, Preview, Development 모두 체크
4. "Save" 후 재배포

## 📊 배포 체크리스트

배포 전:
- [ ] `web/package.json` 파일 존재 확인
- [ ] `web/.gitignore`에 `dist/`, `node_modules/` 포함 확인
- [ ] 로컬에서 `npm run build` 성공 확인
- [ ] 환경 변수 준비 완료

Vercel 설정:
- [ ] Root Directory = `web` 설정
- [ ] 환경 변수 모두 입력
- [ ] Framework Preset = Vite 확인

배포 후:
- [ ] 배포 성공 확인
- [ ] URL 접속하여 페이지 로드 확인
- [ ] 로그인 기능 테스트
- [ ] 소셜 로그인 테스트 (Redirect URL 확인 필요)

## 🔗 소셜 로그인 추가 설정

### Google OAuth (Supabase)

Supabase Dashboard > Authentication > URL Configuration:
```
Site URL: https://your-domain.vercel.app
Redirect URLs: https://your-domain.vercel.app/auth/callback
```

### Kakao OAuth

Kakao Developers > 내 애플리케이션 > 앱 설정 > 플랫폼:
```
Web 플랫폼 추가
사이트 도메인: https://your-domain.vercel.app

Redirect URI:
https://your-domain.vercel.app/auth/callback
```

## 🎯 최종 확인

배포 완료 후:
1. https://your-domain.vercel.app 접속
2. 로그인 테스트
3. 소셜 로그인 테스트
4. 페이지 라우팅 테스트 (/meetings, /votes 등)

## 🆘 그래도 안 되면

### Vercel 로그 확인
```
Vercel Dashboard > Deployments > [실패한 배포] > View Logs
```

### 로컬 빌드 테스트
```bash
cd web
npm install
npm run build
npm run preview  # 빌드된 결과 미리보기
```

### Vercel Support
- https://vercel.com/help
- Community: https://github.com/vercel/vercel/discussions

## 📚 참고 자료

- [Vercel Monorepo Guide](https://vercel.com/docs/concepts/monorepos)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
