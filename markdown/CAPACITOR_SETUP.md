# 통찰방 Capacitor 모바일 앱 설정 가이드

## 완료된 작업

### 1. Capacitor 설치 및 초기화
- ✅ @capacitor/core, @capacitor/cli 설치
- ✅ iOS 및 Android 플랫폼 추가
- ✅ 필수 플러그인 설치:
  - Camera (카메라/갤러리)
  - Preferences (보안 스토리지)
  - Push Notifications (푸시 알림)
  - App (앱 상태 관리)
  - Status Bar (상태바)
  - Splash Screen (스플래시 화면)
  - Network (네트워크 상태)

### 2. 네이티브 기능 구현
- ✅ `src/utils/secureStorage.js` - 플랫폼별 보안 스토리지
- ✅ `src/hooks/useCamera.js` - 네이티브 카메라/갤러리 훅
- ✅ `src/utils/notifications.js` - 푸시 알림 유틸리티
- ✅ `src/App.jsx` - 네이티브 기능 통합 (상태바, 뒤로가기, 푸시알림)

### 3. 플랫폼별 권한 설정
- ✅ iOS Info.plist - 카메라, 갤러리, 위치 권한 설명 추가
- ✅ Android AndroidManifest.xml - 필요한 권한 추가

### 4. 빌드 및 동기화
- ✅ Android 플랫폼 동기화 완료
- ⚠️ iOS는 CocoaPods 설치 필요

---

## 남은 작업

### 1. iOS 개발 환경 설정

#### CocoaPods 설치
```bash
# Homebrew가 없다면 먼저 설치
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# CocoaPods 설치
sudo gem install cocoapods

# 또는 Homebrew로 설치
brew install cocoapods
```

#### Xcode 설정
```bash
# Xcode 경로 설정 (Xcode.app이 Applications에 있어야 함)
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# 확인
xcodebuild -version
```

#### iOS 프로젝트 설정
```bash
# CocoaPods 의존성 설치
cd ios/App
pod install
cd ../..

# Capacitor 동기화
npx cap sync ios
```

### 2. 앱 아이콘 및 스플래시 스크린 생성

#### 아이콘 준비
1. 1024x1024 PNG 이미지를 준비합니다
2. `assets/icon.png`로 저장합니다
3. 스플래시용 이미지도 준비하려면 `assets/splash.png` (2732x2732 권장)

#### 자동 생성
```bash
# 아이콘 및 스플래시 자동 생성
npx capacitor-assets generate
```

이 명령어는 다음을 자동 생성합니다:
- iOS: 모든 크기의 앱 아이콘
- Android: 모든 밀도의 앱 아이콘 및 스플래시
- PWA: 웹 아이콘

### 3. Supabase 데이터베이스 설정 (푸시 알림용)

푸시 알림을 사용하려면 다음 테이블을 생성하세요:

```sql
-- 디바이스 토큰 저장 테이블
CREATE TABLE device_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- 인덱스 생성
CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_platform ON device_tokens(platform);

-- RLS 정책
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own device tokens"
  ON device_tokens
  FOR ALL
  USING (auth.uid() = user_id);
```

---

## 개발 및 테스트

### Android 에뮬레이터 실행
```bash
# Android Studio 실행
npx cap open android

# 또는 라이브 리로드로 실행
npx cap run android --livereload --external
```

### iOS 시뮬레이터 실행 (CocoaPods 설치 후)
```bash
# Xcode 실행
npx cap open ios

# 또는 라이브 리로드로 실행
npx cap run ios --livereload --external
```

### 웹 빌드 후 네이티브 앱 업데이트
```bash
# 1. 웹 빌드
npm run build

# 2. Capacitor 동기화
npx cap sync

# 3. 필요시 특정 플랫폼만
npx cap sync android
npx cap sync ios
```

---

## 네이티브 기능 사용 예제

### 1. 카메라 사용
```jsx
import { useCamera } from '../hooks/useCamera'

function MyComponent() {
  const { takePicture, isNative, loading, error } = useCamera()

  const handleTakePhoto = async () => {
    if (isNative) {
      // 네이티브 앱: Capacitor Camera 사용
      const dataUrl = await takePicture({
        quality: 90,
        width: 1024
      })

      if (dataUrl) {
        // dataUrl을 서버에 업로드하거나 사용
        console.log('Photo captured:', dataUrl)
      }
    } else {
      // 웹: 기존 input file 사용
      // 기존 로직 유지
    }
  }

  return (
    <button onClick={handleTakePhoto} disabled={loading}>
      {loading ? '촬영 중...' : '사진 촬영'}
    </button>
  )
}
```

### 2. 보안 스토리지 사용
```jsx
import { secureStorage } from '../utils/secureStorage'

// 저장
await secureStorage.setItem('auth_token', token)

// 가져오기
const token = await secureStorage.getItem('auth_token')

// 삭제
await secureStorage.removeItem('auth_token')
```

### 3. 푸시 알림 사용
```jsx
import { initPushNotifications, checkPushPermissions } from '../utils/notifications'

// 로그인 후 푸시 알림 초기화
const user = useAuthStore((state) => state.user)

useEffect(() => {
  if (user?.id) {
    initPushNotifications(user.id)
  }
}, [user?.id])
```

---

## 실기기 테스트

### iPhone 실기기 테스트
1. iPhone을 Mac에 USB로 연결
2. iPhone에서: 설정 → 개인정보 보호 및 보안 → 개발자 모드 ON
3. Xcode에서 실기기 선택 후 Run (⌘R)
4. 신뢰 설정: 설정 → 일반 → VPN 및 기기 관리 → 개발자 앱 신뢰

### Android 실기기 테스트
1. Android 기기에서 개발자 옵션 활성화
2. USB 디버깅 활성화
3. USB로 연결
4. Android Studio에서 기기 선택 후 Run

---

## 배포 준비

### Android 릴리즈 빌드
```bash
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

### iOS 릴리즈 빌드
1. Xcode에서 Product → Archive
2. Distribute App → TestFlight 또는 App Store

---

## 문제 해결

### iOS CocoaPods 문제
```bash
# Pod 캐시 삭제 및 재설치
cd ios/App
rm -rf Pods Podfile.lock
pod install --repo-update
cd ../..
```

### Android Gradle 문제
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

### 플러그인 업데이트
```bash
npm update @capacitor/core @capacitor/cli
npm update @capacitor/ios @capacitor/android
npm update @capacitor/camera @capacitor/preferences # 등
npx cap sync
```

---

## 주요 파일 위치

- **Capacitor 설정**: `capacitor.config.ts`
- **iOS 프로젝트**: `ios/App/`
- **Android 프로젝트**: `android/`
- **iOS 권한**: `ios/App/App/Info.plist`
- **Android 권한**: `android/app/src/main/AndroidManifest.xml`

---

## 유용한 명령어

```bash
# Capacitor 버전 확인
npx cap --version

# 플러그인 목록 확인
npx cap ls

# 특정 플랫폼 플러그인 확인
npx cap ls ios
npx cap ls android

# 로그 확인
npx cap run android --no-sync  # Android 로그
npx cap run ios --no-sync      # iOS 로그

# 빌드 없이 동기화
npx cap copy
```

---

## 다음 단계

1. ✅ CocoaPods 설치 및 iOS 설정
2. ✅ 앱 아이콘/스플래시 생성
3. ✅ Android 에뮬레이터로 테스트
4. ✅ iPhone 실기기로 테스트
5. ✅ 푸시 알림 테스트 (Supabase 테이블 생성 필요)
6. ✅ 실시간 채팅 구현 (추후)
7. ✅ 배포 (TestFlight/Google Play 내부 테스트)
