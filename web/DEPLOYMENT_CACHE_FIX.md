# 배포 환경 캐시 문제 해결 가이드

## 문제 상황
배포 환경에서 로그인이 무한 로딩에 걸리거나 작동하지 않는 경우

## 원인
Service Worker가 RPC 요청(로그인, 회원가입 등)을 캐싱하여 발생

## 해결 방법

### 1. 즉시 해결 (사용자 브라우저에서)

#### 방법 A: Hard Refresh
- **Windows/Linux**: `Ctrl + Shift + R` 또는 `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

#### 방법 B: Service Worker 수동 제거
1. F12 (개발자 도구 열기)
2. Application 탭 클릭
3. Service Workers 섹션 찾기
4. "Unregister" 클릭
5. Application > Storage > "Clear site data" 클릭
6. 페이지 새로고침

#### 방법 C: 시크릿 모드 테스트
- 시크릿/인코그니토 모드에서 접속하여 캐시 없이 테스트

### 2. 코드 수정 (완료됨)

이미 `vite.config.js`에서 수정 완료:
- ✅ RPC 엔드포인트 캐싱 제외
- ✅ POST 요청 캐싱 제외
- ✅ 인증 관련 엔드포인트 모두 제외
- ✅ 오래된 캐시 자동 정리 활성화

### 3. 배포 단계

#### Step 1: 빌드
```bash
cd web
npm run build
```

#### Step 2: dist 폴더 확인
```bash
# Service Worker 파일이 새로 생성되었는지 확인
ls -la dist/sw.js
ls -la dist/registerSW.js
```

#### Step 3: 배포
```bash
# Vercel 배포 (자동)
git add .
git commit -m "fix: Service Worker 캐싱 정책 수정 - RPC 요청 제외"
git push origin main

# 또는 수동 배포
vercel --prod
```

#### Step 4: 배포 확인
1. 배포 완료 후 URL 접속
2. 개발자 도구 > Network 탭 열기
3. "Disable cache" 체크
4. 로그인 테스트
5. `login_user` RPC 요청이 캐시 없이 전송되는지 확인

### 4. 사용자 공지 (권장)

배포 후 기존 사용자들에게 공지:

```
[공지] 로그인 문제 해결

로그인이 되지 않는 경우, 다음 중 하나를 시도해주세요:

1. 페이지 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)
2. 브라우저 캐시 삭제 후 재접속
3. 시크릿 모드에서 접속

문제가 계속되면 관리자에게 문의해주세요.
```

## 캐시 정책 변경 사항

### 이전 (문제 있음)
```javascript
// ❌ 모든 Supabase 요청 캐싱 (RPC 포함)
urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i
```

### 이후 (수정됨)
```javascript
// ✅ GET 요청만, storage만 캐싱
urlPattern: ({ url, request }) => {
  if (request.method !== 'GET') return false
  if (url.pathname.includes('/rpc/')) return false
  // ... 더 엄격한 필터링
}
```

## 향후 예방 방법

### Service Worker 업데이트 시 주의사항
1. **절대 캐싱하면 안 되는 것들:**
   - POST/PUT/DELETE 요청
   - `/rpc/` 엔드포인트 (모든 동적 작업)
   - `/auth/` 엔드포인트 (인증 관련)
   - `/oauth/` 엔드포인트 (소셜 로그인)

2. **캐싱해도 되는 것들:**
   - GET 요청 중 `/storage/` (이미지 등 정적 파일)
   - CSS, JS, 이미지 등 정적 리소스

### 테스트 체크리스트
배포 전 반드시 확인:
- [ ] 시크릿 모드에서 로그인 테스트
- [ ] Network 탭에서 RPC 요청이 캐시되지 않는지 확인
- [ ] 소셜 로그인 테스트
- [ ] 회원가입 테스트
- [ ] 로그아웃 후 재로그인 테스트

## 문제가 계속되는 경우

### 디버깅 단계

1. **Service Worker 상태 확인**
```javascript
// 브라우저 콘솔에서 실행
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Active Service Workers:', registrations.length)
  registrations.forEach(reg => console.log(reg))
})
```

2. **캐시 내용 확인**
```javascript
// 브라우저 콘솔에서 실행
caches.keys().then(keys => {
  console.log('Cache names:', keys)
  keys.forEach(key => {
    caches.open(key).then(cache => {
      cache.keys().then(requests => {
        console.log(`${key} contains:`, requests.length, 'items')
      })
    })
  })
})
```

3. **모든 캐시 제거**
```javascript
// 브라우저 콘솔에서 실행
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key))
  console.log('All caches deleted')
})
```

4. **Service Worker 강제 제거**
```javascript
// 브라우저 콘솔에서 실행
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister())
  console.log('All service workers unregistered')
})
```

## Vercel 환경 변수 확인

배포 환경에서 환경 변수가 올바른지 확인:
1. Vercel Dashboard 접속
2. 프로젝트 선택
3. Settings > Environment Variables
4. 다음 변수 확인:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 긴급 조치: Service Worker 비활성화

문제가 계속되고 긴급한 경우, 임시로 Service Worker 비활성화:

```javascript
// vite.config.js
VitePWA({
  registerType: 'autoUpdate',
  // 임시로 비활성화
  injectRegister: null, // Service Worker 등록 비활성화
  // ... 나머지 설정
})
```

**주의:** PWA 기능이 모두 비활성화됩니다. 근본 원인 해결 후 다시 활성화하세요.

## 참고 자료

- [Workbox Caching Strategies](https://developer.chrome.com/docs/workbox/caching-strategies-overview/)
- [Service Worker Lifecycle](https://web.dev/service-worker-lifecycle/)
- [Debugging Service Workers](https://developer.chrome.com/docs/devtools/progressive-web-apps/)
