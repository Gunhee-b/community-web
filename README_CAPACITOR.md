# 통찰방 모바일 앱

React 웹 앱을 Capacitor로 iOS/Android 네이티브 앱으로 변환한 프로젝트입니다.

## 빠른 시작

### 필수 요구사항

- Node.js 18+
- Xcode (iOS 개발용, macOS만 해당)
- Android Studio (Android 개발용)
- CocoaPods (iOS용)

### 설치

```bash
# 의존성 설치
npm install

# 웹 앱 빌드
npm run build

# Capacitor 동기화
npx cap sync
```

### 개발

```bash
# 웹 개발 서버
npm run dev

# Android 에뮬레이터 (라이브 리로드)
npm run cap:run:android

# iOS 시뮬레이터 (라이브 리로드)
npm run cap:run:ios

# Android Studio 열기
npm run cap:android

# Xcode 열기
npm run cap:ios
```

### 빌드 및 동기화

```bash
# 빌드 후 동기화
npm run cap:sync

# 앱 아이콘/스플래시 생성
npm run cap:assets
```

## 주요 기능

### 네이티브 기능
- ✅ 카메라 및 갤러리 접근
- ✅ 보안 스토리지 (iOS Keychain, Android EncryptedSharedPreferences)
- ✅ 푸시 알림
- ✅ 네트워크 상태 모니터링
- ✅ 상태바 커스터마이징
- ✅ 스플래시 스크린
- ✅ Android 뒤로가기 버튼 처리

### 플랫폼별 최적화
- iOS Safe Area 자동 처리
- Android 머티리얼 디자인 호환
- 웹/네이티브 조건부 렌더링

## 프로젝트 구조

```
vote-example/
├── src/
│   ├── hooks/
│   │   └── useCamera.js          # 네이티브 카메라 훅
│   ├── utils/
│   │   ├── secureStorage.js      # 보안 스토리지
│   │   └── notifications.js      # 푸시 알림
│   └── App.jsx                   # 네이티브 기능 통합
├── ios/                          # iOS 네이티브 프로젝트
├── android/                      # Android 네이티브 프로젝트
├── assets/                       # 앱 아이콘/스플래시 소스
└── capacitor.config.ts           # Capacitor 설정
```

## 문서

- [Capacitor 설정 가이드](./CAPACITOR_SETUP.md) - 전체 설정 및 배포 가이드
- [통합 가이드](./INTEGRATION_GUIDE.md) - 기존 컴포넌트와 네이티브 기능 통합

## iOS 설정 (필수)

CocoaPods가 설치되어 있지 않다면:

```bash
sudo gem install cocoapods
cd ios/App
pod install
cd ../..
```

## Android 설정

Android Studio를 설치하고 SDK를 다운로드하세요.

## 앱 아이콘 설정

1. `assets/icon.png` (1024x1024) 준비
2. 선택사항: `assets/splash.png` (2732x2732) 준비
3. 생성: `npm run cap:assets`

## 배포

### Android
```bash
cd android
./gradlew assembleRelease
```
APK: `android/app/build/outputs/apk/release/app-release.apk`

### iOS
Xcode에서 Product → Archive → Distribute App

## 문제 해결

### iOS CocoaPods 에러
```bash
cd ios/App
rm -rf Pods Podfile.lock
pod install --repo-update
```

### Android Gradle 에러
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

## 유용한 명령어

```bash
# 플러그인 목록 확인
npx cap ls

# Capacitor 플러그인 업데이트
npm run cap:update

# 특정 플랫폼만 동기화
npx cap sync android
npx cap sync ios
```

## 기술 스택

- **프레임워크**: React 18 + Vite
- **네이티브**: Capacitor 7
- **백엔드**: Supabase
- **스타일**: Tailwind CSS
- **상태관리**: Zustand
- **라우팅**: React Router

## 라이선스

MIT
