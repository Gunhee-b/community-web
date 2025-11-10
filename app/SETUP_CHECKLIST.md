# App 설정 체크리스트

이 문서는 앱을 완전히 실행하기 위해 직접 추가해야 하는 필수 요소들을 정리한 것입니다.

---

## 🔧 필수 설정 항목

### 1. 환경 변수 설정 (`.env` 파일)

**위치:** `/app/.env`

**현재 상태:**
```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://wghrshqnexgaojxrtiit.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Kakao OAuth
EXPO_PUBLIC_KAKAO_CLIENT_ID=57450a0289e45de479273c9fc168f4fb
EXPO_PUBLIC_KAKAO_CLIENT_SECRET=8RH5CP2H6mm78j9D3BxMbjMeWE8eV0b9
```

**추가 필요:**
```env
# API Base URL - 실제 백엔드 서버 URL로 변경 필요
EXPO_PUBLIC_API_URL=https://your-api-server.com

# Google OAuth (소셜 로그인용)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your-google-client-secret

# Naver OAuth (선택사항)
EXPO_PUBLIC_NAVER_CLIENT_ID=your-naver-client-id
EXPO_PUBLIC_NAVER_CLIENT_SECRET=your-naver-client-secret
```

**설정 방법:**
1. `.env` 파일 열기
2. 위 변수들을 복사해서 추가
3. 실제 값으로 변경
4. 서버 재시작 (`npx expo start --web --clear`)

---

### 2. API 서버 설정

**파일:** `services/api.ts:75`

**현재 코드:**
```typescript
baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
```

**문제점:**
- 기본값 `https://api.example.com`은 존재하지 않는 URL
- `.env`에 실제 API 서버 URL 추가 필요

**해결 방법:**

**옵션 1: Supabase Edge Functions 사용 (권장)**
```env
EXPO_PUBLIC_API_URL=https://wghrshqnexgaojxrtiit.supabase.co/functions/v1
```

**옵션 2: 별도 백엔드 서버**
```env
EXPO_PUBLIC_API_URL=https://your-backend.herokuapp.com/api
```

**옵션 3: 로컬 개발**
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

---

### 3. 소셜 로그인 구현

#### Google 로그인

**파일:** `app/(auth)/login.tsx:82-84`

**현재 상태:** 구조만 있음
```typescript
case 'google':
  result = await AuthService.signInWithGoogle();
  break;
```

**필요한 작업:**

1. **Google OAuth 설정**
   - [Google Cloud Console](https://console.cloud.google.com/) 접속
   - 프로젝트 생성
   - OAuth 2.0 클라이언트 ID 생성
   - Redirect URI 설정:
     - Web: `http://localhost:8081`
     - iOS: `com.googleusercontent.apps.YOUR_CLIENT_ID:/`
     - Android: `com.yourapp:/oauth2redirect`

2. **라이브러리 설치**
```bash
npx expo install @react-native-google-signin/google-signin
# 또는
npx expo install expo-auth-session expo-crypto
```

3. **AuthService에 메서드 추가 필요**
   - `services/auth.ts`에 `signInWithGoogle()` 메서드 구현
   - 또는 `services/api/auth.ts`에 추가

#### Kakao 로그인

**파일:** `app/(auth)/login.tsx:86-89`

**현재 상태:** TODO
```typescript
case 'kakao':
  // TODO: Kakao 로그인 구현
  Alert.alert('알림', 'Kakao 로그인은 곧 지원될 예정입니다.');
```

**필요한 작업:**

1. **Kakao Developers 설정**
   - [Kakao Developers](https://developers.kakao.com/) 접속
   - 애플리케이션 추가
   - 플랫폼 설정 (iOS, Android, Web)
   - Redirect URI 등록

2. **라이브러리 설치**
```bash
npm install @react-native-seoul/kakao-login
```

3. **구현 필요**
   - `services/auth.ts`에 `signInWithKakao()` 메서드 추가

#### Naver 로그인

**파일:** `app/(auth)/login.tsx:91-94`

**현재 상태:** TODO
```typescript
case 'naver':
  // TODO: Naver 로그인 구현
  Alert.alert('알림', 'Naver 로그인은 곧 지원될 예정입니다.');
```

**필요한 작업:**

1. **Naver Developers 설정**
   - [Naver Developers](https://developers.naver.com/) 접속
   - 애플리케이션 등록
   - 서비스 URL, Callback URL 설정

2. **라이브러리 설치**
```bash
npm install @react-native-seoul/naver-login
```

3. **구현 필요**
   - `services/auth.ts`에 `signInWithNaver()` 메서드 추가

---

### 4. 미구현 화면 완성

#### Signup Screen

**파일:** `app/(auth)/signup.tsx`

**필요한 작업:**
- [ ] UI 구현 (LoginScreen 참고)
- [ ] 폼 필드: username, email, password, confirmPassword, inviteCode
- [ ] 유효성 검사
- [ ] `AuthService.signup()` 호출
- [ ] 회원가입 후 자동 로그인

**예시 구조:**
```typescript
// 필요한 필드
const [username, setUsername] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [inviteCode, setInviteCode] = useState('');

// 회원가입 처리
const handleSignup = async () => {
  const result = await AuthService.signup({
    username,
    email,
    password,
    inviteCode,
  });

  if (result.success && result.data) {
    login(result.data.user, result.data.access_token, 'local');
    // 자동으로 홈으로 이동됨
  }
};
```

#### Reset Password Screen

**파일:** `app/(auth)/reset-password.tsx`

**필요한 작업:**
- [ ] UI 구현
- [ ] 이메일 입력 필드
- [ ] `AuthService.sendPasswordResetEmail()` 호출
- [ ] 성공 메시지 표시

#### Home Screen

**파일:** `app/(tabs)/home.tsx`

**현재 상태:** 플레이스홀더

**필요한 작업:**
- [ ] 오늘의 질문 배너 컴포넌트
- [ ] 다가오는 모임 캐러셀
- [ ] 최근 활동 피드
- [ ] API 연동

**권장 구조:**
```typescript
// 컴포넌트
<ScrollView>
  <TodayQuestionBanner />
  <UpcomingMeetingsCarousel />
  <RecentActivityFeed />
</ScrollView>
```

#### Meetings Screen

**파일:** `app/(tabs)/meetings.tsx`

**필요한 작업:**
- [ ] 모임 목록 표시
- [ ] 필터링 (upcoming, past, my meetings)
- [ ] 모임 생성 버튼
- [ ] API 연동 (`API_ENDPOINTS.MEETINGS.LIST`)

#### Questions Screen

**파일:** `app/(tabs)/questions.tsx`

**필요한 작업:**
- [ ] 질문 목록 표시
- [ ] 오늘의 질문 강조
- [ ] 답변 작성 버튼
- [ ] API 연동 (`API_ENDPOINTS.QUESTIONS.LIST`)

#### Profile Screen

**파일:** `app/(tabs)/profile.tsx`

**필요한 작업:**
- [ ] 사용자 정보 표시
- [ ] 프로필 편집 기능
- [ ] 로그아웃 버튼
- [ ] 설정 옵션
- [ ] 다크모드 토글

---

### 5. 추가 컴포넌트 구현

다음 컴포넌트들이 코드에서 참조되지만 아직 구현되지 않았을 수 있습니다:

**필요한 컴포넌트:**
```
components/
├── navigation/
│   └── TopNavBar.tsx       ← home.tsx:4에서 사용
├── questions/
│   └── TodayQuestionBanner.tsx
├── meetings/
│   ├── UpcomingMeetingsCarousel.tsx
│   └── MeetingCard.tsx
└── feed/
    └── RecentActivityFeed.tsx
```

**확인 방법:**
```bash
cd /Users/baegeonhui/Documents/Programming/vote-example/app
find components -name "*.tsx" | grep -E "(TopNavBar|TodayQuestion|Meeting|Feed)"
```

---

### 6. 타입 정의

**파일:** `types/index.ts` 또는 유사한 파일

**필요한 타입:**
```typescript
// User 타입
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'host' | 'admin';
  avatar_url?: string;
  created_at: string;
  // 추가 필드...
}

// Meeting 타입
export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  host_id: string;
  participants: string[];
  // 추가 필드...
}

// Question 타입
export interface Question {
  id: string;
  title: string;
  content: string;
  created_at: string;
  answers_count: number;
  // 추가 필드...
}
```

---

## 📋 설정 체크리스트

### 필수 (앱 실행을 위해 반드시 필요)

- [ ] `.env` 파일에 `EXPO_PUBLIC_API_URL` 추가
- [ ] Supabase 연결 확인 (현재 설정됨)
- [ ] 타입 정의 파일 확인/생성 (`types/`)

### 소셜 로그인 (선택사항이지만 권장)

- [ ] Google OAuth 설정
  - [ ] Google Cloud Console에서 프로젝트 생성
  - [ ] OAuth 클라이언트 ID 발급
  - [ ] `.env`에 추가
  - [ ] `AuthService.signInWithGoogle()` 구현
- [ ] Kakao 로그인 설정
  - [ ] Kakao Developers 앱 등록
  - [ ] `.env`에 추가
  - [ ] `AuthService.signInWithKakao()` 구현
- [ ] Naver 로그인 설정 (선택)

### 화면 구현

- [ ] Signup Screen 구현
- [ ] Reset Password Screen 구현
- [ ] Home Screen 구현
- [ ] Meetings Screen 구현
- [ ] Questions Screen 구현
- [ ] Profile Screen 구현

### 컴포넌트

- [ ] TopNavBar 컴포넌트 확인/생성
- [ ] TodayQuestionBanner 구현
- [ ] UpcomingMeetingsCarousel 구현
- [ ] RecentActivityFeed 구현

---

## 🚀 빠른 시작 가이드

### 최소 설정으로 앱 실행하기

1. **API URL 설정**
```bash
# .env 파일에 추가
echo "EXPO_PUBLIC_API_URL=https://wghrshqnexgaojxrtiit.supabase.co/functions/v1" >> .env
```

2. **서버 재시작**
```bash
npx expo start --web --clear
```

3. **브라우저에서 확인**
   - http://localhost:8081 접속
   - 로그인 화면이 표시되어야 함

4. **테스트 계정으로 로그인**
   - Supabase에 테스트 사용자 생성
   - 또는 회원가입 화면 먼저 구현

---

## 📞 문제 해결

### 서버가 시작되지 않음
```bash
# 모든 캐시 삭제 후 재시작
rm -rf .expo .metro node_modules/.cache
npx expo start --web --clear
```

### 환경 변수가 인식되지 않음
```bash
# 서버를 완전히 종료 후 재시작
# Ctrl+C로 종료
npx expo start --web --clear
```

### 빈 화면이 보임
1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭에서 에러 확인
3. 빨간색 에러 메시지 확인
4. 캐시 삭제 후 새로고침 (Cmd+Shift+R)

---

## 📚 추가 리소스

- [Expo 문서](https://docs.expo.dev/)
- [Supabase 문서](https://supabase.com/docs)
- [React Native 문서](https://reactnative.dev/)
- [Google OAuth 설정](https://developers.google.com/identity/protocols/oauth2)
- [Kakao Developers](https://developers.kakao.com/docs)

---

## ✅ 완료 후 확인사항

모든 설정이 완료되면:

1. [ ] 로그인 화면이 표시됨
2. [ ] 회원가입이 작동함
3. [ ] 로그인이 작동함
4. [ ] 홈 화면으로 자동 이동됨
5. [ ] 탭 네비게이션이 작동함
6. [ ] 로그아웃이 작동함

---

**마지막 업데이트:** 2025-11-09
