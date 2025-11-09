# 📱 모바일 앱 소셜 로그인 설정 가이드

**목적**: iOS/Android 앱에서 Google, Kakao 소셜 로그인 정상 작동
**상태**: ✅ 코드 수정 완료, OAuth 제공자 설정 필요
**소요 시간**: 15-20분

---

## 🎯 현재 상황

### ✅ 완료된 작업

**코드 수정 완료** (2025-11-07):
1. `src/components/common/AppUrlListener.jsx` 생성
   - Deep link를 React Router와 통합
   - `navigate()` 사용하여 올바른 라우팅 처리

2. `src/App.jsx` 수정
   - 기존의 잘못된 deep link 핸들러 제거
   - AppUrlListener 컴포넌트 통합

### ⏳ 남은 작업

1. OAuth 제공자에 모바일 Redirect URI 추가
2. 앱 빌드 및 동기화
3. 실제 기기/시뮬레이터에서 테스트

---

## 📋 Step 1: Google Cloud Console 설정

### 1-1. Google Cloud Console 접속

1. https://console.cloud.google.com/ 접속
2. 프로젝트 선택 (Tongchalbang)
3. **API 및 서비스** → **사용자 인증 정보**

### 1-2. OAuth 2.0 클라이언트 ID 수정

**Web Application 클라이언트 찾기**:
- 이름: "Web client (auto created by Google Service)"
- 또는 직접 생성한 Web Application 클라이언트

**승인된 리디렉션 URI에 추가**:

```
기존 URI (유지):
https://www.tongchalbang.com/auth/callback
https://wghrshqnexgaojxrtiit.supabase.co/auth/v1/callback

새로 추가:
ingk://auth/callback
```

**주의사항**:
- ⚠️ Custom URL scheme은 Web Application 클라이언트에 추가
- `ingk://` 프로토콜 정확히 입력 (오타 주의)
- 저장 버튼 클릭

### 1-3. Android용 OAuth 클라이언트 (선택사항)

Android 앱용 별도 클라이언트가 있다면:

1. **사용자 인증 정보** → **OAuth 2.0 클라이언트 ID** → Android 클라이언트
2. 패키지 이름 확인: `com.tongchalban.community`
3. SHA-1 인증서 지문 추가 (개발용 + 배포용)

**개발용 SHA-1 확인 방법**:
```bash
# macOS/Linux
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# 출력 예시:
# SHA1: AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD
```

---

## 📋 Step 2: Kakao Developers 설정

### 2-1. Kakao Developers 접속

1. https://developers.kakao.com/ 접속
2. 로그인
3. **내 애플리케이션** 선택 (Tongchalbang)

### 2-2. 플랫폼 설정

**왼쪽 메뉴 → 앱 설정 → 플랫폼**

**iOS 플랫폼 추가** (없다면):
1. **플랫폼 추가하기** → iOS 선택
2. Bundle ID: `com.tongchalban.community`
3. 저장

**Android 플랫폼 추가** (없다면):
1. **플랫폼 추가하기** → Android 선택
2. 패키지명: `com.tongchalban.community`
3. 마켓 URL: (선택사항)
4. 키 해시 추가:

```bash
# 개발용 키 해시 생성 (macOS)
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore -storepass android -keypass android | openssl sha1 -binary | openssl base64

# 출력 예시: abc123def456ghi789==
```

### 2-3. Redirect URI 설정

**왼쪽 메뉴 → 제품 설정 → 카카오 로그인**

**Redirect URI 추가**:

```
기존 URI (유지):
http://localhost:3000/auth/callback
https://www.tongchalbang.com/auth/callback
https://wghrshqnexgaojxrtiit.supabase.co/auth/v1/callback

새로 추가:
ingk://auth/callback
```

**활성화 설정**:
- ✅ 카카오 로그인 활성화
- ✅ OpenID Connect 활성화 (선택사항)

**동의 항목 설정 확인**:
- 프로필 정보 (닉네임/프로필 사진): 필수 동의
- 카카오계정 (이메일): 필수 동의

---

## 📋 Step 3: 앱 빌드 및 동기화

### 3-1. 웹 빌드

```bash
# 프로젝트 루트에서
npm run build
```

### 3-2. iOS 동기화

```bash
npx cap sync ios
```

**sync 완료 후**:
```bash
# Xcode에서 열기
npx cap open ios
```

**Xcode에서 확인**:
1. **Info.plist** 확인:
   - URL Schemes에 `ingk` 포함 확인

2. **Signing & Capabilities** 설정:
   - Team 선택
   - Bundle Identifier: `com.tongchalban.community`

### 3-3. Android 동기화

```bash
npx cap sync android
```

**sync 완료 후**:
```bash
# Android Studio에서 열기
npx cap open android
```

**Android Studio에서 확인**:
1. **AndroidManifest.xml** 확인:
   - `<intent-filter>` 내 `ingk` scheme 확인

2. **Build Variants**:
   - Debug 또는 Release 선택

---

## 📋 Step 4: 테스트

### 4-1. iOS 시뮬레이터 테스트

**시뮬레이터 실행**:
```bash
# Xcode에서 Run 버튼 클릭
# 또는 CLI:
npx cap run ios
```

**테스트 순서**:
1. 앱 실행
2. 로그인 페이지로 이동
3. "Google로 계속하기" 클릭
4. Safari가 열리며 Google 로그인 페이지 표시
5. 로그인 완료
6. **앱으로 자동 복귀 확인** ✅
7. 사용자 정보가 앱에 표시되는지 확인

**Kakao 로그인 테스트**:
1. "카카오로 계속하기" 클릭
2. Safari에서 Kakao 로그인
3. **앱으로 자동 복귀 확인** ✅

### 4-2. Android 에뮬레이터 테스트

**에뮬레이터 실행**:
```bash
# Android Studio에서 Run 버튼 클릭
# 또는 CLI:
npx cap run android
```

**테스트 순서**:
1. 앱 실행
2. 로그인 페이지로 이동
3. "Google로 계속하기" 클릭
4. Chrome 커스텀 탭이 열림
5. 로그인 완료
6. **앱으로 자동 복귀 확인** ✅
7. 사용자 정보 표시 확인

### 4-3. 실제 기기 테스트

**iOS 실제 기기**:
1. Lightning 케이블 연결
2. Xcode에서 기기 선택
3. Run 클릭
4. 위의 시뮬레이터 테스트와 동일하게 진행

**Android 실제 기기**:
1. USB 디버깅 활성화:
   - 설정 → 휴대전화 정보 → 빌드 번호 7회 탭
   - 개발자 옵션 → USB 디버깅 활성화
2. USB 케이블 연결
3. Android Studio에서 기기 선택
4. Run 클릭

---

## 🔍 디버깅

### Deep Link 작동 확인

**iOS (Xcode Console)**:
```
[AppUrlListener] Setting up deep link listener
[AppUrlListener] Deep link received: ingk://auth/callback?code=...
[AppUrlListener] Parsed URL: {
  protocol: "ingk:",
  host: "auth",
  pathname: "/callback",
  search: "?code=..."
}
[AppUrlListener] Navigating to: /auth/callback?code=...
```

**Android (Logcat)**:
```
[AppUrlListener] Deep link received: ingk://auth/callback?code=...
[AppUrlListener] Navigating to: /auth/callback?code=...
```

### 로그가 보이지 않는다면

**1. Deep Link 수동 테스트**:

iOS Simulator:
```bash
# 터미널에서 실행
xcrun simctl openurl booted "ingk://auth/callback?code=test123"
```

Android Emulator:
```bash
# ADB 명령어
adb shell am start -W -a android.intent.action.VIEW -d "ingk://auth/callback?code=test123" com.tongchalban.community
```

**2. 설정 확인**:
- `capacitor.config.ts`에서 `server.url` 주석 처리 확인
- Info.plist / AndroidManifest.xml에서 URL scheme 확인

**3. 캐시 클리어**:

iOS:
```bash
# 앱 삭제 후 재설치
npx cap sync ios
npx cap open ios
# Xcode에서 Clean Build Folder (Cmd+Shift+K)
```

Android:
```bash
# 앱 삭제 후 재설치
npx cap sync android
npx cap open android
# Android Studio에서 Build → Clean Project
```

---

## ⚠️ 문제 해결

### 문제 1: 로그인 후 앱으로 돌아오지 않음

**증상**:
- Safari/Chrome에서 로그인 완료
- 앱으로 복귀하지 않고 브라우저에 머무름

**해결**:
1. OAuth 제공자 설정 확인:
   - Google Cloud Console에 `ingk://auth/callback` 추가 확인
   - Kakao Developers에 `ingk://auth/callback` 추가 확인

2. URL Scheme 확인:
   - iOS: Info.plist 확인
   - Android: AndroidManifest.xml 확인

3. 앱 재빌드:
   ```bash
   npm run build
   npx cap sync ios
   npx cap sync android
   ```

### 문제 2: "Invalid redirect URI" 에러

**증상**:
```
Error: redirect_uri_mismatch
The redirect URI in the request does not match
```

**해결**:
1. OAuth 제공자 콘솔에서 정확히 `ingk://auth/callback` 입력 확인
2. 대소문자, 오타 확인
3. 프로토콜 `ingk://` 확인 (https가 아님)

### 문제 3: iOS에서 "No app found to handle this URL"

**증상**:
- Safari에서 "Cannot open page" 에러

**해결**:
1. Info.plist 확인:
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>ingk</string>
       </array>
     </dict>
   </array>
   ```

2. Xcode에서 Clean Build:
   ```
   Product → Clean Build Folder (Cmd+Shift+K)
   ```

3. 앱 재설치

### 문제 4: Android에서 Chrome에 머무름

**증상**:
- 로그인 완료 후 Chrome 탭이 닫히지 않음

**해결**:
1. AndroidManifest.xml 확인:
   ```xml
   <intent-filter>
     <action android:name="android.intent.action.VIEW" />
     <category android:name="android.intent.category.DEFAULT" />
     <category android:name="android.intent.category.BROWSABLE" />
     <data android:scheme="ingk" android:host="auth" />
   </intent-filter>
   ```

2. 앱 재빌드 및 재설치

### 문제 5: Kakao 로그인만 안 됨

**증상**:
- Google 로그인은 작동
- Kakao 로그인만 실패

**해결**:
1. Kakao Developers 확인:
   - 플랫폼 추가 (iOS/Android)
   - Redirect URI에 `ingk://auth/callback` 추가
   - 카카오 로그인 활성화 확인

2. 환경 변수 확인:
   ```bash
   # Capacitor에서는 런타임에 env 사용 가능
   # capacitor.config.ts에서 확인
   ```

---

## ✅ 완료 체크리스트

### OAuth 제공자 설정
- [ ] Google Cloud Console에 `ingk://auth/callback` 추가
- [ ] Kakao Developers에 `ingk://auth/callback` 추가
- [ ] Kakao 플랫폼 설정 (iOS/Android)

### 앱 빌드
- [ ] `npm run build` 실행
- [ ] `npx cap sync ios` 실행
- [ ] `npx cap sync android` 실행

### iOS 테스트
- [ ] Xcode에서 앱 실행
- [ ] Google 로그인 성공 및 앱 복귀 확인
- [ ] Kakao 로그인 성공 및 앱 복귀 확인
- [ ] 사용자 정보 정상 표시 확인

### Android 테스트
- [ ] Android Studio에서 앱 실행
- [ ] Google 로그인 성공 및 앱 복귀 확인
- [ ] Kakao 로그인 성공 및 앱 복귀 확인
- [ ] 사용자 정보 정상 표시 확인

### 디버깅
- [ ] Console 로그에서 deep link 수신 확인
- [ ] `/auth/callback` 페이지로 정상 라우팅 확인
- [ ] 에러 메시지 없음 확인

---

## 📚 관련 문서

- **프로덕션 배포**: `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **빠른 체크리스트**: `DEPLOYMENT_QUICK_CHECKLIST.md`
- **Capacitor 설정**: `capacitor.config.ts`
- **코드 구현**:
  - `src/components/common/AppUrlListener.jsx`
  - `src/App.jsx` (lines 12, 148)

---

## 🎉 성공 기준

모든 테스트를 통과하면:

✅ iOS/Android 앱에서 Google 로그인 정상 작동
✅ iOS/Android 앱에서 Kakao 로그인 정상 작동
✅ 로그인 후 자동으로 앱으로 복귀
✅ 사용자 세션 정상 생성
✅ 웹과 앱 모두에서 동일한 사용자 계정 사용 가능

---

**작성자**: Claude Code
**최종 업데이트**: 2025-11-07
**버전**: 1.0.0
