# 모바일 앱 배포 및 소셜 로그인 주의사항

**작성일**: 2025년 11월 5일
**작성자**: Claude Code
**목적**: 모바일 앱 배포 전 필수 체크리스트 및 주의사항 정리

---

## 📋 목차

1. [배포 전 필수 확인사항](#배포-전-필수-확인사항)
2. [소셜 로그인 설정 확인](#소셜-로그인-설정-확인)
3. [보안 관련 주의사항](#보안-관련-주의사항)
4. [모바일 앱 테스트 체크리스트](#모바일-앱-테스트-체크리스트)
5. [알려진 제한사항 및 개선 필요 사항](#알려진-제한사항-및-개선-필요-사항)
6. [문제 발생 시 대응 방법](#문제-발생-시-대응-방법)

---

## 배포 전 필수 확인사항

### ✅ 완료된 작업 (2025년 11월 5일)

1. **Android Deep Linking 설정**
   - 파일: `android/app/src/main/AndroidManifest.xml`
   - Intent Filter 추가: `ingk://auth/callback` 스킴 지원
   - 상태: ✅ 완료

2. **iOS URL Schemes 설정**
   - 파일: `ios/App/App/Info.plist`
   - CFBundleURLTypes 추가: `ingk://` 스킴 지원
   - 상태: ✅ 완료

3. **Deep Link Listener 구현**
   - 파일: `src/App.jsx`
   - OAuth 콜백 자동 처리 로직 추가
   - 상태: ✅ 완료

4. **프로덕션 빌드 및 배포**
   - `npm run build`: 성공
   - `npx cap sync`: iOS/Android 동기화 완료
   - Git 커밋: `0577ff0`
   - Vercel 배포: 자동 진행 중

---

## 소셜 로그인 설정 확인

### Google OAuth 설정

#### ✅ 이미 완료된 설정
- Supabase Provider 활성화
- Google Cloud Console에서 OAuth 2.0 Client ID 발급
- 환경 변수 설정 완료
- 프로덕션 도메인 콜백 URL 등록 완료

#### ⚠️ 배포 후 확인 필요
1. **Authorized redirect URIs 확인**
   ```
   https://wghrshqnexgaojxrtiit.supabase.co/auth/v1/callback
   [YOUR-PRODUCTION-DOMAIN]/auth/callback  ✅ 등록 완료
   ingk://auth/callback (모바일)
   ```

2. **OAuth consent screen 설정**
   - 앱 이름: "통찰방" 확인
   - 지원 이메일 등록 확인
   - 로고 업로드 (선택)

3. **Production 상태 전환**
   - 현재 Testing 모드인 경우 Publishing status를 "In production"으로 변경
   - Testing 모드에서는 등록된 테스트 사용자만 로그인 가능

### Kakao OAuth 설정

#### ✅ 이미 완료된 설정
- REST API 키 발급: `57450a0289e45de479273c9fc168f4fb`
- Client Secret 발급: `8RH5CP2H6mm78j9D3BxMbjMeWE8eV0b9`
- 환경 변수 설정 완료 (.env)
- 프로덕션 도메인 콜백 URL 등록 완료

#### ⚠️ 배포 후 확인 필요
1. **Redirect URI 확인** (Kakao Developers)
   ```
   [YOUR-PRODUCTION-DOMAIN]/auth/callback  ✅ 등록 완료
   ingk://auth/callback (모바일)
   ```

2. **플랫폼 설정**
   - Web 플랫폼: 사이트 도메인 등록 확인
   - Android 플랫폼: 패키지명 `com.tongchalban.community` 등록
   - iOS 플랫폼: 번들 ID `com.tongchalban.community` 등록

3. **동의항목 설정**
   - 이메일: 필수 동의 확인
   - 프로필 정보(닉네임): 필수 동의 확인

4. **비즈 앱 전환** (프로덕션 권장)
   - 일반 앱: 월 10만 명까지
   - 비즈 앱: 제한 없음

### 환경 변수 최종 확인

#### .env 파일
```env
VITE_SUPABASE_URL=https://wghrshqnexgaojxrtiit.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_KAKAO_CLIENT_ID=57450a0289e45de479273c9fc168f4fb
VITE_KAKAO_CLIENT_SECRET=8RH5CP2H6mm78j9D3BxMbjMeWE8eV0b9
```

#### Vercel 환경 변수
- ✅ Vercel Dashboard → Settings → Environment Variables에 모두 등록 확인
- ⚠️ Production, Preview, Development 모두에 적용되었는지 확인

---

## 보안 관련 주의사항

### 🚨 높은 우선순위 보안 이슈

#### 1. Kakao Client Secret 노출 문제

**현재 상황**:
- `src/utils/socialAuth.js` (134줄)에서 프론트엔드에서 Client Secret 사용
- 환경 변수 `VITE_KAKAO_CLIENT_SECRET`가 빌드 시 번들에 포함됨
- 브라우저 개발자 도구에서 노출될 수 있음

**위험도**: ⚠️ 중간 (Kakao는 Redirect URI 검증으로 일부 보호됨)

**권장 해결 방법**:
```javascript
// 현재 (프론트엔드에서 직접 처리)
const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
  method: 'POST',
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: KAKAO_CLIENT_ID,
    client_secret: KAKAO_CLIENT_SECRET,  // ❌ 프론트엔드 노출
    redirect_uri: getRedirectUrl(),
    code: code
  })
})

// 권장 (백엔드 API 사용)
const tokenResponse = await fetch('/api/auth/kakao/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code, redirectUri: getRedirectUrl() })
})
```

**대응 방안**:
1. **단기 (현재)**: Kakao Developers에서 Redirect URI를 엄격하게 관리
2. **중기**: Supabase Edge Functions로 토큰 교환 로직 이전
3. **장기**: 전용 백엔드 API 서버 구축

#### 2. 환경 변수 관리

**주의사항**:
- `.env` 파일을 절대 Git에 커밋하지 않기 (현재 `.gitignore`에 포함됨 ✅)
- `VITE_` 접두사가 붙은 변수는 클라이언트에 노출됨을 인지
- 민감한 서버 전용 키는 `VITE_` 접두사 사용 금지

**현재 노출되는 변수**:
- ✅ `VITE_SUPABASE_URL`: 공개 OK
- ✅ `VITE_SUPABASE_ANON_KEY`: 공개 OK (RLS로 보호됨)
- ✅ `VITE_KAKAO_CLIENT_ID`: 공개 OK
- ⚠️ `VITE_KAKAO_CLIENT_SECRET`: 노출 주의 (위 참조)

---

## 모바일 앱 테스트 체크리스트

### iOS 앱 테스트

#### 빌드 전 준비
```bash
# 1. Xcode 열기
npx cap open ios

# 2. CocoaPods 의존성 확인
cd ios/App
pod install
cd ../..
```

#### 필수 테스트 항목
- [ ] **앱 실행**: 시뮬레이터/실기기에서 정상 실행
- [ ] **스플래시 스크린**: 2초간 표시 후 자동 숨김
- [ ] **상태바**: 라이트 모드 설정 확인
- [ ] **딥링크 테스트**:
  ```bash
  # 시뮬레이터에서 딥링크 테스트
  xcrun simctl openurl booted "ingk://auth/callback?code=test&state=test"
  ```
- [ ] **Google 로그인**: Safari로 이동 → 인증 → 앱 복귀
- [ ] **Kakao 로그인**: Capacitor Browser로 이동 → 인증 → 앱 복귀
- [ ] **카메라 권한**: 권한 요청 팝업 표시
- [ ] **갤러리 접근**: 사진 선택 가능
- [ ] **위치 권한**: 모임 생성 시 권한 요청 (선택)
- [ ] **백그라운드 복귀**: 앱 상태 유지 확인
- [ ] **앱 종료 후 재실행**: 로그인 상태 유지

#### Info.plist 권한 메시지 확인
```xml
NSCameraUsageDescription: "통찰방에서 사진을 촬영하여 게시글에 첨부하기 위해 카메라 접근이 필요합니다."
NSPhotoLibraryUsageDescription: "통찰방에서 사진을 선택하여 게시글에 첨부하기 위해 갤러리 접근이 필요합니다."
```

### Android 앱 테스트

#### 빌드 전 준비
```bash
# 1. Android Studio 열기
npx cap open android

# 2. Gradle 동기화 확인 (Android Studio에서 자동)
```

#### 필수 테스트 항목
- [ ] **앱 실행**: 에뮬레이터/실기기에서 정상 실행
- [ ] **스플래시 스크린**: 2초간 표시 후 자동 숨김
- [ ] **상태바**: 흰색 배경 설정 확인
- [ ] **딥링크 테스트**:
  ```bash
  # 에뮬레이터/실기기에서 딥링크 테스트
  adb shell am start -W -a android.intent.action.VIEW \
    -d "ingk://auth/callback?code=test&state=test" \
    com.tongchalban.community
  ```
- [ ] **Google 로그인**: Chrome Custom Tab으로 이동 → 인증 → 앱 복귀
- [ ] **Kakao 로그인**: 브라우저로 이동 → 인증 → 앱 복귀
- [ ] **카메라 권한**: 권한 요청 팝업 표시
- [ ] **갤러리 접근**: 사진 선택 가능
- [ ] **위치 권한**: 모임 생성 시 권한 요청 (선택)
- [ ] **백 버튼**: 홈에서 백 버튼 시 앱 종료
- [ ] **백그라운드 복귀**: 앱 상태 유지 확인
- [ ] **앱 종료 후 재실행**: 로그인 상태 유지

#### AndroidManifest.xml Intent Filter 확인
```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="ingk" android:host="auth" />
</intent-filter>
```

### 공통 기능 테스트

#### 소셜 로그인 플로우
1. **Google 로그인**:
   - 로그인 버튼 클릭
   - Google 계정 선택 화면 표시
   - 권한 동의 화면 표시
   - 앱으로 자동 복귀
   - 홈 화면에서 로그인 상태 확인
   - 프로필에 이메일/닉네임 표시

2. **Kakao 로그인**:
   - 로그인 버튼 클릭
   - Kakao 로그인 페이지 표시
   - 계정 입력 또는 간편 로그인
   - 동의 화면 표시
   - 앱으로 자동 복귀
   - 홈 화면에서 로그인 상태 확인
   - 프로필에 카카오 닉네임 표시

#### 핵심 기능 테스트
- [ ] 철학챗 목록 조회 (비로그인 가능)
- [ ] 철학챗 상세 조회 (비로그인 가능)
- [ ] 철학챗 참가 신청 (로그인 필요)
- [ ] 카카오톡 오픈채팅 링크 이동
- [ ] 투표 기능 (로그인 필요)
- [ ] 오늘의 질문 (로그인 필요)
- [ ] 이미지 업로드 (카메라/갤러리)
- [ ] 알림 기능 (웹 알림)
- [ ] 로그아웃 후 재로그인

---

## 알려진 제한사항 및 개선 필요 사항

### 🔴 높은 우선순위

#### 1. Kakao Client Secret 보안 개선
- **현재**: 프론트엔드에서 직접 사용
- **목표**: 백엔드 API로 이전
- **예상 작업 시간**: 2-3시간
- **영향**: 보안 강화

#### 2. Push Notifications 완전 구현
- **현재**: 코드는 구현되었으나 Firebase 설정 미완료
- **필요 작업**:
  - Android: `google-services.json` 파일 추가
  - iOS: APNs 인증서 설정
  - Firebase Cloud Messaging 프로젝트 생성
- **예상 작업 시간**: 1-2시간
- **영향**: 실시간 알림 기능 활성화

### 🟡 중간 우선순위

#### 3. OAuth 에러 처리 개선
- **현재**: 에러 발생 시 단순 alert 표시
- **개선 방향**:
  - 사용자 친화적인 에러 메시지
  - 재시도 로직 추가
  - 로그인 페이지로 자동 리다이렉트
- **예상 작업 시간**: 1시간

#### 4. 딥링크 라우팅 확장
- **현재**: `/auth/callback`만 처리
- **개선 방향**:
  - 특정 모임 페이지로 직접 이동: `ingk://meetings/123`
  - 특정 질문 페이지로 이동: `ingk://questions/456`
  - 공유 기능 강화
- **예상 작업 시간**: 2-3시간

#### 5. 네트워크 상태 감지
- **현재**: `@capacitor/network` 설치되었으나 미사용
- **개선 방향**:
  - 오프라인 모드 감지
  - 네트워크 복구 시 자동 동기화
  - 오프라인 상태 UI 표시
- **예상 작업 시간**: 2시간

### 🟢 낮은 우선순위 (향후 개선)

#### 6. PWA와 네이티브 앱 우선순위 설정
- **현재**: Service Worker와 Capacitor 로직이 동시에 작동
- **개선 방향**: 플랫폼별 최적화

#### 7. iOS Universal Links 설정
- **현재**: Custom URL Scheme만 사용
- **개선 방향**:
  - `https://yourdomain.com/auth/callback` 형태로 앱 자동 실행
  - App Store 제출 시 권장 사항
- **필요 파일**: `apple-app-site-association`

#### 8. Android App Links 설정
- **현재**: Custom URL Scheme만 사용
- **개선 방향**:
  - `https://yourdomain.com/auth/callback` 형태로 앱 자동 실행
  - Google Play 제출 시 권장 사항
- **필요 파일**: `assetlinks.json`

---

## 문제 발생 시 대응 방법

### 딥링크가 작동하지 않는 경우

#### iOS
1. **Info.plist 확인**:
   ```bash
   # Info.plist에 CFBundleURLTypes가 있는지 확인
   cat ios/App/App/Info.plist | grep -A 10 "CFBundleURLTypes"
   ```

2. **Xcode에서 URL Types 확인**:
   - Xcode 열기 → 프로젝트 선택 → Info 탭
   - URL Types에 `ingk` 스킴이 등록되어 있는지 확인

3. **재빌드**:
   ```bash
   npx cap sync ios
   # Xcode에서 Clean Build Folder (Cmd + Shift + K)
   # 다시 빌드 (Cmd + B)
   ```

#### Android
1. **AndroidManifest.xml 확인**:
   ```bash
   # Intent Filter가 있는지 확인
   cat android/app/src/main/AndroidManifest.xml | grep -A 5 "ingk"
   ```

2. **Gradle 재동기화**:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx cap sync android
   ```

3. **ADB로 수동 테스트**:
   ```bash
   adb shell am start -W -a android.intent.action.VIEW \
     -d "ingk://auth/callback?code=test" \
     com.tongchalban.community
   ```

### 소셜 로그인이 실패하는 경우

#### Google 로그인 오류

**"Redirect URI mismatch" 오류**:
1. Google Cloud Console → Credentials 확인
2. Authorized redirect URIs 목록 확인:
   - `https://wghrshqnexgaojxrtiit.supabase.co/auth/v1/callback`
   - `[YOUR-DOMAIN]/auth/callback`
   - `ingk://auth/callback`
3. 추가 후 5-10분 대기 (Google 캐시 갱신 시간)

**"Access blocked: This app's request is invalid" 오류**:
1. OAuth consent screen에서 Publishing status 확인
2. Testing 모드인 경우 → Test users 추가 또는 Production 전환

#### Kakao 로그인 오류

**"KOE006: invalid_request" 오류**:
1. Kakao Developers → 내 애플리케이션 확인
2. Redirect URI 목록 확인:
   - `[YOUR-DOMAIN]/auth/callback`
   - `ingk://auth/callback`
3. REST API 키가 환경 변수와 일치하는지 확인

**"앱 키가 일치하지 않습니다" 오류**:
1. `.env` 파일의 `VITE_KAKAO_CLIENT_ID` 확인
2. Kakao Developers → 앱 키 탭에서 REST API 키 복사
3. 정확히 일치하는지 확인

**"동의 항목 미설정" 오류**:
1. Kakao Developers → 제품 설정 → 카카오 로그인 → 동의항목
2. 이메일과 프로필 정보를 "필수 동의"로 설정
3. 저장 후 테스트

### 앱이 크래시하는 경우

#### iOS 크래시
1. **Xcode Console 확인**:
   - Window → Devices and Simulators
   - 실기기 선택 → View Device Logs
   - 최근 크래시 로그 확인

2. **일반적인 원인**:
   - Info.plist 권한 누락 → 권한 설명 추가
   - CocoaPods 의존성 충돌 → `pod deintegrate && pod install`
   - 코드 사인 문제 → Xcode에서 Team 설정 확인

#### Android 크래시
1. **Logcat 확인**:
   ```bash
   adb logcat | grep "AndroidRuntime"
   ```

2. **일반적인 원인**:
   - AndroidManifest.xml 권한 누락 → 권한 추가
   - Gradle 버전 충돌 → `./gradlew clean`
   - ProGuard 설정 → 릴리스 빌드 시 난독화 규칙 확인

### 빌드 오류

#### iOS 빌드 오류
```bash
# CocoaPods 재설치
cd ios/App
pod deintegrate
pod install
cd ../..

# Capacitor 재동기화
npx cap sync ios
```

#### Android 빌드 오류
```bash
# Gradle 캐시 정리
cd android
./gradlew clean
./gradlew cleanBuildCache
cd ..

# Capacitor 재동기화
npx cap sync android
```

---

## 배포 체크리스트

### 웹 배포 (Vercel)
- [x] 프로덕션 빌드 성공
- [x] 환경 변수 설정 완료
- [x] Git 푸시 완료
- [x] Vercel 자동 배포 확인
- [ ] 배포 후 웹사이트 접속 테스트
- [ ] 소셜 로그인 테스트 (웹)

### iOS 앱 배포 (TestFlight / App Store)
- [x] Info.plist URL Schemes 설정
- [x] Deep link 처리 로직 구현
- [ ] 앱 아이콘 및 스플래시 스크린 준비
- [ ] Xcode Archive 생성
- [ ] TestFlight 내부 테스트
- [ ] 베타 테스터 피드백 수집
- [ ] App Store Connect 메타데이터 작성
- [ ] 스크린샷 준비 (필수: 6.5", 5.5")
- [ ] 개인정보 처리방침 URL 등록
- [ ] App Store 심사 제출

### Android 앱 배포 (Google Play)
- [x] AndroidManifest.xml Intent Filter 설정
- [x] Deep link 처리 로직 구현
- [ ] 앱 아이콘 및 스플래시 스크린 준비
- [ ] 서명 키 생성 (keystore)
- [ ] Signed APK/AAB 빌드
- [ ] Google Play Console 내부 테스트
- [ ] 베타 테스터 피드백 수집
- [ ] Play Console 메타데이터 작성
- [ ] 스크린샷 준비 (필수: 폰, 태블릿)
- [ ] 개인정보 처리방침 URL 등록
- [ ] Google Play 심사 제출

---

## 추가 참고 자료

### 공식 문서
- [Capacitor Deep Links](https://capacitorjs.com/docs/guides/deep-links)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Kakao Login REST API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)

### 프로젝트 내부 문서
- `PROJECT_SUMMARY.md`: 프로젝트 전체 개요
- `SOCIAL_LOGIN_SETUP_GUIDE.md`: 소셜 로그인 상세 가이드
- `CAPACITOR_SETUP.md`: Capacitor 설정 가이드
- `DEPLOYMENT.md`: 배포 가이드

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2025-11-05 | 1.0.0 | 초기 문서 작성 - 모바일 딥링크 구현 및 배포 완료 |

---

**작성자**: Claude Code
**최종 업데이트**: 2025년 11월 5일
**문의**: 프로젝트 이슈 트래커
