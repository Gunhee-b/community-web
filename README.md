# 통찰방 커뮤니티 플랫폼

250명 규모 커뮤니티를 위한 투표 및 철학챗 웹/모바일 애플리케이션

**현재 버전**: v2.6.0
**최종 업데이트**: 2025년 11월 5일

---

## 📚 프로젝트 문서 (필독!)

### ⭐ 핵심 문서 (반드시 읽어야 할 문서)

1. **[CURRENT_PROJECT_STATUS.md](CURRENT_PROJECT_STATUS.md)** - 현재 프로젝트 진행 상황
   - 완료된 기능 목록
   - 알려진 문제 및 해결 방법
   - 기술 스택 및 프로젝트 구조
   - 최근 업데이트 내역

2. **[APP_LAUNCH_TODO.md](APP_LAUNCH_TODO.md)** - 앱 정식 출시 체크리스트
   - Phase 1: 긴급 해결 사항 (배포 블로커)
   - Phase 2: 배포 전 필수 사항
   - Phase 3: iOS App Store 제출
   - Phase 4: Android Google Play 제출
   - Phase 5: 푸시 알림 구현 (선택)

### 📁 기타 문서

나머지 모든 기술 문서는 **[markdown/](markdown/)** 폴더에 정리되어 있습니다:

- **설정 가이드**: CAPACITOR_SETUP.md, SOCIAL_LOGIN_SETUP_GUIDE.md, NOTIFICATION_GUIDE.md
- **기능 설명**: FEATURES.md, PROJECT_SUMMARY.md, NEW_FEATURES.md
- **배포 가이드**: DEPLOYMENT.md, MOBILE_DEPLOYMENT_NOTES.md, MOBILE_DEPLOYMENT_CHECKLIST.md
- **문제 해결**: CURRENT_STATUS.md, QUICK_FIX_GUIDE.md, XCODE_TROUBLESHOOTING.md
- **개발 가이드**: DEVELOPMENT.md, SYNC_GUIDE.md, INTEGRATION_GUIDE.md

**전체 문서 목록**: [markdown/](markdown/) 폴더에서 확인하세요.

---

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
git clone <repository-url>
cd vote-example
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
```

`.env` 파일에 다음 정보 입력:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_KAKAO_CLIENT_ID=your-kakao-client-id
VITE_KAKAO_CLIENT_SECRET=your-kakao-client-secret
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 4. 모바일 앱 실행 (선택)

#### iOS
```bash
npm run build && npx cap sync ios
npx cap open ios
```

#### Android
```bash
npm run build && npx cap sync android
npx cap open android
```

상세한 설정 방법은 **[markdown/CAPACITOR_SETUP.md](markdown/CAPACITOR_SETUP.md)** 참조

---

## ✨ 주요 기능

### 1. 투표 시스템
- 2주 단위 투표 기간 자동 생성
- 글 추천 및 투표 (중복 투표 가능)
- 우승자 자동 선정

### 2. 철학챗 (모임) 시스템
- 정기 모임 / 즉흥 모임 (취미/토론)
- 카카오톡 오픈채팅 연동
- 실시간 익명 채팅
- 참석 체크 및 참여 횟수 추적
- 로그인 없이도 조회 가능

### 3. 오늘의 질문
- 일일 질문 자동 생성
- 개인 답변 (비공개)
- 공개 답변 (커뮤니티 공유)
- 이미지 업로드 (최대 2장)
- 댓글 시스템

### 4. 인증 시스템
- 초대 코드 기반 회원가입
- 소셜 로그인 (Google, Kakao)
- 3단계 역할 시스템 (관리자/모임장/일반)

### 5. 모바일 앱 (Capacitor)
- iOS (App Store 준비 중)
- Android (Google Play 준비 중)
- 네이티브 기능 (카메라, 푸시 알림 등)

### 6. 알림 시스템
- 웹 기반 알림 벨
- 실시간 채팅 알림
- 알림 관리 (개별/전체 삭제)

---

## 🛠 기술 스택

### Frontend
- React 18 + Vite
- Tailwind CSS
- Zustand (상태 관리)
- React Router 6

### Backend & Database
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Realtime (채팅)
- Storage (이미지)

### Mobile
- Capacitor 7
- iOS (Xcode 17)
- Android (Gradle)

### Deployment
- Vercel (웹)
- App Store (iOS)
- Google Play (Android)

---

## 📊 현재 진행 상황

**전체 진행률**: 85%

- ✅ 투표 시스템: 100%
- ✅ 철학챗 (모임): 95%
- ⚠️ 오늘의 질문: 90% (이미지 업로드 400 에러)
- ✅ 인증 시스템: 100%
- 🔄 모바일 앱 (iOS): 85%
- 🔄 모바일 앱 (Android): 80%
- 🔄 알림 시스템: 70%

**알려진 문제**:
- 🔴 이미지 업로드 400 에러 (Supabase Storage 설정 필요)
- 🟡 Kakao 로그인 KOE006 에러 (Redirect URI 설정 필요)
- 🟡 실기기 테스트 미완료 (iOS/Android)

상세 내용은 **[CURRENT_PROJECT_STATUS.md](CURRENT_PROJECT_STATUS.md)** 참조

---

## 🎯 다음 단계

### 이번 주 (11/5 ~ 11/7)
1. 🔴 이미지 업로드 400 에러 해결
2. 🔴 Kakao 로그인 KOE006 에러 해결
3. 🔴 iPhone 12 실기기 테스트

### 다음 주 (11/8 ~ 11/14)
1. 🟡 Android 에뮬레이터/실기기 테스트
2. 🟡 앱 아이콘 및 스플래시 생성
3. 🟡 스크린샷 촬영 (iOS/Android)
4. 🟡 개인정보 처리방침 작성

### 그 다음 주 (11/15 ~ 11/21)
1. 🟢 iOS App Store 제출
2. 🟢 Android Google Play 제출
3. 🟢 TestFlight 베타 테스트

전체 일정은 **[APP_LAUNCH_TODO.md](APP_LAUNCH_TODO.md)** 참조

---

## 🔒 보안

- Row Level Security (RLS) 모든 테이블 적용
- bcrypt 비밀번호 해싱
- SQL Injection 방지 (Supabase 쿼리 빌더)
- XSS 방지 (React 자동 이스케이핑)

---

## 🤝 기여

버그 리포트나 기능 제안은 이슈로 남겨주세요.

---

## 📄 라이선스

MIT License

---

**최종 업데이트**: 2025년 11월 5일
**개발**: Claude Code

**중요**: 프로젝트를 시작하기 전에 반드시 [CURRENT_PROJECT_STATUS.md](CURRENT_PROJECT_STATUS.md)와 [APP_LAUNCH_TODO.md](APP_LAUNCH_TODO.md)를 읽어주세요!
