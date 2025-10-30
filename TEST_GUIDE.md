# 통찰방 앱 테스트 가이드

## ✅ 설정 완료!

모든 설정이 완료되었습니다. 이제 앱을 테스트할 수 있습니다.

---

## 방법 1: iOS 시뮬레이터로 테스트 (가장 쉬움)

### 단계별 실행

#### 1. Xcode 열기
```bash
npx cap open ios
```
또는
```bash
npm run cap:ios
```

#### 2. Xcode에서 앱 실행
1. Xcode가 열리면 상단 툴바에서 시뮬레이터 선택
   - **iPhone 15 Pro** 추천 (또는 iPhone 14, 15 등)
2. **재생 버튼(▶)** 클릭 또는 **⌘R** 단축키
3. 시뮬레이터가 부팅되고 앱이 자동으로 설치 및 실행됩니다

#### 3. 테스트할 기능
- ✅ 로그인/회원가입
- ✅ 투표 생성 및 참여
- ✅ 모임 생성 및 참가
- ✅ 질문 답변 작성
- ⚠️ 카메라 (시뮬레이터에서는 기본 이미지만 제공)
- ✅ 네비게이션 (뒤로가기 등)
- ✅ 상태바 스타일

### 시뮬레이터 단축키
- **⌘ + Shift + H**: 홈 화면
- **⌘ + K**: 키보드 토글
- **⌘ + Left/Right**: 화면 회전
- **⌘ + S**: 스크린샷

---

## 방법 2: Android 에뮬레이터로 테스트

### Android Studio 설치 확인
```bash
# Android Studio가 설치되어 있는지 확인
open -a "Android Studio"
```

설치되어 있지 않다면:
1. https://developer.android.com/studio 에서 다운로드
2. 설치 후 SDK Tools 다운로드 (설치 마법사가 안내)

### 단계별 실행

#### 1. Android Studio 열기
```bash
npx cap open android
```
또는
```bash
npm run cap:android
```

#### 2. AVD (Android Virtual Device) 생성
1. Android Studio 상단 메뉴: **Tools → Device Manager**
2. **Create Device** 클릭
3. **Phone** 카테고리에서 **Pixel 6** 선택 (권장)
4. System Image: **API 34 (Android 14.0)** 다운로드 후 선택
5. **Finish** 클릭

#### 3. 앱 실행
1. 상단 툴바에서 방금 만든 에뮬레이터 선택
2. **재생 버튼(▶)** 클릭 또는 **Shift + F10**
3. 에뮬레이터가 부팅되고 앱이 설치됩니다

#### 4. 테스트할 기능
- ✅ 로그인/회원가입
- ✅ 투표 생성 및 참여
- ✅ 모임 생성 및 참가
- ✅ 카메라/갤러리 (에뮬레이터에서 제공하는 샘플 이미지)
- ✅ Android 뒤로가기 버튼
- ✅ 알림 권한 요청

### 에뮬레이터 팁
- **Ctrl + M** (Mac: ⌘ + M): 메뉴
- 측면 버튼으로 볼륨, 전원, 뒤로가기 조작

---

## 방법 3: 라이브 리로드 개발 모드 (권장 - 개발 시)

코드를 수정하면 자동으로 앱이 다시 로드됩니다.

### iOS 라이브 리로드
```bash
npx cap run ios --livereload --external
```
또는
```bash
npm run cap:run:ios
```

### Android 라이브 리로드
```bash
npx cap run android --livereload --external
```
또는
```bash
npm run cap:run:android
```

이 방법은:
- 코드 변경 시 **자동으로 새로고침**
- Vite 개발 서버 실행
- 웹 개발처럼 빠르게 개발 가능

---

## 방법 4: iPhone 12 실기기 테스트

### 준비사항
1. **iPhone 12를 Mac에 USB-C/Lightning 케이블로 연결**
2. **iPhone 개발자 모드 활성화**:
   - 설정 → 개인정보 보호 및 보안 → 개발자 모드 → ON
   - 재부팅 필요

### 실행
1. Xcode 열기: `npx cap open ios`
2. 상단 툴바에서 **실제 iPhone 12** 선택
3. 재생 버튼(▶) 클릭
4. **처음 실행 시 오류 발생 가능**:
   - Xcode → 상단 메뉴 → Product → Destination → **Add Additional Destinations**
   - iPhone 선택 후 **Trust** 클릭

### 신뢰 설정 (앱 실행 후)
iPhone에서:
1. 설정 → 일반 → VPN 및 기기 관리
2. 개발자 앱 → **신뢰** 버튼 클릭

이제 앱이 정상 실행됩니다!

### 실기기에서만 테스트 가능한 기능
- ✅ 실제 카메라 촬영
- ✅ 실제 갤러리 선택
- ✅ 진동 (Haptics)
- ✅ 실제 푸시 알림
- ✅ GPS 위치 (모임 장소 설정)

---

## 디버깅 및 로그 확인

### iOS 로그 보기
Xcode에서 앱 실행 후:
1. 하단 **콘솔 창** 확인
2. 또는 **⌘ + Shift + Y**로 토글

### Android 로그 보기
Android Studio에서 앱 실행 후:
1. 하단 **Logcat** 탭 클릭
2. 필터: `com.tongchalban.community` 입력

### 웹 디버깅 (Safari/Chrome DevTools)

#### iOS 시뮬레이터
1. Safari 열기 (Mac)
2. 상단 메뉴: **개발 → Simulator → localhost**
3. Web Inspector 사용 가능

#### Android 에뮬레이터
1. Chrome 열기 (Mac)
2. 주소창: `chrome://inspect`
3. 앱 선택 → **Inspect** 클릭
4. DevTools 사용 가능

---

## 테스트 체크리스트

### 기본 기능
- [ ] 로그인/로그아웃
- [ ] 회원가입
- [ ] 투표 생성
- [ ] 투표 참여
- [ ] 모임 생성
- [ ] 모임 참가
- [ ] 질문 답변 작성

### 네이티브 기능
- [ ] 카메라로 사진 촬영 (실기기)
- [ ] 갤러리에서 사진 선택
- [ ] 이미지 업로드 (5MB 제한 확인)
- [ ] 상태바 스타일 (흰색 배경)
- [ ] Android 뒤로가기 버튼
- [ ] 스플래시 스크린 (앱 시작 시)

### UI/UX
- [ ] Safe Area (iOS 노치/Dynamic Island)
- [ ] 키보드 올라올 때 레이아웃
- [ ] 가로 모드 (지원 안 함 - 세로 고정)
- [ ] 로딩 상태
- [ ] 에러 처리

### 네트워크
- [ ] 오프라인 상태 감지
- [ ] 네트워크 재연결

---

## 문제 해결

### iOS 빌드 에러
```bash
cd ios/App
rm -rf Pods Podfile.lock
pod install --repo-update
cd ../..
npx cap sync ios
```

### Android Gradle 에러
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

### 흰 화면만 나올 때
1. Supabase 환경 변수 확인 (`.env` 또는 Vite 설정)
2. 웹 다시 빌드: `npm run build`
3. 동기화: `npx cap sync`

### 카메라가 작동하지 않을 때
1. 권한 확인:
   - iOS: 설정 → 통찰방 → 카메라 권한
   - Android: 앱 정보 → 권한 → 카메라
2. Info.plist (iOS) 또는 AndroidManifest.xml 확인

---

## 빠른 명령어 모음

```bash
# iOS 시뮬레이터 실행
npx cap open ios

# Android 에뮬레이터 실행
npx cap open android

# 코드 수정 후 재빌드 및 동기화
npm run build && npx cap sync

# iOS 라이브 리로드 개발
npm run cap:run:ios

# Android 라이브 리로드 개발
npm run cap:run:android

# 플러그인 상태 확인
npx cap ls
```

---

## 다음 단계

테스트가 완료되면:

1. ✅ 앱 아이콘/스플래시 생성
   ```bash
   # 1024x1024 PNG를 assets/icon.png로 저장 후
   npm run cap:assets
   ```

2. ✅ 푸시 알림 설정 (Supabase 테이블 생성)
   - `CAPACITOR_SETUP.md` 참고

3. ✅ 기존 컴포넌트에 네이티브 카메라 통합
   - `INTEGRATION_GUIDE.md` 참고

4. ✅ 배포 준비
   - TestFlight (iOS)
   - Google Play 내부 테스트 (Android)

---

## 성공! 🎉

모든 설정이 완료되었습니다. 이제 앱을 실행하고 테스트해보세요!

**추천 순서:**
1. iOS 시뮬레이터로 기본 테스트 (가장 빠름)
2. Android 에뮬레이터로 테스트
3. iPhone 12 실기기로 카메라/실제 기능 테스트
