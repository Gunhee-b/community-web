# Shared Logic Layer Guide

웹과 앱에서 공유하는 공통 로직 레이어 사용 가이드입니다.

---

## 📁 구조 Overview

```
/app
├── services/          # API 및 비즈니스 로직
│   ├── api.ts        # Axios API 클라이언트
│   ├── auth.ts       # 인증 서비스
│   ├── supabase.ts   # Supabase 클라이언트
│   └── api/          # API 엔드포인트별 모듈
│       ├── auth.ts
│       ├── meetings.ts
│       ├── questions.ts
│       └── chat.ts
├── store/            # 전역 상태 관리 (Zustand)
│   ├── authStore.ts
│   ├── appStore.ts
│   └── notificationStore.ts
└── utils/            # 유틸리티 함수
    ├── storage-native.ts
    ├── date-utils.ts
    ├── validation-utils.ts
    ├── format.ts
    ├── transform.ts
    └── platform.ts
```

---

## 1. API 서비스 (`/services/api.ts`)

### 설정

```typescript
import { API_ENDPOINTS, apiClient, updateApiConfig } from '@/services/api';

// API Base URL 변경
updateApiConfig({
  baseURL: 'https://new-api.example.com',
  timeout: 60000,
});
```

### HTTP 요청

```typescript
import { get, post, put, del } from '@/services/api';

// GET 요청
const { data, error } = await get<Meeting[]>('/meetings');

// POST 요청
const result = await post('/meetings', {
  title: 'New Meeting',
  date: '2025-11-10',
});

// PUT 요청
await put('/meetings/123', { title: 'Updated Title' });

// DELETE 요청
await del('/meetings/123');
```

### 파일 업로드

```typescript
import { uploadFile } from '@/services/api';

const formData = new FormData();
formData.append('file', file);

const result = await uploadFile('/upload', formData, (progress) => {
  console.log(`Upload progress: ${progress}%`);
});
```

### 에러 처리

```typescript
import { handleApiError } from '@/services/api';

try {
  const response = await get('/data');
} catch (error) {
  const apiError = handleApiError(error);
  console.error(apiError.message);
  // UI에 에러 표시
}
```

---

## 2. 인증 서비스 (`/services/auth.ts`)

### 로그인/로그아웃

```typescript
import { AuthService } from '@/services/auth';

// 로그인
const result = await AuthService.login({
  email: 'user@example.com',
  password: 'password123',
});

if (result.success) {
  console.log('Logged in:', result.data.user);
}

// 로그아웃
await AuthService.logout();
```

### 회원가입

```typescript
const result = await AuthService.signup({
  username: 'john_doe',
  email: 'john@example.com',
  password: 'securePassword123',
  inviteCode: 'INVITE123',
});
```

### 현재 사용자 정보

```typescript
// 로컬에서 가져오기 (빠름)
const user = await AuthService.getCurrentUser();

// 서버에서 최신 정보 가져오기
const freshUser = await AuthService.fetchCurrentUser();
```

### 토큰 관리

```typescript
// 액세스 토큰 가져오기
const token = await AuthService.getAccessToken();

// 토큰 갱신
const newTokens = await AuthService.refreshTokens();

// 인증 상태 확인
const isAuth = await AuthService.isAuthenticated();
```

---

## 3. Zustand 스토어

### Auth Store

```typescript
import { useAuthStore } from '@/store';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuthStore();

  // 로그인
  const handleLogin = async () => {
    const result = await AuthService.login(credentials);
    if (result.success && result.data) {
      login(result.data.user, result.data.access_token, 'local');
    }
  };

  // 인증 상태 확인
  if (!isAuthenticated()) {
    return <LoginScreen />;
  }

  return <Text>Welcome, {user?.username}!</Text>;
}
```

### App Store

```typescript
import { useAppStore } from '@/store';

function SettingsScreen() {
  const { theme, setTheme, language, setLanguage } = useAppStore();

  return (
    <View>
      <Button onPress={() => setTheme('dark')}>Dark Mode</Button>
      <Button onPress={() => setLanguage('en')}>English</Button>
    </View>
  );
}
```

### Notification Store

```typescript
import { useNotificationStore } from '@/store';

function NotificationBell() {
  const { unreadCount, getAllNotifications, markAsRead } = useNotificationStore();

  const notifications = getAllNotifications();

  return (
    <View>
      <Badge count={unreadCount} />
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => markAsRead(item.id)}
          />
        )}
      />
    </View>
  );
}
```

---

## 4. 유틸리티 함수

### 날짜 포맷팅 (`/utils/date-utils.ts`)

```typescript
import {
  formatDate,
  getTimeAgo,
  getDday,
  smartFormatDate,
  DATE_FORMATS,
} from '@/utils/date-utils';

// 날짜 포맷팅
formatDate(new Date()); // "2025년 11월 08일"
formatDate('2025-11-08T10:30:00', DATE_FORMATS.FULL); // "2025년 11월 08일 10:30"

// 상대 시간
getTimeAgo('2025-11-08T10:00:00'); // "30분 전"

// D-Day
getDday('2025-11-10'); // "D-2"

// 스마트 포맷 (상황에 따라 자동 선택)
smartFormatDate('2025-11-08T10:30:00'); // "오늘 10:30"
smartFormatDate('2025-11-07T10:30:00'); // "어제 10:30"
smartFormatDate('2025-01-01T10:30:00'); // "2025.01.01"
```

### 유효성 검사 (`/utils/validation-utils.ts`)

```typescript
import {
  isValidEmail,
  isValidPassword,
  validateEmail,
  validatePassword,
  getPasswordStrength,
} from '@/utils/validation-utils';

// 이메일 검증
isValidEmail('test@example.com'); // true

// 비밀번호 검증
isValidPassword('Password123!'); // true
getPasswordStrength('Password123!'); // 'medium'

// 폼 검증 (에러 메시지 포함)
const emailResult = validateEmail('invalid');
// { valid: false, error: '올바른 이메일 형식이 아닙니다' }

const passwordResult = validatePassword('weak');
// { valid: false, error: '비밀번호는 8자 이상이며...' }
```

### 데이터 포맷팅 (`/utils/format.ts`)

```typescript
import {
  formatCurrency,
  formatFileSize,
  formatPhoneNumber,
  truncateText,
  maskEmail,
} from '@/utils/format';

// 통화 포맷
formatCurrency(1000000); // "1,000,000원"

// 파일 크기
formatFileSize(1048576); // "1 MB"

// 전화번호
formatPhoneNumber('01012345678'); // "010-1234-5678"

// 텍스트 자르기
truncateText('This is a very long text', 10); // "This is a..."

// 개인정보 마스킹
maskEmail('user@example.com'); // "u***@example.com"
```

### 데이터 변환 (`/utils/transform.ts`)

```typescript
import {
  groupBy,
  sortBy,
  removeDuplicates,
  pick,
  omit,
  deepClone,
} from '@/utils/transform';

// 그룹화
const users = [
  { id: 1, role: 'admin' },
  { id: 2, role: 'user' },
  { id: 3, role: 'admin' },
];
groupBy(users, 'role');
// { admin: [...], user: [...] }

// 정렬
sortBy(users, 'id', 'desc');

// 중복 제거
removeDuplicates([1, 2, 2, 3]); // [1, 2, 3]

// 특정 키만 선택
pick({ a: 1, b: 2, c: 3 }, ['a', 'c']); // { a: 1, c: 3 }

// 깊은 복사
const copy = deepClone(original);
```

### 플랫폼 유틸리티 (`/utils/platform.ts`)

```typescript
import {
  isIOS,
  isAndroid,
  isTablet,
  scale,
  platformSelect,
  getDeviceInfo,
} from '@/utils/platform';

// 플랫폼 확인
if (isIOS) {
  // iOS 전용 코드
}

// 태블릿 확인
if (isTablet()) {
  // 태블릿 레이아웃
}

// 화면 크기 조정
const fontSize = scale(16); // 화면 크기에 따라 조정됨

// 플랫폼별 값 선택
const padding = platformSelect({
  ios: 20,
  android: 16,
  default: 16,
});

// 디바이스 정보
const deviceInfo = getDeviceInfo();
console.log(deviceInfo);
// {
//   platform: 'ios',
//   version: '15.0',
//   isTablet: false,
//   screenWidth: 375,
//   ...
// }
```

---

## 5. 사용 예시

### 로그인 플로우

```typescript
import { useState } from 'react';
import { AuthService } from '@/services/auth';
import { useAuthStore } from '@/store';
import { validateEmail, validatePassword } from '@/utils/validation-utils';

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const { login } = useAuthStore();

  const handleLogin = async () => {
    // 유효성 검사
    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);

    if (!emailValid.valid || !passwordValid.valid) {
      setErrors({
        email: emailValid.error,
        password: passwordValid.error,
      });
      return;
    }

    // 로그인 API 호출
    const result = await AuthService.login({ email, password });

    if (result.success && result.data) {
      // Store에 저장
      login(result.data.user, result.data.access_token, 'local');
      // 홈 화면으로 이동
      router.push('/');
    } else {
      setErrors({ general: result.error });
    }
  };

  return <LoginForm onSubmit={handleLogin} errors={errors} />;
}
```

### 데이터 페칭 with TanStack Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchMeetings } from '@/services/api/meetings';
import { formatDate } from '@/utils/date-utils';

function MeetingsScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['meetings', 'casual'],
    queryFn: () => fetchMeetings({ type: 'casual' }),
  });

  if (isLoading) return <Loading />;
  if (error) return <Error message="Failed to load meetings" />;

  return (
    <FlatList
      data={data.data}
      renderItem={({ item }) => (
        <MeetingCard
          title={item.title}
          date={formatDate(item.start_datetime)}
        />
      )}
    />
  );
}
```

### 알림 구독

```typescript
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

function App() {
  const { user } = useAuthStore();
  const { subscribeToNotifications, loadDbNotifications } = useNotificationStore();

  useEffect(() => {
    if (!user) return;

    // DB에서 알림 로드
    loadDbNotifications(user.id);

    // 실시간 구독
    const unsubscribe = subscribeToNotifications(user.id);

    return () => {
      unsubscribe();
    };
  }, [user]);

  return <MainApp />;
}
```

---

## 6. 모범 사례

### ✅ Do

```typescript
// 타입 안전성 보장
import { Meeting } from '@/types';
const meetings = await get<Meeting[]>('/meetings');

// 에러 처리
const result = await AuthService.login(credentials);
if (!result.success) {
  showError(result.error);
  return;
}

// 유틸리티 함수 사용
const formattedDate = formatDate(meeting.date);
const isValid = isValidEmail(email);
```

### ❌ Don't

```typescript
// 타입 무시
const data = await get('/meetings'); // any 타입

// 에러 무시
await AuthService.login(credentials); // 결과 확인 안 함

// 하드코딩
const date = new Date(meeting.date).toLocaleDateString(); // formatDate 사용
const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // isValidEmail 사용
```

---

## 7. 디버깅

### API 요청 로깅

개발 모드에서 모든 API 요청과 응답이 자동으로 로그됩니다:

```
🚀 API Request: { method: 'GET', url: '/meetings', data: {...} }
✅ API Response: { url: '/meetings', status: 200, data: {...} }
❌ API Error: { url: '/meetings', status: 500, message: '...' }
```

### Store 상태 확인

```typescript
import { useAuthStore } from '@/store';

// 현재 상태 가져오기
const state = useAuthStore.getState();
console.log('Current auth state:', state);
```

---

## 8. 테스트

### 유닛 테스트 예시

```typescript
import { formatDate, isValidEmail } from '@/utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const result = formatDate('2025-11-08');
    expect(result).toBe('2025년 11월 08일');
  });
});

describe('isValidEmail', () => {
  it('should validate email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid')).toBe(false);
  });
});
```

---

## 9. 마이그레이션 가이드

### 기존 코드에서 변경하기

**Before:**

```typescript
// 직접 axios 사용
const response = await axios.get('/meetings');
const meetings = response.data;

// 직접 localStorage 사용
localStorage.setItem('token', token);

// 하드코딩된 날짜 포맷
const date = new Date(meeting.date).toLocaleDateString('ko-KR');
```

**After:**

```typescript
// 공유 API 서비스 사용
import { get } from '@/services/api';
const { data: meetings } = await get('/meetings');

// 플랫폼 독립적 스토리지 사용
import { secureStorage } from '@/utils/storage-native';
await secureStorage.setItem('token', token);

// 유틸리티 함수 사용
import { formatDate } from '@/utils/date-utils';
const date = formatDate(meeting.date);
```

---

## 10. 추가 리소스

- [Axios 문서](https://axios-http.com/)
- [Zustand 문서](https://github.com/pmndrs/zustand)
- [date-fns 문서](https://date-fns.org/)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

---

*Last Updated: 2025-11-08*
