# 통찰방 앱 빠른 실행 가이드 🚀

## ✅ 성공! 앱이 실행 중입니다

앱이 iPhone 17 시뮬레이터에서 성공적으로 실행되었습니다!

프로세스 ID: `91162`

---

## 앱 테스트 방법

### 현재 실행 중인 시뮬레이터 확인
iPhone 17 시뮬레이터 창에서 "통찰방" 앱이 실행되고 있는 것을 확인하세요!

---

## 유용한 명령어 모음

### 1. 빌드 및 실행 (전체 과정)

```bash
# 1단계: 웹 빌드
npm run build

# 2단계: Capacitor 동기화
npx cap sync

# 3단계: iOS 빌드
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  build

# 4단계: 시뮬레이터 부팅
xcrun simctl boot "iPhone 17"

# 5단계: 앱 설치
xcrun simctl install booted ~/Library/Developer/Xcode/DerivedData/App-*/Build/Products/Debug-iphonesimulator/App.app

# 6단계: 앱 실행
xcrun simctl launch booted com.tongchalban.community
```

### 2. 빠른 재실행 (코드 수정 후)

```bash
# 웹 빌드 + 동기화
npm run build && npx cap sync

# iOS 빌드 + 설치 + 실행
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 17' && \
xcrun simctl install booted ~/Library/Developer/Xcode/DerivedData/App-*/Build/Products/Debug-iphonesimulator/App.app && \
xcrun simctl launch booted com.tongchalban.community
```

### 3. 시뮬레이터 제어

```bash
# 시뮬레이터 목록
xcrun simctl list devices

# 시뮬레이터 부팅
xcrun simctl boot "iPhone 17"

# 시뮬레이터 종료
xcrun simctl shutdown "iPhone 17"

# 앱 제거
xcrun simctl uninstall booted com.tongchalban.community

# 시뮬레이터 초기화
xcrun simctl erase "iPhone 17"
```

### 4. 로그 확인

```bash
# 앱 로그 실시간 확인
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "App"' --level debug

# 또는 간단하게
xcrun simctl spawn booted log stream --process App
```

---

## Xcode GUI로 실행 (더 쉬운 방법)

터미널 명령어가 복잡하다면 Xcode를 사용하세요:

```bash
# Xcode 열기
open ios/App/App.xcworkspace

# Xcode에서:
# 1. 상단 툴바에서 "iPhone 17" (또는 다른 시뮬레이터) 선택
# 2. 재생 버튼(▶) 클릭 또는 ⌘R
```

---

## 라이브 리로드 개발 모드 (최고로 편함!)

코드 수정 시 자동으로 앱이 다시 로드됩니다:

```bash
# iOS 라이브 리로드
npm run cap:run:ios

# 또는 직접 명령어
npx cap run ios --livereload --external
```

이 방법은:
- ✅ 코드 변경 즉시 앱 새로고침
- ✅ Vite 개발 서버 자동 실행
- ✅ 웹 개발처럼 빠른 개발 가능

---

## Android 테스트

Android도 테스트하고 싶다면:

```bash
# Android Studio 열기
npx cap open android

# 또는 라이브 리로드
npm run cap:run:android
```

---

## 디버깅

### Safari Web Inspector (iOS 시뮬레이터)

1. Safari 열기 (Mac)
2. 메뉴: **개발 → Simulator → iPhone 17 → localhost**
3. Web Inspector로 디버깅 가능

### Chrome DevTools (Android)

1. Chrome 열기
2. 주소창: `chrome://inspect`
3. 앱 선택 후 Inspect

---

## 문제 해결

### 빌드 실패 시

```bash
# 캐시 삭제
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Pod 재설치
cd ios/App
rm -rf Pods Podfile.lock
pod install
cd ../..

# 다시 빌드
npm run build
npx cap sync
```

### 앱이 크래시될 때

```bash
# 로그 확인
xcrun simctl spawn booted log stream --process App

# 또는 Xcode Console 확인
```

### 시뮬레이터가 느릴 때

```bash
# 시뮬레이터 초기화
xcrun simctl shutdown all
xcrun simctl erase all
```

---

## 실기기 테스트 (iPhone 12)

### 준비
1. iPhone을 Mac에 USB로 연결
2. iPhone: 설정 → 개인정보 보호 및 보안 → 개발자 모드 ON

### 실행
```bash
# Xcode 열기
open ios/App/App.xcworkspace

# Xcode에서:
# 1. 상단 툴바에서 실제 "iPhone 12" 선택
# 2. 재생 버튼(▶) 클릭
```

### 신뢰 설정
iPhone에서: 설정 → 일반 → VPN 및 기기 관리 → 개발자 앱 신뢰

---

## 성능 최적화 팁

### 빌드 속도 향상
```bash
# Xcode 빌드 시스템 설정
# File → Project Settings → Build System: New Build System

# 병렬 빌드 활성화
defaults write com.apple.dt.Xcode BuildSystemScheduleInherentlyParallelCommandsExclusively -bool NO
```

### 시뮬레이터 성능
```bash
# 하드웨어 키보드 사용
# Simulator → I/O → Keyboard → Connect Hardware Keyboard

# 그래픽 최적화
# Simulator → Debug → Color Blended Layers (off)
```

---

## 다음 단계

1. ✅ 앱 기능 테스트
   - 로그인/회원가입
   - 투표 생성/참여
   - 모임 생성/참가
   - 질문 답변

2. ✅ 네이티브 기능 테스트
   - 카메라 (실기기에서)
   - 상태바
   - 스플래시 스크린

3. ✅ 기존 컴포넌트 통합
   - `INTEGRATION_GUIDE.md` 참고
   - 네이티브 카메라 훅 적용

4. ✅ 앱 아이콘/스플래시 생성
   ```bash
   npm run cap:assets
   ```

5. ✅ 배포 준비
   - TestFlight
   - Google Play 내부 테스트

---

## 축하합니다! 🎉

통찰방 모바일 앱이 성공적으로 실행되었습니다!

이제 웹, iOS, Android 모두에서 동작하는 크로스 플랫폼 앱입니다.

**현재 상태:**
- ✅ React 웹 앱
- ✅ iOS 네이티브 앱 (시뮬레이터 실행 중)
- ✅ Android 네이티브 앱 (빌드 가능)
- ✅ 네이티브 기능 (카메라, 푸시알림, 보안스토리지)
