# Phase 1 완료: React Native Navigation & 기본 화면

Figma 디자인을 React Native로 변환하는 첫 번째 단계가 완료되었습니다!

---

## ✅ 완료된 작업

### 1. Navigation 구조 설정
- ✅ **Expo Router** 설정 완료
- ✅ **Root Layout** (`app/_layout.tsx`)
  - 인증 상태 자동 복원
  - 자동 네비게이션 (로그인/메인)
  - 테마에 따른 StatusBar 스타일
- ✅ **Auth Group** (`app/(auth)/`)
  - Login, Signup, Reset Password
- ✅ **Tabs Group** (`app/(tabs)/`)
  - Home, Meetings, Questions, Profile
  - 하단 탭 네비게이션 (Ionicons)
  - 다크모드 지원

### 2. 재사용 가능한 UI 컴포넌트
모든 컴포넌트는 `/components/common/`에 위치

#### **Button** (`Button.tsx`)
```tsx
<Button
  title="로그인"
  onPress={handleLogin}
  variant="primary" // primary | secondary | outline | ghost
  size="large" // small | medium | large
  loading={isLoading}
  fullWidth
/>
```

**Props:**
- `variant`: 4가지 스타일 (primary, secondary, outline, ghost)
- `size`: 3가지 크기 (small, medium, large)
- `loading`: 로딩 스피너 표시
- `disabled`: 비활성화
- `fullWidth`: 전체 너비

---

#### **Input** (`Input.tsx`)
```tsx
<Input
  label="이메일"
  placeholder="your@email.com"
  value={email}
  onChangeText={setEmail}
  type="email" // text | password | email | number
  leftIcon="mail-outline"
  error={emailError}
/>
```

**Features:**
- 자동 `type` 감지 (password, email, number)
- 비밀번호 show/hide 토글
- 왼쪽/오른쪽 아이콘 지원
- 에러 메시지 표시
- 다크모드 지원

---

#### **Card** (`Card.tsx`)
```tsx
<Card noPadding={false}>
  <Text>Card Content</Text>
</Card>
```

**Features:**
- 그림자 효과
- 다크모드 지원
- 선택적 패딩

---

#### **Avatar** (`Avatar.tsx`)
```tsx
<Avatar
  name="김민수"
  imageUrl="https://..."
  size="medium" // small | medium | large
/>
```

**Features:**
- 이미지 URL 지원
- 이름 첫 글자 표시 (fallback)
- 3가지 크기

---

#### **Badge** (`Badge.tsx`)
```tsx
<Badge variant="primary" size="medium">
  Admin
</Badge>
```

**Props:**
- `variant`: primary, secondary, success, warning, error, info
- `size`: small, medium

---

#### **Loading** (`Loading.tsx`)
```tsx
<Loading message="데이터를 불러오는 중..." fullScreen />
```

**Features:**
- 전체 화면 모드
- 커스텀 메시지
- 다크모드 지원

---

### 3. Navigation 컴포넌트

#### **TopNavBar** (`TopNavBar.tsx`)
```tsx
<TopNavBar
  title="홈"
  showBackButton
  onNotifications={() => router.push('/notifications')}
  notificationCount={3}
  rightAction={<CustomButton />}
/>
```

**Features:**
- Safe Area 지원 (노치, 홈 바)
- 뒤로가기 버튼 (자동 또는 커스텀)
- 알림 벨 (배지 포함)
- 오른쪽 커스텀 액션
- 다크모드 지원

---

### 4. 화면 구현 상태

#### ✅ 완전히 구현된 화면

**LoginScreen** (`app/(auth)/login.tsx`)
- 이메일/비밀번호 입력
- 실시간 유효성 검사
- 소셜 로그인 버튼 (Google, Kakao, Naver)
- AuthService API 연동
- AuthStore 상태 관리
- 회원가입/비밀번호 재설정 링크
- 로딩 상태 처리
- 에러 Alert 표시
- 다크모드 지원

**연결된 기능:**
```typescript
// API
✅ AuthService.login({ email, password })
✅ AuthService.signInWithGoogle()

// Store
✅ useAuthStore().login(user, token, authType)

// Utils
✅ validateEmail(email)
✅ validatePassword(password)
```

---

#### 🔄 Placeholder 화면 (구현 예정)

1. **SignupScreen** (`app/(auth)/signup.tsx`)
   - TODO: 회원가입 폼 구현

2. **ResetPasswordScreen** (`app/(auth)/reset-password.tsx`)
   - TODO: 비밀번호 재설정 구현

3. **HomeScreen** (`app/(tabs)/home.tsx`)
   - TODO: 오늘의 질문 배너
   - TODO: 다가오는 모임 캐러셀
   - TODO: 최근 활동 피드

4. **MeetingsScreen** (`app/(tabs)/meetings.tsx`)
   - TODO: 탭 (자율/정기 모임)
   - TODO: 모임 카드 리스트

5. **QuestionsScreen** (`app/(tabs)/questions.tsx`)
   - TODO: 오늘의 질문
   - TODO: 이전 질문 리스트

6. **ProfileScreen** (`app/(tabs)/profile.tsx`)
   - TODO: 프로필 정보
   - TODO: 활동 통계
   - ✅ 로그아웃 기능 (구현됨)

---

## 📁 프로젝트 구조

```
/app/
├── app/                          # Expo Router 화면
│   ├── _layout.tsx              # ✅ Root Layout (인증 라우팅)
│   ├── (auth)/                  # 인증 그룹
│   │   ├── _layout.tsx          # ✅ Auth Layout
│   │   ├── login.tsx            # ✅ 로그인 (완료)
│   │   ├── signup.tsx           # 🔄 회원가입 (Placeholder)
│   │   └── reset-password.tsx   # 🔄 비밀번호 재설정 (Placeholder)
│   └── (tabs)/                  # 메인 탭 그룹
│       ├── _layout.tsx          # ✅ Tabs Layout (하단 탭)
│       ├── home.tsx             # 🔄 홈 (Placeholder)
│       ├── meetings.tsx         # 🔄 모임 (Placeholder)
│       ├── questions.tsx        # 🔄 질문 (Placeholder)
│       └── profile.tsx          # 🔄 프로필 (Placeholder)
├── components/
│   ├── common/                  # ✅ 재사용 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Loading.tsx
│   │   └── index.ts
│   └── navigation/              # ✅ 네비게이션 컴포넌트
│       ├── TopNavBar.tsx
│       └── index.ts
├── services/                     # ✅ API 서비스 (이미 구현됨)
│   ├── api.ts
│   ├── auth.ts
│   └── ...
├── store/                        # ✅ Zustand 스토어 (이미 구현됨)
│   ├── authStore.ts
│   ├── appStore.ts
│   └── notificationStore.ts
├── utils/                        # ✅ 유틸리티 함수 (이미 구현됨)
│   ├── validation-utils.ts
│   ├── date-utils.ts
│   └── ...
└── constants/                    # ✅ 상수 및 테마 (이미 구현됨)
    └── theme/
```

---

## 🎨 디자인 시스템

### 테마 (`/constants/theme/index.ts`)
```typescript
export const theme = {
  colors: {
    primary: '#007AFF',      // iOS 블루
    secondary: '#5856D6',    // 보라
    success: '#34C759',      // 초록
    warning: '#FF9500',      // 주황
    error: '#FF3B30',        // 빨강
    text: '#1C1C1E',
    textSecondary: '#6B7280',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
};
```

### 다크모드
모든 컴포넌트는 `useAppStore().theme`를 사용하여 다크모드를 지원합니다.

```typescript
const { theme } = useAppStore();
const isDark = theme === 'dark';

<View style={[styles.container, isDark && styles.containerDark]} />
```

---

## 🔄 자동 인증 플로우

### Root Layout (`app/_layout.tsx`)
```typescript
useEffect(() => {
  if (isLoading) return;

  const inAuthGroup = segments[0] === '(auth)';

  if (!user && !inAuthGroup) {
    // 로그인 안 됨 → 로그인 화면
    router.replace('/(auth)/login');
  } else if (user && inAuthGroup) {
    // 로그인 됨 → 홈 화면
    router.replace('/(tabs)/home');
  }
}, [user, segments, isLoading]);
```

**동작 방식:**
1. 앱 시작 시 AsyncStorage에서 사용자 정보 복원
2. 사용자 없음 → 로그인 화면
3. 사용자 있음 → 홈 화면
4. 로그아웃 시 → 자동으로 로그인 화면으로 이동

---

## 📦 설치된 패키지

```json
{
  "dependencies": {
    "expo-router": "^3.x",
    "react-native-safe-area-context": "^4.x",
    "expo-linear-gradient": "^13.x",
    "@expo/vector-icons": "^14.x"
  }
}
```

---

## 🚀 다음 단계 (Phase 2)

### 우선순위 높음
1. **SignupScreen 구현**
   - 회원가입 폼
   - 초대 코드 입력
   - 실시간 유효성 검사
   - API 연동

2. **HomeScreen 구현**
   - 오늘의 질문 배너 컴포넌트
   - 다가오는 모임 캐러셀
   - 최근 활동 피드
   - API 연동

3. **MeetingsScreen 구현**
   - 탭 네비게이션 (자율/정기)
   - 모임 카드 컴포넌트
   - FlatList 구현
   - API 연동

### 우선순위 중간
4. **MeetingDetailScreen**
   - 모임 상세 정보
   - 실시간 채팅
   - 참여/나가기 기능

5. **QuestionsScreen & QuestionDetailScreen**
   - 질문 리스트
   - 답변 작성 폼
   - 이미지 업로드

6. **ProfileScreen 완성**
   - 프로필 편집
   - 활동 통계
   - 설정 화면

---

## 🧪 테스트 방법

### 1. 개발 서버 시작
```bash
npm run start
```

### 2. 앱 실행
- iOS: `i` 키 누르기
- Android: `a` 키 누르기
- Web: `w` 키 누르기

### 3. 테스트 시나리오

#### 로그인 플로우
1. 앱 시작 → 로그인 화면 표시
2. 이메일/비밀번호 입력
3. 유효성 검사 확인 (잘못된 이메일, 약한 비밀번호)
4. 로그인 버튼 클릭
5. 로딩 스피너 표시
6. 성공 시 → 홈 화면으로 이동
7. 실패 시 → Alert 표시

#### 네비게이션
1. 하단 탭 클릭 (홈, 모임, 질문, 프로필)
2. 각 화면 전환 확인
3. 뒤로가기 동작 확인

#### 로그아웃
1. 프로필 탭 → 로그아웃 버튼
2. 자동으로 로그인 화면으로 이동 확인

---

## 🐛 알려진 이슈

1. ❌ **소셜 로그인 미구현**
   - Kakao, Naver 로그인은 Alert만 표시
   - Google 로그인은 API 연결됨 (OAuth 설정 필요)

2. ❌ **이미지 최적화 필요**
   - Avatar 컴포넌트 이미지 캐싱
   - 로고 이미지 파일 추가 필요

3. ❌ **에러 핸들링 개선 필요**
   - 네트워크 오류 처리
   - 토큰 만료 처리

---

## 📚 참고 문서

- [Expo Router 공식 문서](https://docs.expo.dev/router/introduction/)
- [React Navigation 공식 문서](https://reactnavigation.org/)
- [DESIGN_INTEGRATION_MAP.md](./DESIGN_INTEGRATION_MAP.md)
- [SHARED_LOGIC_GUIDE.md](./SHARED_LOGIC_GUIDE.md)

---

*Phase 1 완료일: 2025-11-09*
