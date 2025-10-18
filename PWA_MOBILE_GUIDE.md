# PWA 및 모바일 반응형 가이드

## 📱 구현 완료 사항

### 1. PWA 기능
- ✅ Service Worker 자동 등록 (vite-plugin-pwa)
- ✅ 오프라인 지원
- ✅ 앱 설치 프롬프트
- ✅ 자동 업데이트 감지
- ✅ Supabase API 캐싱

### 2. 모바일 반응형 UI
- ✅ 햄버거 메뉴 (모바일)
- ✅ 슬라이드 사이드바
- ✅ 하단 네비게이션 바
- ✅ 터치 친화적 UI (최소 44px 터치 영역)
- ✅ 모바일 최적화 CSS
- ✅ Safe area insets 지원

### 3. 반응형 브레이크포인트
- 모바일: 320px ~ 767px
- 태블릿: 768px ~ 1023px
- 데스크톱: 1024px 이상

## 🚀 설정 방법

### 1. PWA 아이콘 생성

PWA 아이콘을 생성하려면 다음 크기의 PNG 파일이 필요합니다:

1. **기본 아이콘 준비**
   - 512x512px PNG 파일 준비
   - 배경은 단색 또는 투명
   - 통찰방 로고 또는 앱 아이콘 디자인

2. **아이콘 생성 도구 사용**
   - [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator) 사용 권장
   - 또는 온라인 도구: https://realfavicongenerator.net/

3. **생성할 파일들**
   ```
   public/
   ├── pwa-192x192.png     (192x192px)
   ├── pwa-512x512.png     (512x512px)
   ├── apple-touch-icon.png (180x180px)
   └── favicon.ico          (32x32px)
   ```

4. **수동 생성 (ImageMagick 사용)**
   ```bash
   # 512x512 원본 이미지에서 다양한 크기 생성
   convert icon-512.png -resize 192x192 public/pwa-192x192.png
   convert icon-512.png -resize 512x512 public/pwa-512x512.png
   convert icon-512.png -resize 180x180 public/apple-touch-icon.png
   convert icon-512.png -resize 32x32 public/favicon.ico
   ```

### 2. 개발 서버 실행

```bash
npm run dev
```

- PWA는 개발 모드에서도 활성화됩니다 (devOptions.enabled: true)
- 브라우저 DevTools > Application > Service Workers에서 확인 가능

### 3. 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 📦 배포 (Vercel)

### vercel.json 추가

프로젝트 루트에 `vercel.json` 파일 생성:

```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Vercel 배포 단계

1. GitHub에 코드 푸시
2. Vercel 대시보드에서 프로젝트 연결
3. 환경 변수 설정:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 배포 실행

## 🧪 테스트 방법

### 모바일 반응형 테스트

1. **브라우저 DevTools**
   ```
   F12 > Toggle Device Toolbar (Ctrl+Shift+M)
   ```
   - iPhone SE (375x667)
   - iPhone 12 Pro (390x844)
   - iPad (768x1024)
   - Galaxy S20 (360x800)

2. **실제 기기 테스트**
   - 로컬 네트워크에서 접속
   ```bash
   npm run dev -- --host
   # 출력: Network: http://192.168.x.x:3000
   ```
   - 모바일 기기에서 해당 IP로 접속

### PWA 기능 테스트

1. **Service Worker 확인**
   - DevTools > Application > Service Workers
   - Status가 "activated and running" 확인

2. **오프라인 모드 테스트**
   - DevTools > Application > Service Workers
   - "Offline" 체크박스 활성화
   - 페이지 새로고침 - 여전히 작동하는지 확인

3. **설치 프롬프트 테스트**
   - Chrome (Android): 주소창 옆 설치 버튼
   - Safari (iOS): 공유 > 홈 화면에 추가

4. **캐시 확인**
   - DevTools > Application > Cache Storage
   - workbox-precache 확인

## 🎨 모바일 UI 구성 요소

### 1. 상단 헤더
- **데스크톱**: 로고 + 네비게이션 + 사용자 정보
- **모바일**: 햄버거 메뉴 + 로고 + 알림

### 2. 사이드바 메뉴 (모바일 전용)
- 햄버거 버튼 클릭 시 왼쪽에서 슬라이드
- 배경 오버레이 클릭 시 닫힘
- 메뉴 항목: 홈, 투표, 베스트 글, 모임, 프로필, 관리자(해당 시)

### 3. 하단 네비게이션 (모바일 전용)
- 고정 위치 (fixed bottom)
- 4개 주요 메뉴: 홈, 투표, 모임, 프로필
- 현재 페이지 강조 표시

## 💡 모바일 UX 최적화

### 터치 최적화
- 최소 터치 영역: 44x44px
- 버튼 간 충분한 간격
- 탭 하이라이트 색상 커스터마이징

### 성능 최적화
- 이미지 lazy loading
- 코드 스플리팅
- Service Worker 캐싱
- 최소 44px 터치 영역

### 접근성
- 시맨틱 HTML
- ARIA 레이블
- 키보드 네비게이션
- 고대비 색상

## 🔧 문제 해결

### PWA 설치가 안 되는 경우

1. **HTTPS 필요**
   - localhost는 예외
   - 프로덕션은 반드시 HTTPS 필요

2. **매니페스트 확인**
   - DevTools > Application > Manifest
   - 모든 필수 필드 확인

3. **Service Worker 등록 확인**
   - DevTools > Application > Service Workers
   - 에러 메시지 확인

### 모바일에서 레이아웃이 깨지는 경우

1. **Viewport 메타 태그 확인**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
   ```

2. **반응형 클래스 확인**
   - Tailwind CSS: `md:`, `lg:` 접두사
   - 브레이크포인트: 768px, 1024px

3. **하단 네비게이션 공간**
   - 메인 콘텐츠에 `pb-20` 패딩 확인

## 📊 성능 모니터링

### Lighthouse 점수 목표
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- PWA: 90+

### 실행 방법
```bash
npm run build
npm run preview
# DevTools > Lighthouse > Generate Report
```

## 🔄 업데이트 배포

1. 코드 수정 후 빌드
2. Vercel 자동 배포
3. 사용자에게 업데이트 알림 표시
4. 사용자가 수락하면 새로고침

## 📝 추가 기능 제안

### 향후 개선 사항
- [ ] Push 알림
- [ ] 백그라운드 동기화
- [ ] 오프라인 큐 (작성한 글 임시 저장)
- [ ] 스와이프 제스처 (뒤로가기 등)
- [ ] Pull-to-refresh
- [ ] 다크모드
- [ ] 앱 바로가기 (shortcuts)

## 🆘 지원

문제가 발생하면:
1. 브라우저 콘솔 확인
2. Service Worker 로그 확인
3. Network 탭에서 API 요청 확인
4. GitHub Issues에 문의

---

**버전**: 1.0.0 (PWA + Mobile)
**최종 업데이트**: 2024년 10월 18일
**개발**: Claude Code
