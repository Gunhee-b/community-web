# 소셜 로그인 설정 가이드

**최종 업데이트**: 2025-01-31
**목적**: 통찰방 프로젝트에 소셜 로그인(구글, 카카오) 추가 및 기존 인증과 병행 운영

---

## 🎯 현재 진행 상황

- ✅ **코드 구현**: 완료
- ✅ **데이터베이스 마이그레이션**: 실행 완료
- ✅ **Google 로그인**: 연동 및 테스트 완료
- ⏳ **Kakao 로그인**: 추후 연동 예정
- ✅ **빌드**: 성공

**참고**: 이 가이드는 Google과 Kakao 로그인을 설명합니다. Facebook 로그인은 제거되었습니다.

---

## 📋 목차

1. [개요](#개요)
2. [Supabase 설정](#supabase-설정)
3. [소셜 앱 설정](#소셜-앱-설정)
4. [환경 변수 설정](#환경-변수-설정)
5. [데이터베이스 마이그레이션](#데이터베이스-마이그레이션)
6. [모바일 앱 설정](#모바일-앱-설정)
7. [기존 사용자 전환 가이드](#기존-사용자-전환-가이드)
8. [테스트](#테스트)
9. [문제 해결](#문제-해결)

---

## 개요

### 현재 상황
- **기존 인증**: username/password (커스텀 RPC 함수)
- **활성 사용자**: 약 30명
- **플랫폼**: 웹 + iOS + Android (Capacitor)

### 목표
- **1주일 전환 기간**: 기존 인증과 소셜 로그인 병행
- **완전 전환**: 모든 사용자가 소셜 계정 연동 완료

### 지원 소셜 로그인
- ✅ Google
- ✅ Kakao

---

## Supabase 설정

### 1. Supabase Dashboard 접속

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. `Authentication` → `Providers` 이동

### 2. Google Provider 활성화

1. **Enable Google Provider** 토글 ON
2. 필요한 정보:
   - **Client ID**: Google Cloud Console에서 발급
   - **Client Secret**: Google Cloud Console에서 발급
   - **Authorized redirect URIs**: Supabase가 자동으로 제공

**Redirect URI 예시**:
```
https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
```

### 3. Kakao Provider (커스텀 구현)

Supabase는 Kakao를 기본 지원하지 않으므로 커스텀 OAuth 플로우 사용:
- REST API 사용
- Redirect URI: `ingk://auth/callback` (모바일) 또는 `[YOUR-DOMAIN]/auth/callback` (웹)

---

## 소셜 앱 설정

### Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 생성 또는 선택
3. **APIs & Services** → **Credentials**
4. **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. **Authorized redirect URIs** 추가:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   http://localhost:5173/auth/callback (개발용)
   [YOUR-PRODUCTION-DOMAIN]/auth/callback
   ingk://auth/callback (모바일)
   ```
7. Client ID와 Client Secret 복사

**추가 설정**:
- OAuth consent screen 설정 (앱 이름, 로고, 지원 이메일)
- Scopes: `email`, `profile`

### Kakao Developers

1. [Kakao Developers](https://developers.kakao.com) 접속
2. **내 애플리케이션** → **애플리케이션 추가하기**
3. **앱 설정** → **플랫폼**
   - **Web 플랫폼 등록**: 사이트 도메인 입력
   - **Android 플랫폼 등록**: 패키지명 `com.tongchalban.community`
   - **iOS 플랫폼 등록**: 번들 ID `com.tongchalban.community`
4. **앱 설정** → **앱 키**
   - REST API 키 복사
   - JavaScript 키 복사 (선택)
5. **제품 설정** → **카카오 로그인**
   - 카카오 로그인 활성화
   - **Redirect URI** 등록:
     ```
     http://localhost:5173/auth/callback (개발용)
     [YOUR-PRODUCTION-DOMAIN]/auth/callback
     ingk://auth/callback (모바일)
     ```
6. **동의항목** 설정
   - 이메일: 필수 동의
   - 프로필 정보: 필수 동의
7. **비즈 앱 전환** (선택, 프로덕션 권장)

**Client Secret 발급** (보안 강화):
1. **제품 설정** → **카카오 로그인** → **보안**
2. **Client Secret** → **코드 생성** 클릭
3. 생성된 코드를 **활성화** 상태로 변경
4. Client Secret 복사

---

## 환경 변수 설정

### 웹 환경 변수

`.env` 파일 생성 또는 수정:

```env
# Supabase
VITE_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]

# Google OAuth (Supabase Provider 사용)
# Supabase Dashboard에 직접 입력하므로 여기서는 불필요

# Kakao OAuth (커스텀 구현)
VITE_KAKAO_CLIENT_ID=[YOUR-KAKAO-REST-API-KEY]
VITE_KAKAO_CLIENT_SECRET=[YOUR-KAKAO-CLIENT-SECRET]
```

### 프로덕션 환경

배포 플랫폼(Vercel, Netlify 등)에서 환경 변수 설정:
- Vercel: **Settings** → **Environment Variables**
- Netlify: **Site settings** → **Build & deploy** → **Environment**

---

## 데이터베이스 마이그레이션

### 1. 마이그레이션 파일 실행

Supabase SQL Editor에서 다음 파일 실행:

```bash
supabase/migrations/20250131_add_social_login_support.sql
```

**포함 내용**:
- `users` 테이블에 소셜 로그인 필드 추가 (email, provider, provider_id 등)
- `password_hash` NULL 허용
- `social_connections` 테이블 생성
- `find_or_create_social_user` 함수
- `link_social_account` 함수
- `update_username_with_limit` 함수 (닉네임 변경 제한)
- RLS 정책 추가

### 2. 관리자 이메일 설정

마이그레이션 후 관리자 계정에 이메일 추가:

```sql
-- 관리자 계정에 이메일 설정 (예시)
UPDATE users
SET email = 'gflying11@gmail.com'
WHERE username = 'admin1';

UPDATE users
SET email = 'rebranding96@gmail.com'
WHERE username = 'admin2';
```

**참고**: 이메일 설정 시 자동으로 `role = 'admin'`으로 설정됩니다 (트리거 작동).

### 3. 검증

```sql
-- 테이블 구조 확인
\d users
\d social_connections

-- 관리자 확인
SELECT id, username, email, role FROM users WHERE role = 'admin';

-- 함수 확인
\df find_or_create_social_user
\df link_social_account
\df update_username_with_limit
```

---

## 모바일 앱 설정

### iOS 설정 (Xcode)

1. **URL Types 추가**:
   - Xcode에서 프로젝트 열기: `open ios/App/App.xcworkspace`
   - **Info** 탭 → **URL Types** → **+** 버튼
   - **Identifier**: `com.tongchalban.community`
   - **URL Schemes**: `ingk`

2. **Info.plist 수정** (`ios/App/App/Info.plist`):
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLName</key>
       <string>com.tongchalban.community</string>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>ingk</string>
       </array>
     </dict>
   </array>
   ```

3. **Universal Links 설정** (선택, 프로덕션 권장):
   - Associated Domains 추가: `applinks:[YOUR-DOMAIN]`
   - Apple App Site Association 파일 생성

### Android 설정

1. **AndroidManifest.xml 수정** (`android/app/src/main/AndroidManifest.xml`):
   ```xml
   <activity
       android:name=".MainActivity"
       ...>
       <intent-filter>
           <action android:name="android.intent.action.VIEW" />
           <category android:name="android.intent.category.DEFAULT" />
           <category android:name="android.intent.category.BROWSABLE" />
           <data
               android:scheme="ingk"
               android:host="auth" />
       </intent-filter>
   </activity>
   ```

2. **Deep Link 테스트**:
   ```bash
   adb shell am start -W -a android.intent.action.VIEW -d "ingk://auth/callback"
   ```

### Capacitor 동기화

설정 후 동기화:

```bash
npm run build && npx cap sync
```

---

## 기존 사용자 전환 가이드

### 1주일 전환 기간 운영

**Week 1 (Day 1-3): 공지 및 안내**
1. 앱 내 배너 표시: "소셜 로그인으로 더 편리하게!"
2. 이메일/푸시 알림: 소셜 계정 연동 안내
3. `/link-account` 페이지 링크 제공

**Week 1 (Day 4-7): 독려 및 지원**
1. 미연동 사용자에게 알림
2. 연동 완료 사용자 수 표시 (진행률)
3. FAQ 및 지원 채널 운영

**Week 2 이후: 완전 전환**
1. 기존 username/password 로그인 비활성화 (선택)
2. 모든 사용자가 소셜 로그인 사용

### 사용자 가이드

**기존 사용자 연동 방법**:
1. 기존 username/password로 로그인
2. 프로필 페이지에서 **"소셜 계정 연동"** 클릭
3. 원하는 소셜 계정 선택 (구글, 카카오, 페이스북)
4. 소셜 로그인 인증
5. 연동 완료 확인
6. 다음 로그인부터 소셜 로그인 사용 가능

**새로운 사용자**:
- 로그인 페이지에서 소셜 버튼으로 즉시 가입/로그인

### 연동 상태 확인

관리자가 연동 진행률 확인:

```sql
-- 전체 사용자 수
SELECT COUNT(*) as total_users FROM users WHERE is_active = true;

-- 소셜 계정 연동 완료 사용자 수
SELECT COUNT(DISTINCT user_id) as linked_users FROM social_connections;

-- 미연동 사용자 목록
SELECT username, email, created_at
FROM users
WHERE is_active = true
  AND id NOT IN (SELECT user_id FROM social_connections)
ORDER BY created_at;
```

---

## 테스트

### 웹 테스트

1. **개발 서버 실행**:
   ```bash
   npm run dev
   ```

2. **로그인 테스트**:
   - `http://localhost:5173/login` 접속
   - 소셜 로그인 버튼 클릭
   - OAuth 플로우 확인
   - 콜백 페이지 리다이렉트 확인
   - 홈페이지 로그인 상태 확인

3. **계정 연동 테스트**:
   - 기존 계정으로 로그인
   - `/link-account` 페이지 이동
   - 소셜 계정 연동 시도
   - 연동 목록 확인

### 모바일 테스트

#### iOS 테스트

1. **빌드 및 동기화**:
   ```bash
   npm run build && npx cap sync ios
   ```

2. **Xcode에서 실행**:
   ```bash
   open ios/App/App.xcworkspace
   ```
   - 시뮬레이터 또는 실기기 선택
   - Run (⌘R)

3. **소셜 로그인 테스트**:
   - 앱에서 로그인 페이지 이동
   - 소셜 로그인 버튼 클릭
   - Safari로 OAuth 페이지 이동
   - 인증 후 앱으로 자동 복귀 확인
   - 로그인 상태 확인

#### Android 테스트

1. **빌드 및 동기화**:
   ```bash
   npm run build && npx cap sync android
   ```

2. **Android Studio에서 실행**:
   ```bash
   npx cap open android
   ```
   - 에뮬레이터 또는 실기기 선택
   - Run (Shift + F10)

3. **딥링크 테스트**:
   ```bash
   adb shell am start -W -a android.intent.action.VIEW \
     -d "ingk://auth/callback?code=test&state=kakao"
   ```

### 테스트 체크리스트

- [ ] 구글 로그인 (웹)
- [ ] 구글 로그인 (iOS)
- [ ] 구글 로그인 (Android)
- [ ] 카카오 로그인 (웹)
- [ ] 카카오 로그인 (iOS)
- [ ] 카카오 로그인 (Android)
- [ ] 페이스북 로그인 (웹)
- [ ] 페이스북 로그인 (iOS)
- [ ] 페이스북 로그인 (Android)
- [ ] 기존 계정 소셜 연동
- [ ] 로그아웃 기능
- [ ] 세션 유지 (앱 재시작)
- [ ] 관리자 권한 유지

---

## 문제 해결

### 1. "Redirect URI mismatch" 오류

**원인**: OAuth Provider에 Redirect URI가 등록되지 않음

**해결**:
1. Google/Kakao Console에서 Redirect URI 확인
2. Supabase에서 제공하는 정확한 URI 사용:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
3. 모바일: `ingk://auth/callback`

### 2. 모바일에서 콜백 후 앱으로 돌아오지 않음

**원인**: 딥링크 설정 누락

**해결**:
- iOS: `Info.plist`의 `CFBundleURLSchemes` 확인
- Android: `AndroidManifest.xml`의 `intent-filter` 확인
- 동기화: `npx cap sync`

### 3. 카카오 로그인 실패

**원인**: REST API 키 또는 Client Secret 오류

**해결**:
1. Kakao Developers에서 REST API 키 확인
2. Client Secret 활성화 여부 확인
3. 환경 변수 재확인:
   ```bash
   echo $VITE_KAKAO_CLIENT_ID
   echo $VITE_KAKAO_CLIENT_SECRET
   ```
4. 앱 재시작

### 4. "User not found" 오류

**원인**: `find_or_create_social_user` 함수 실행 실패

**해결**:
1. Supabase SQL Editor에서 함수 확인:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'find_or_create_social_user';
   ```
2. 마이그레이션 재실행
3. 로그 확인: Supabase Dashboard → Logs → Postgres

### 5. 기존 사용자 이메일 충돌

**원인**: 소셜 계정 이메일이 이미 다른 사용자에게 사용됨

**해결**:
1. 기존 계정에 로그인 후 소셜 계정 연동 (권장)
2. 또는 기존 계정 이메일 변경

### 6. iOS 빌드 에러

**원인**: CocoaPods 의존성 문제

**해결**:
```bash
cd ios/App
pod deintegrate
pod install
cd ../..
npx cap sync ios
```

### 7. Android 빌드 에러

**원인**: Gradle 캐시 문제

**해결**:
```bash
cd android
./gradlew clean
./gradlew cleanBuildCache
cd ..
npx cap sync android
```

---

## 추가 리소스

### 문서
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Kakao Login REST API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)
- [Capacitor Deep Links](https://capacitorjs.com/docs/guides/deep-links)

### 지원
- GitHub Issues: [프로젝트 이슈 페이지]
- 이메일: support@tongchalban.com (예시)

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2025-01-31 | 1.0.0 | 초기 문서 작성 |

---

**작성자**: Claude Code
**최종 검토**: 2025-01-31
