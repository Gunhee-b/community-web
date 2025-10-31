# 코드 변경 후 모바일 앱 동기화 가이드

**최종 업데이트**: 2025-10-31
**목적**: 웹 코드 변경 후 iOS/Android 네이티브 앱에 반영하는 방법

---

## 🔄 기본 워크플로우

코드를 수정한 후 모바일 앱에서 확인하려면 다음 3단계를 거쳐야 합니다:

```
1. 웹 빌드 (React → 정적 파일)
2. Capacitor 동기화 (정적 파일 → 네이티브 프로젝트)
3. 네이티브 앱 실행 (Xcode 또는 Android Studio)
```

---

## 📱 전체 동기화 명령어 (권장)

### 방법 1: 한 번에 빌드 + 동기화

```bash
# iOS와 Android 모두 동기화
npm run build && npx cap sync

# 또는 package.json 스크립트 사용
npm run cap:sync
```

**설명**:
- `npm run build`: React 앱을 `dist/` 폴더에 빌드
- `npx cap sync`:
  - `dist/` 폴더를 `ios/App/App/public/`와 `android/app/src/main/assets/public/`에 복사
  - 네이티브 플러그인 업데이트
  - iOS: CocoaPods 의존성 재설치
  - Android: Gradle 설정 업데이트

**실행 시간**: 약 5-10초

---

### 방법 2: 플랫폼별 동기화

```bash
# iOS만 동기화
npm run build && npx cap sync ios

# Android만 동기화
npm run build && npx cap sync android
```

---

## 🍎 iOS (Xcode) 동기화 및 실행

### Step 1: 코드 변경 후 동기화

```bash
# 터미널에서 프로젝트 루트에서 실행
npm run build && npx cap sync ios
```

### Step 2: Xcode로 열기

```bash
# 방법 1: 터미널 명령어
open ios/App/App.xcworkspace

# 방법 2: npm 스크립트 사용
npm run cap:ios
```

**⚠️ 중요**: `App.xcodeproj`가 아닌 `App.xcworkspace`를 열어야 합니다!

### Step 3: Xcode에서 실행

#### 시뮬레이터에서 실행
1. Xcode 상단 바에서 시뮬레이터 선택 (예: iPhone 15 Pro)
2. 재생 버튼(▶) 클릭 또는 `⌘R`

#### 실기기(iPhone 12)에서 실행
1. iPhone 12를 Mac에 USB로 연결
2. iPhone: 설정 → 개인정보 보호 및 보안 → 개발자 모드 ON (재부팅)
3. Xcode 상단 바에서 "iPhone 12" 선택
4. 재생 버튼(▶) 클릭 또는 `⌘R`
5. 첫 실행 시 iPhone에서 신뢰 설정:
   - 설정 → 일반 → VPN 및 기기 관리 → 개발자 앱 신뢰

**실행 시간**:
- 시뮬레이터: 약 10-20초
- 실기기: 약 20-30초 (첫 빌드는 1-2분)

---

## 🤖 Android (Android Studio) 동기화 및 실행

### Step 1: 코드 변경 후 동기화

```bash
# 터미널에서 프로젝트 루트에서 실행
npm run build && npx cap sync android
```

### Step 2: Android Studio로 열기

```bash
# 방법 1: 터미널 명령어
npx cap open android

# 방법 2: npm 스크립트 사용
npm run cap:android
```

### Step 3: Android Studio에서 실행

#### 에뮬레이터에서 실행
1. Android Studio 상단 바에서 에뮬레이터 선택 (예: Pixel 6 API 34)
2. 재생 버튼(▶) 클릭 또는 `Shift + F10`

#### 실기기에서 실행
1. Android 기기를 Mac에 USB로 연결
2. 기기: 설정 → 개발자 옵션 → USB 디버깅 ON
3. Android Studio 상단 바에서 실기기 선택
4. 재생 버튼(▶) 클릭

**실행 시간**:
- 에뮬레이터: 약 30-60초
- 실기기: 약 10-20초

---

## 🚀 빠른 개발 워크플로우 (라이브 리로드)

개발 중에는 매번 빌드하지 않고 라이브 리로드를 사용할 수 있습니다.

### iOS 라이브 리로드

```bash
# 1. 웹 개발 서버 시작 (별도 터미널)
npm run dev

# 2. iOS 라이브 리로드 실행 (다른 터미널)
npm run cap:run:ios
```

**장점**:
- 코드 수정 시 자동으로 앱에 반영
- 빌드 시간 절약

**단점**:
- 네이티브 플러그인 변경은 반영 안 됨
- 첫 실행이 느릴 수 있음

---

### Android 라이브 리로드

```bash
# 1. 웹 개발 서버 시작 (별도 터미널)
npm run dev

# 2. Android 라이브 리로드 실행 (다른 터미널)
npm run cap:run:android
```

---

## 📝 시나리오별 명령어

### 시나리오 1: UI만 수정했을 때 (가장 흔함)

**예**: WriteAnswerPage.jsx의 CSS 클래스 변경

```bash
# 1. 빌드 + 동기화
npm run build && npx cap sync

# 2. Xcode/Android Studio에서 재실행 (▶ 버튼)
# 코드는 이미 복사되어 있으므로 IDE에서 재실행만 하면 됨
```

---

### 시나리오 2: Tailwind 설정 변경 (tailwind.config.js)

**예**: 새로운 유틸리티 클래스 추가

```bash
# 1. 빌드 + 동기화
npm run build && npx cap sync

# 2. Xcode/Android Studio에서 Clean Build 후 재실행
# Xcode: Product → Clean Build Folder (⌘ + Shift + K)
# Android Studio: Build → Clean Project
```

---

### 시나리오 3: Capacitor 플러그인 추가/업데이트

**예**: 새로운 플러그인 설치

```bash
# 1. 플러그인 설치
npm install @capacitor/haptics

# 2. 전체 동기화
npm run build && npx cap sync

# 3. iOS는 추가로 Pod 재설치 필요
cd ios/App
pod install
cd ../..

# 4. Xcode/Android Studio에서 재실행
```

---

### 시나리오 4: capacitor.config.ts 변경

**예**: 플러그인 설정 변경

```bash
# 1. 빌드 + 동기화
npm run build && npx cap sync

# 2. Xcode/Android Studio 완전히 닫기

# 3. 다시 열기
open ios/App/App.xcworkspace
# 또는
npx cap open android

# 4. Clean Build 후 재실행
```

---

## 🔍 동기화 확인 방법

### 웹 빌드가 제대로 되었는지 확인

```bash
# dist 폴더 확인
ls -lh dist/

# index.html이 최신인지 확인
cat dist/index.html | grep "index-" | head -1
```

**예상 결과**: `index-XXXXXXXX.js` 같은 해시가 매번 달라져야 함

---

### iOS 동기화 확인

```bash
# public 폴더에 파일이 복사되었는지 확인
ls -lh ios/App/App/public/

# index.html 확인
cat ios/App/App/public/index.html | grep "index-" | head -1
```

**예상 결과**: `dist/index.html`과 동일한 내용

---

### Android 동기화 확인

```bash
# public 폴더에 파일이 복사되었는지 확인
ls -lh android/app/src/main/assets/public/

# index.html 확인
cat android/app/src/main/assets/public/index.html | grep "index-" | head -1
```

---

## 🐛 문제 해결

### 문제 1: 변경사항이 앱에 반영되지 않음

**해결 방법**:

```bash
# 1. 캐시 삭제
rm -rf dist/
rm -rf node_modules/.vite/

# 2. 재빌드
npm run build

# 3. 네이티브 프로젝트 정리
# iOS
rm -rf ios/App/App/public/
# Android
rm -rf android/app/src/main/assets/public/

# 4. 전체 동기화
npx cap sync

# 5. iOS: DerivedData 삭제
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# 6. Android: Clean Build
cd android
./gradlew clean
cd ..

# 7. IDE 재시작 후 재실행
```

---

### 문제 2: Xcode 빌드 에러

**해결 방법**:

```bash
# 1. Pod 재설치
cd ios/App
rm -rf Pods Podfile.lock
pod install
cd ../..

# 2. Capacitor 동기화
npx cap sync ios

# 3. Xcode DerivedData 삭제
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# 4. Xcode 재시작
killall Xcode
open ios/App/App.xcworkspace
```

---

### 문제 3: Android 빌드 에러

**해결 방법**:

```bash
# 1. Gradle 캐시 삭제
cd android
./gradlew clean
./gradlew cleanBuildCache
cd ..

# 2. Capacitor 동기화
npx cap sync android

# 3. Android Studio 재시작
```

---

## 📊 명령어 요약표

| 상황 | 명령어 | 설명 |
|------|--------|------|
| **웹 코드 수정 후** | `npm run build && npx cap sync` | 가장 기본 |
| **iOS만 동기화** | `npm run build && npx cap sync ios` | iOS 전용 |
| **Android만 동기화** | `npm run build && npx cap sync android` | Android 전용 |
| **Xcode 열기** | `open ios/App/App.xcworkspace` | iOS IDE |
| **Android Studio 열기** | `npx cap open android` | Android IDE |
| **iOS 라이브 리로드** | `npm run cap:run:ios` | 개발 시 사용 |
| **Android 라이브 리로드** | `npm run cap:run:android` | 개발 시 사용 |
| **전체 정리** | `rm -rf dist/ && npm run build && npx cap sync` | 문제 해결 |

---

## 🎯 추천 워크플로우

### 개발 단계 (빠른 반복)

```bash
# 터미널 1
npm run dev

# 터미널 2 (iOS 테스트)
npm run cap:run:ios

# 또는 (Android 테스트)
npm run cap:run:android
```

**장점**: 코드 수정 시 즉시 반영

---

### 테스트 단계 (프로덕션 빌드)

```bash
# 1. 빌드 + 동기화
npm run build && npx cap sync

# 2. Xcode 열기
open ios/App/App.xcworkspace

# 3. Xcode에서 실기기 선택 후 실행 (⌘R)
```

**장점**: 실제 프로덕션 환경과 동일

---

### 배포 전 최종 확인

```bash
# 1. 의존성 최신화
npm update

# 2. 전체 빌드
npm run build

# 3. Capacitor 업데이트
npm run cap:update

# 4. 동기화
npx cap sync

# 5. iOS Pod 업데이트
cd ios/App && pod update && cd ../..

# 6. Xcode/Android Studio에서 Clean Build 후 실행
```

---

## 📱 실기기 테스트 빠른 시작

### iPhone 12 테스트 (오늘 해야 할 일!)

```bash
# 1. 최신 코드 동기화
npm run build && npx cap sync ios

# 2. Xcode 열기
open ios/App/App.xcworkspace

# 3. iPhone 12 USB로 Mac에 연결

# 4. Xcode 상단 바에서 "iPhone 12" 선택

# 5. 재생 버튼(▶) 클릭 또는 ⌘R

# 6. iPhone에서 신뢰 설정 (첫 실행 시)
#    설정 → 일반 → VPN 및 기기 관리 → 개발자 앱 신뢰

# 7. 앱 실행되면 테스트 시작!
```

---

## 💡 팁

### 1. 빌드 시간 단축
```bash
# Vite 캐시 활용
npm run build
# 두 번째부터는 더 빠름
```

### 2. 특정 파일만 수정했을 때
```bash
# 전체 sync 대신 copy만
npx cap copy ios
# 또는
npx cap copy android
```

### 3. 플러그인만 업데이트
```bash
# 웹 파일 복사 건너뛰고 플러그인만
npx cap update ios
# 또는
npx cap update android
```

### 4. 개발 서버 포트 변경
```javascript
// vite.config.js
export default {
  server: {
    port: 3000,
    host: '0.0.0.0' // 라이브 리로드 시 네트워크 접근 허용
  }
}
```

---

## 📚 관련 문서

- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Capacitor 설정 상태
- [MOBILE_DEPLOYMENT_CHECKLIST.md](./MOBILE_DEPLOYMENT_CHECKLIST.md) - 배포 체크리스트
- [TEST_GUIDE.md](./TEST_GUIDE.md) - 상세 테스트 방법
- [XCODE_TROUBLESHOOTING.md](./XCODE_TROUBLESHOOTING.md) - Xcode 문제 해결

---

## ✅ 다음 단계

지금 바로 실행해보세요:

```bash
# 1. 변경된 코드 동기화
npm run build && npx cap sync

# 2. Xcode 열기
open ios/App/App.xcworkspace

# 3. iPhone 12 연결 후 실행!
```

**예상 소요 시간**: 5분 이내

---

**작성자**: Claude Code
**버전**: 1.0.0
**마지막 업데이트**: 2025-10-31
