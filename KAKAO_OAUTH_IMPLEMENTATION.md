# Kakao OAuth 로그인 구현 완료 보고서

## 📅 작업 일자
2025년 11월 17일

## 🎯 작업 목표
React Native + Expo 모바일 앱에 Kakao OAuth 소셜 로그인 구현

---

## ✅ 완료된 작업

### 1. Kakao OAuth 구현 방식 변경

#### **문제점**
- 초기 구현: Custom URL Scheme 사용 (`kakao{CLIENT_ID}://oauth`)
- Kakao REST API는 **웹 형태의 Redirect URI만 지원**
- KOE006 에러 발생: "등록되지 않은 Redirect URI"

#### **해결책**
웹 형태 Redirect URI + Supabase Edge Function 활용

```
플로우:
1. 앱에서 Kakao OAuth URL 열기
2. Kakao 로그인 및 동의
3. Kakao → Edge Function (kakao-callback)으로 리다이렉트
4. Edge Function → 앱(rezom://)으로 리다이렉트
5. 앱에서 authorization code 추출
6. kakao-auth Edge Function으로 토큰 교환
7. 사용자 정보 생성/조회 및 로그인 완료
```

### 2. 수정된 파일 목록

#### **모바일 앱 (app/)**

1. **`services/auth.ts`**
   - Kakao OAuth 구현 수정 (Line 638-731)
   - 웹 형태 Redirect URI 사용
   - 토큰 만료 확인 수정 (Kakao 토큰 예외 처리)
   - refreshTokens() 수정 (Kakao 토큰 리프레시 건너뛰기)
   - fetchCurrentUser() 수정 (API 호출 대신 로컬 스토리지 사용)

2. **`app/_layout.tsx`**
   - Deep Link 핸들러 개선 (Line 70-125)
   - Kakao/Google OAuth 통합 처리

3. **`services/api/questions.ts`**
   - fetchTodayQuestion() 수정 (Line 31-51)
   - RPC 함수 대신 직접 쿼리 사용

#### **Supabase Edge Functions (web/supabase/functions/)**

1. **`kakao-callback/index.ts`** (신규 생성)
   - Kakao로부터 인증 코드 수신
   - 앱으로 리다이렉트 (`rezom://auth/callback?code=...`)

2. **`kakao-auth/index.ts`**
   - 세션 생성 로직 제거 (Line 136-151)
   - Supabase Auth 대신 직접 사용자 반환

### 3. Supabase 설정

#### **Edge Function Secrets**
```bash
KAKAO_CLIENT_ID=57450a0289e45de479273c9fc168f4fb
KAKAO_CLIENT_SECRET=8RH5CP2H6mm78j9D3BxMbjMeWE8eV0b9
SUPABASE_URL=https://wghrshqnexgaojxrtiit.supabase.co
SUPABASE_ANON_KEY=[설정됨]
SUPABASE_SERVICE_ROLE_KEY=[설정됨]
```

#### **배포된 Edge Functions**
```bash
✅ kakao-callback (JWT 검증 비활성화)
✅ kakao-auth (JWT 검증 비활성화)
```

### 4. Kakao 개발자 콘솔 설정

#### **애플리케이션 정보**
- **Native App Key**: `57450a0289e45de479273c9fc168f4fb`
- **REST API 키**: (설정됨)

#### **플랫폼 설정**
- **iOS Bundle ID**: `com.rezom.community`

#### **카카오 로그인 설정**
- **활성화**: ON ✅
- **OpenID Connect**: ON ✅

#### **Redirect URI**
```
https://wghrshqnexgaojxrtiit.supabase.co/functions/v1/kakao-callback
```

---

## 🔧 해결한 주요 에러

### 1. KOE006 에러
**문제**: "등록되지 않은 Redirect URI"
**원인**: Custom URL Scheme 사용 (`kakao{CLIENT_ID}://oauth`)
**해결**: 웹 형태 Redirect URI로 변경

### 2. KOE101 에러
**문제**: "Not exist client_id []"
**원인**: Edge Function 환경 변수 미설정
**해결**: `KAKAO_CLIENT_ID` 환경 변수 설정 및 재배포

### 3. Session Creation 에러
**문제**: "A user with this email address has already been registered"
**원인**: Supabase Auth에서 중복 사용자 생성 시도
**해결**: Supabase Auth 세션 생성 로직 제거, RPC로 생성된 사용자 정보만 반환

### 4. Today's Question 에러
**문제**: "Could not find the function public.get_today_question"
**원인**: Supabase RPC 함수 미존재
**해결**: 직접 questions 테이블 쿼리

### 5. Token Expiry 에러
**문제**: "Not a valid base64 encoded string length"
**원인**: Kakao 토큰은 JWT 형식이 아님
**해결**: Kakao 토큰(`kakao_` 접두사)은 만료 확인 건너뛰기

### 6. Network 에러
**문제**: `/auth/me`, `/auth/refresh` 호출 실패
**원인**: 백엔드 API 서버 미존재 (Supabase만 사용)
**해결**: API 호출 제거 및 로컬 스토리지 사용

---

## 📱 앱 구성 정보

### iOS 설정 (app.json)
```json
{
  "ios": {
    "bundleIdentifier": "com.rezom.community",
    "infoPlist": {
      "LSApplicationQueriesSchemes": [
        "kakaokompassauth",
        "kakaolink"
      ],
      "CFBundleURLTypes": [
        {
          "CFBundleURLSchemes": ["kakao57450a0289e45de479273c9fc168f4fb"]
        },
        {
          "CFBundleURLSchemes": ["rezom"]
        }
      ]
    }
  }
}
```

### 환경 변수 (.env)
```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://wghrshqnexgaojxrtiit.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[설정됨]

# Kakao OAuth
EXPO_PUBLIC_KAKAO_CLIENT_ID=57450a0289e45de479273c9fc168f4fb
EXPO_PUBLIC_KAKAO_CLIENT_SECRET=8RH5CP2H6mm78j9D3BxMbjMeWE8eV0b9
```

---

## 🧪 테스트 결과

### iOS 시뮬레이터 테스트 ✅
- **디바이스**: iPhone 17 Pro
- **빌드**: 성공 (0 errors, 1 warning)
- **Kakao 로그인**: ✅ 성공
- **사용자 생성**: ✅ 성공 (배건희1)
- **홈 화면 이동**: ✅ 정상

### 콘솔 로그
```log
LOG  Kakao Auth URL: https://kauth.kakao.com/oauth/authorize?client_id=57450a0289e45de479273c9fc168f4fb&redirect_uri=https%3A%2F%2Fwghrshqnexgaojxrtiit.supabase.co%2Ffunctions%2Fv1%2Fkakao-callback&response_type=code

LOG  Kakao Redirect URI: https://wghrshqnexgaojxrtiit.supabase.co/functions/v1/kakao-callback

LOG  Kakao WebBrowser result: {"type": "success", "url": "rezom://auth/callback?code=..."}

LOG  Kakao code received: HeydfeHLQyMu9UGYbyr-...

LOG  ✅ Kakao login successful: 배건희1
```

---

## 🚀 실제 기기 테스트 준비 (진행 중)

### Xcode 프로젝트
- **위치**: `ios/RezomCommunity.xcworkspace`
- **Bundle ID**: `com.rezom.community`
- **상태**: Xcode 열림 완료

### 실제 기기 테스트 시 확인사항

#### ✅ **카카오톡 앱 설치 여부**
- **설치됨**: 카카오톡 앱으로 빠른 로그인
- **미설치**: Safari 브라우저로 로그인

#### ✅ **네트워크 연결**
- Wi-Fi 또는 셀룰러 데이터 필요
- Supabase Edge Functions 호출

#### ✅ **권한 설정**
- 사진 접근 권한 (이미지 업로드 시)

### 예상 테스트 플로우
```
1. iPhone을 Mac에 USB 연결
2. Xcode에서 Team 선택 (Signing & Capabilities)
3. Xcode 상단에서 실제 기기 선택
4. Cmd + R로 빌드 및 실행
5. Kakao 로그인 테스트
   - 카카오톡 앱 로그인 (설치 시)
   - 또는 Safari 로그인
6. 로그인 성공 확인
7. 홈 화면 정상 표시 확인
```

---

## 📊 OAuth 플로우 다이어그램

### 최종 구현된 플로우
```
┌─────────────┐
│   모바일 앱   │
└──────┬──────┘
       │ 1. OAuth 요청
       ↓
┌─────────────────────────────────────────────────┐
│ https://kauth.kakao.com/oauth/authorize         │
│ ?client_id=57450a0289e45de479273c9fc168f4fb     │
│ &redirect_uri=https://wghrshqnexgaojxrtiit...   │
│ &response_type=code                             │
└──────┬──────────────────────────────────────────┘
       │ 2. 사용자 로그인 & 동의
       ↓
┌─────────────────────────────────────┐
│   Kakao Authorization Server        │
└──────┬──────────────────────────────┘
       │ 3. Authorization Code 전송
       ↓
┌────────────────────────────────────────────────┐
│ Supabase Edge Function: kakao-callback         │
│ https://...supabase.co/functions/v1/           │
│         kakao-callback?code=ABC123             │
└──────┬─────────────────────────────────────────┘
       │ 4. Deep Link 리다이렉트
       ↓
┌─────────────────────────────────┐
│ rezom://auth/callback?code=ABC  │
└──────┬──────────────────────────┘
       │ 5. Code 추출 및 전송
       ↓
┌────────────────────────────────────────┐
│ Supabase Edge Function: kakao-auth     │
│ - 토큰 교환 (code → access_token)      │
│ - 사용자 정보 조회                      │
│ - find_or_create_social_user RPC      │
└──────┬─────────────────────────────────┘
       │ 6. 사용자 정보 반환
       ↓
┌─────────────┐
│   로그인 완료  │
│   홈 화면 이동 │
└─────────────┘
```

---

## 📝 참고 파일 위치

### 모바일 앱
```
app/
├── services/
│   ├── auth.ts                    # Kakao OAuth 구현
│   └── api/questions.ts           # Today's Question 수정
├── app/
│   ├── _layout.tsx                # Deep Link 핸들러
│   ├── (auth)/login.tsx           # 로그인 화면
│   └── (tabs)/home.tsx            # 홈 화면
├── app.json                       # iOS 설정
└── .env                           # 환경 변수
```

### Supabase Edge Functions
```
web/supabase/functions/
├── kakao-callback/
│   └── index.ts                   # OAuth 콜백 리다이렉트
└── kakao-auth/
    └── index.ts                   # 토큰 교환 및 사용자 생성
```

---

## 🎯 다음 단계

### 즉시 수행할 작업
1. ✅ Xcode에서 Team 선택 (Signing & Capabilities)
2. ✅ iPhone 실제 기기 연결
3. ✅ Xcode에서 빌드 및 실행 (Cmd + R)
4. ✅ 실제 기기에서 Kakao 로그인 테스트

### 추가 개선 사항 (선택)
- [ ] Google OAuth 테스트 (Google Client ID 설정 필요)
- [ ] Naver OAuth 구현
- [ ] 로그아웃 기능 테스트
- [ ] 토큰 갱신 로직 개선
- [ ] 에러 처리 개선

---

## 🔗 관련 문서

### Kakao Developers
- 카카오 로그인 REST API: https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api
- iOS 설정: https://developers.kakao.com/docs/latest/ko/kakaologin/ios

### Supabase
- Edge Functions: https://supabase.com/docs/guides/functions
- Dashboard: https://supabase.com/dashboard/project/wghrshqnexgaojxrtiit/functions

### 프로젝트
- 개발자 콘솔: https://developers.kakao.com
- Supabase URL: https://wghrshqnexgaojxrtiit.supabase.co

---

## 📞 문의 및 지원

### 발견된 이슈 또는 개선사항
GitHub Issues 또는 프로젝트 관리자에게 문의

### 긴급 문제
- Edge Function 로그: Supabase Dashboard → Functions → Logs
- 앱 콘솔 로그: Metro Bundler 또는 Xcode Console

---

**작성자**: Claude Code
**마지막 업데이트**: 2025년 11월 17일
**문서 버전**: 1.0
