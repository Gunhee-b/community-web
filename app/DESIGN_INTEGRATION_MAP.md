# Design Integration Map

Figma 디자인과 현재 구현된 기능을 연결하는 통합 가이드입니다.

---

## 📁 디렉토리 구조 분석

### Figma Design Structure
```
/app/Figma_design/
├── src/
│   ├── App.tsx                      # 메인 앱 컴포넌트 (라우팅)
│   ├── components/
│   │   ├── screens/                 # 13개 화면 컴포넌트
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   ├── ResetPasswordScreen.tsx
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── MeetingsScreen.tsx
│   │   │   ├── MeetingDetailScreen.tsx
│   │   │   ├── QuestionsScreen.tsx
│   │   │   ├── QuestionDetailScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── NotificationsScreen.tsx
│   │   │   ├── SettingsScreen.tsx
│   │   │   ├── AdminDashboardScreen.tsx
│   │   │   └── VotingScreen.tsx
│   │   ├── ui/                      # 50+ Shadcn/ui 컴포넌트
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── BottomNav.tsx           # 하단 탭 네비게이션
│   │   ├── TopNavBar.tsx           # 상단 네비게이션 바
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   └── DemoControls.tsx        # 테마/어드민 토글
│   └── styles/
│       └── globals.css             # Tailwind CSS
```

### React Native App Structure (현재 구현)
```
/app/
├── services/                        # ✅ API & 비즈니스 로직
│   ├── api.ts                       # Axios 클라이언트
│   ├── auth.ts                      # 인증 서비스
│   ├── supabase.ts                  # Supabase 클라이언트
│   └── api/                         # API 모듈
│       ├── auth.ts                  # 인증 API (10 functions)
│       ├── meetings.ts              # 모임 API (8 functions)
│       ├── questions.ts             # 질문 API (10 functions)
│       └── chat.ts                  # 채팅 API (9 functions)
├── store/                           # ✅ 전역 상태 관리
│   ├── authStore.ts                 # 인증 상태
│   ├── appStore.ts                  # 앱 설정
│   └── notificationStore.ts         # 알림 관리
├── utils/                           # ✅ 유틸리티 함수
│   ├── date-utils.ts
│   ├── validation-utils.ts
│   ├── format.ts
│   ├── transform.ts
│   ├── platform.ts
│   └── storage-native.ts
├── types/                           # ✅ TypeScript 타입
│   └── index.ts
├── constants/                       # ✅ 상수 및 테마
│   ├── app.ts
│   └── theme/
│       └── index.ts
└── components/                      # ❌ 아직 없음 (Figma에서 가져와야 함)
    └── screens/                     # ❌ 화면 컴포넌트 필요
```

---

## 🎨 화면별 기능 매핑

### 1. Authentication Screens

#### **LoginScreen.tsx** → `/services/api/auth.ts`
**Figma 디자인:**
- Email/Password 입력 필드
- 로그인 버튼
- 소셜 로그인 버튼 (Google, Kakao, Naver)
- 회원가입 링크
- 비밀번호 재설정 링크

**연결할 기능:**
```typescript
// /services/api/auth.ts
✅ loginWithEmail(credentials: LoginCredentials)
✅ signInWithGoogle()
✅ signInWithKakao()
✅ signInWithNaver()

// /store/authStore.ts
✅ useAuthStore().login(user, token, authType)

// /utils/validation-utils.ts
✅ validateEmail(email)
✅ validatePassword(password)
```

**필요한 작업:**
- [ ] Figma의 LoginScreen을 React Native로 변환
- [ ] Input 컴포넌트를 React Native TextInput으로 교체
- [ ] Button을 Touchable 컴포넌트로 교체
- [ ] 소셜 로그인 버튼에 실제 API 연결

---

#### **SignupScreen.tsx** → `/services/api/auth.ts`
**Figma 디자인:**
- Username, Email, Password, Invite Code 입력
- 회원가입 버튼
- 소셜 회원가입 옵션

**연결할 기능:**
```typescript
// /services/api/auth.ts
✅ signupWithEmail(data: SignupData)
✅ signInWithGoogle() // 소셜 회원가입도 동일 함수 사용

// /utils/validation-utils.ts
✅ validateUsername(username)
✅ validateEmail(email)
✅ validatePassword(password)
✅ getPasswordStrength(password)
```

**필요한 작업:**
- [ ] SignupScreen을 React Native로 변환
- [ ] 초대 코드 검증 로직 추가
- [ ] 실시간 비밀번호 강도 표시
- [ ] 유효성 검사 에러 메시지 표시

---

#### **ResetPasswordScreen.tsx** → `/services/auth.ts`
**Figma 디자인:**
- Email 입력 필드
- 재설정 링크 전송 버튼

**연결할 기능:**
```typescript
// /services/auth.ts
✅ AuthService.resetPassword(email: string)
```

**필요한 작업:**
- [ ] ResetPasswordScreen을 React Native로 변환
- [ ] 이메일 전송 성공/실패 피드백 UI

---

### 2. Main Screens

#### **HomeScreen.tsx** → 여러 API 통합
**Figma 디자인:**
- 상단 네비게이션 바 (알림 벨)
- 오늘의 질문 배너
- 다가오는 모임 캐러셀
- 최근 활동 피드
- 하단 탭 네비게이션

**연결할 기능:**
```typescript
// /services/api/questions.ts
✅ fetchTodayQuestion()

// /services/api/meetings.ts
✅ fetchMeetings({ type: 'casual', limit: 5 })

// /store/notificationStore.ts
✅ useNotificationStore().unreadCount

// /utils/date-utils.ts
✅ formatDate(date, DATE_FORMATS.DATE_ONLY)
✅ getDday(date)
```

**화면 구성:**
```typescript
HomeScreen 구조:
├── TopNavBar (알림 개수 표시)
├── TodayQuestionBanner (클릭 → QuestionDetailScreen)
├── UpcomingMeetingsCarousel (클릭 → MeetingDetailScreen)
├── RecentActivityFeed
└── BottomNav (홈/모임/질문/프로필)
```

**필요한 작업:**
- [ ] HomeScreen을 React Native로 변환
- [ ] ScrollView로 전체 감싸기
- [ ] 캐러셀은 react-native-reanimated-carousel 사용
- [ ] 실시간 알림 개수 업데이트
- [ ] Pull-to-refresh 추가

---

#### **MeetingsScreen.tsx** → `/services/api/meetings.ts`
**Figma 디자인:**
- 탭 (자율 모임 / 정기 모임)
- 모임 카드 리스트
  - 이미지, 제목, 설명
  - 날짜, 시간, 장소
  - 호스트 정보
  - 참여자 수
  - 카카오톡 오픈채팅 링크
  - 참여/마감 버튼
- FAB (Create Meeting)

**연결할 기능:**
```typescript
// /services/api/meetings.ts
✅ fetchMeetings({ type: 'casual' | 'regular' })
✅ joinMeeting(meetingId)
✅ createMeeting(data)

// /utils/date-utils.ts
✅ formatDate(date, DATE_FORMATS.DATE_ONLY)
✅ getDday(date)

// /utils/format.ts
✅ truncateText(description, 100)
```

**화면 구성:**
```typescript
MeetingsScreen 구조:
├── TopNavBar
├── Tabs (Casual / Regular)
├── MeetingCardList
│   └── MeetingCard (각 모임)
│       ├── Image
│       ├── Title, Description
│       ├── Date, Time, Location
│       ├── Host Info
│       ├── Participants (8/12명)
│       ├── KakaoChat Button
│       └── Join/Full Button
└── FloatingActionButton (+ 모임 만들기)
```

**필요한 작업:**
- [ ] Tabs를 react-native-tab-view로 변환
- [ ] FlatList로 모임 리스트 구현
- [ ] 이미지 로딩은 React Native Image + fallback
- [ ] FAB는 Animated.View로 구현
- [ ] 카카오톡 링크 연결 (Linking.openURL)

---

#### **MeetingDetailScreen.tsx** → `/services/api/meetings.ts` + `/services/api/chat.ts`
**Figma 디자인:**
- 모임 이미지
- 제목, 설명
- 상세 정보 카드 (날짜, 장소, 참여자)
- 호스트 정보 섹션
- 참여자 리스트
- 실시간 채팅 섹션
  - 메시지 리스트
  - 이미지 업로드
  - 메시지 입력창
- 참여/나가기 버튼
- 카카오톡 오픈채팅 링크

**연결할 기능:**
```typescript
// /services/api/meetings.ts
✅ fetchMeetingById(id)
✅ joinMeeting(id)
✅ leaveMeeting(id)
✅ confirmMeeting(id) // 호스트 전용

// /services/api/chat.ts
✅ fetchMeetingChats(meetingId)
✅ sendChatMessage(meetingId, message)
✅ subscribeToChatMessages(meetingId, callback)
✅ uploadChatImage(file)

// /utils/date-utils.ts
✅ smartFormatDate(timestamp) // "오늘 14:30"
```

**화면 구성:**
```typescript
MeetingDetailScreen 구조:
├── TopNavBar (뒤로가기)
├── ScrollView
│   ├── MeetingImage
│   ├── TitleAndDescription
│   ├── DetailsCard (Calendar, Location, Participants)
│   ├── HostInfoCard
│   ├── ParticipantsList
│   └── ChatSection
│       ├── MessageList (FlatList)
│       │   └── MessageBubble (본인/타인 구분)
│       └── MessageInput
│           ├── ImageUploadButton
│           ├── TextInput
│           └── SendButton
└── ActionButtons (참여/나가기/카카오톡)
```

**필요한 작업:**
- [ ] ScrollView + KeyboardAvoidingView 구현
- [ ] FlatList로 채팅 메시지 구현
- [ ] 실시간 채팅 구독 (Supabase Realtime)
- [ ] 이미지 업로드는 expo-image-picker 사용
- [ ] 메시지 전송 시 자동 스크롤

---

#### **QuestionsScreen.tsx** → `/services/api/questions.ts`
**Figma 디자인:**
- 오늘의 질문 배너 (강조)
- 이전 질문 리스트
  - 날짜
  - 질문 내용
  - 답변 개수

**연결할 기능:**
```typescript
// /services/api/questions.ts
✅ fetchTodayQuestion()
✅ fetchQuestions({ limit: 20 })

// /utils/date-utils.ts
✅ formatDate(date, 'M월 d일')
✅ isToday(date)
```

**화면 구성:**
```typescript
QuestionsScreen 구조:
├── TopNavBar
├── TodayQuestionBanner (그라디언트 배경)
└── PreviousQuestionsList (FlatList)
    └── QuestionCard
        ├── Date Badge
        ├── Question Text
        └── Answer Count
```

**필요한 작업:**
- [ ] FlatList로 질문 리스트 구현
- [ ] 오늘의 질문 필터링 및 상단 고정
- [ ] Pull-to-refresh 추가

---

#### **QuestionDetailScreen.tsx** → `/services/api/questions.ts`
**Figma 디자인:**
- 질문 내용
- 답변 작성 폼 (텍스트 + 이미지 2장)
- 답변 리스트
  - 사용자 아바타
  - 답변 텍스트
  - 이미지 (있는 경우)
  - 작성 시간

**연결할 기능:**
```typescript
// /services/api/questions.ts
✅ fetchQuestionById(id)
✅ fetchAnswersByQuestion(questionId)
✅ submitAnswer(questionId, { text, images })
✅ updateAnswer(answerId, data)
✅ deleteAnswer(answerId)

// /utils/date-utils.ts
✅ getTimeAgo(timestamp) // "30분 전"
```

**화면 구성:**
```typescript
QuestionDetailScreen 구조:
├── TopNavBar (뒤로가기)
├── ScrollView
│   ├── QuestionHeader
│   │   ├── Date Badge
│   │   └── Question Text
│   ├── AnswerForm
│   │   ├── TextArea
│   │   ├── ImageUploadButtons (최대 2장)
│   │   └── SubmitButton
│   └── AnswersList (FlatList)
│       └── AnswerCard
│           ├── UserAvatar
│           ├── Username
│           ├── AnswerText
│           ├── Images (1-2장)
│           └── Timestamp
└── FloatingActionButton (답변 작성)
```

**필요한 작업:**
- [ ] TextInput multiline으로 답변 입력
- [ ] expo-image-picker로 이미지 업로드 (최대 2장)
- [ ] 이미지 미리보기 및 삭제 기능
- [ ] 답변 수정/삭제 기능 (본인 답변만)

---

#### **ProfileScreen.tsx** → `/store/authStore.ts`
**Figma 디자인:**
- 프로필 헤더
  - 아바타
  - 이름, 이메일
  - 역할 배지 (Admin/Host/Member)
  - 가입 날짜
  - 프로필 수정 버튼
- 활동 통계
  - 참여한 모임
  - 답변한 질문
  - 투표 참여
- 어드민 대시보드 버튼 (어드민만)
- 설정 버튼
- 로그아웃 버튼

**연결할 기능:**
```typescript
// /store/authStore.ts
✅ useAuthStore().user
✅ useAuthStore().logout()
✅ useAuthStore().isAdmin()
✅ useAuthStore().updateUser(data)

// /services/api/auth.ts
✅ updateUsername(newUsername)
```

**화면 구성:**
```typescript
ProfileScreen 구조:
├── TopNavBar (설정 아이콘)
├── ScrollView
│   ├── ProfileHeader
│   │   ├── Avatar
│   │   ├── Username, Email
│   │   ├── Role Badge
│   │   └── Edit Button
│   ├── StatsCard
│   │   ├── Meetings Joined
│   │   ├── Questions Answered
│   │   └── Votes Participated
│   ├── AdminDashboardButton (조건부)
│   └── LogoutButton
```

**필요한 작업:**
- [ ] 사용자 정보를 authStore에서 가져오기
- [ ] 프로필 수정 모달 구현
- [ ] 통계 데이터는 별도 API 필요 (현재 미구현)
- [ ] 로그아웃 시 스토어 초기화

---

#### **NotificationsScreen.tsx** → `/store/notificationStore.ts`
**Figma 디자인:**
- 알림 리스트
  - 타입별 아이콘 (모임/질문/투표/채팅)
  - 제목 및 메시지
  - 시간
  - 읽음/안읽음 상태
- 모두 읽음 처리 버튼

**연결할 기능:**
```typescript
// /store/notificationStore.ts
✅ useNotificationStore().getAllNotifications()
✅ useNotificationStore().markAsRead(id)
✅ useNotificationStore().markAllAsRead()
✅ useNotificationStore().deleteNotification(id)
✅ useNotificationStore().subscribeToNotifications(userId)

// /utils/date-utils.ts
✅ getTimeAgo(timestamp)
```

**화면 구성:**
```typescript
NotificationsScreen 구조:
├── TopNavBar (뒤로가기, "모두 읽음" 버튼)
└── NotificationList (FlatList)
    └── NotificationCard
        ├── TypeIcon (모임/질문/투표/채팅)
        ├── Title
        ├── Message
        ├── Timestamp
        └── UnreadIndicator (점)
```

**필요한 작업:**
- [ ] FlatList로 알림 리스트 구현
- [ ] 알림 타입에 따른 아이콘 매핑
- [ ] 스와이프로 삭제 기능 추가
- [ ] 알림 클릭 시 해당 화면으로 네비게이션

---

#### **SettingsScreen.tsx** → `/store/appStore.ts`
**Figma 디자인:**
- 테마 설정 (Light/Dark/System)
- 언어 설정 (한국어/English)
- 폰트 크기 조정
- 알림 설정
- 소리 설정

**연결할 기능:**
```typescript
// /store/appStore.ts
✅ useAppStore().theme
✅ useAppStore().setTheme(theme)
✅ useAppStore().language
✅ useAppStore().setLanguage(lang)
✅ useAppStore().fontSize
✅ useAppStore().setFontSize(size)
✅ useAppStore().notificationsEnabled
✅ useAppStore().toggleNotifications()
```

**화면 구성:**
```typescript
SettingsScreen 구조:
├── TopNavBar (뒤로가기)
└── ScrollView
    ├── ThemeSection (Light/Dark/System)
    ├── LanguageSection (Korean/English)
    ├── FontSizeSlider
    ├── NotificationToggle
    └── SoundToggle
```

**필요한 작업:**
- [ ] Switch 컴포넌트로 토글 구현
- [ ] Slider로 폰트 크기 조정
- [ ] 테마 변경 시 즉시 반영
- [ ] AsyncStorage에 설정 저장 (이미 구현됨)

---

#### **AdminDashboardScreen.tsx** → 새로운 API 필요
**Figma 디자인:**
- 통계 카드
  - 총 사용자 수
  - 진행 중인 모임
  - 오늘의 질문 답변
  - 진행 중인 투표
- 관리 메뉴
  - 사용자 관리
  - 모임 관리
  - 질문 관리
  - 투표 관리
  - 초대 코드 생성

**연결할 기능:**
```typescript
// 새로 만들어야 할 API
❌ fetchAdminStats()
❌ fetchAllUsers()
❌ updateUserRole(userId, role)
❌ deleteUser(userId)
❌ generateInviteCode()
```

**필요한 작업:**
- [ ] Admin 전용 API 엔드포인트 생성
- [ ] 권한 체크 미들웨어
- [ ] 통계 데이터 가져오기
- [ ] 사용자/모임/질문 관리 UI

---

#### **VotingScreen.tsx** → 새로운 API 필요
**Figma 디자인:**
- 투표 기간 표시
- 투표 카테고리 (이달의 베스트 포스트)
- 후보 카드 리스트
  - 포스트 내용
  - 작성자
  - 투표 버튼
- 투표 결과 화면

**연결할 기능:**
```typescript
// 기존 API (웹에서 마이그레이션 필요)
❌ fetchCurrentVotingPeriod()
❌ fetchNominatedPosts(periodId)
❌ submitVote(periodId, postId)
❌ fetchVotingResults(periodId)
```

**필요한 작업:**
- [ ] 투표 API를 /services/api/voting.ts로 생성
- [ ] 투표 기간 확인 로직
- [ ] 투표 카드 UI 구현
- [ ] 투표 결과 차트 (recharts → react-native-chart-kit)

---

## 🧩 UI 컴포넌트 매핑

### Figma의 shadcn/ui → React Native 변환

| Figma 컴포넌트 | React Native 대체 | 라이브러리 |
|---------------|------------------|-----------|
| `<Button>` | `<TouchableOpacity>` | React Native Core |
| `<Input>` | `<TextInput>` | React Native Core |
| `<Card>` | `<View>` + Shadow | React Native Core |
| `<Avatar>` | `<Image>` / `<View>` | React Native Core |
| `<Badge>` | `<View>` + Text | React Native Core |
| `<Tabs>` | `<TabView>` | react-native-tab-view |
| `<Dialog>` | `<Modal>` | React Native Core |
| `<Sheet>` | `<BottomSheet>` | @gorhom/bottom-sheet |
| `<Switch>` | `<Switch>` | React Native Core |
| `<Slider>` | `<Slider>` | @react-native-community/slider |
| `<Carousel>` | `<Carousel>` | react-native-reanimated-carousel |
| `<ScrollArea>` | `<ScrollView>` | React Native Core |

---

## 🎯 통합 작업 단계

### Phase 1: 기본 화면 구조 (1주)
- [ ] React Native Navigation 설정 (Expo Router)
- [ ] BottomNav 구현 (Home, Meetings, Questions, Profile)
- [ ] TopNavBar 재사용 컴포넌트
- [ ] 기본 테마 적용 (Light/Dark)

### Phase 2: 인증 플로우 (3일)
- [ ] LoginScreen 변환 및 API 연결
- [ ] SignupScreen 변환 및 API 연결
- [ ] ResetPasswordScreen 변환
- [ ] AuthStore와 연결

### Phase 3: 메인 화면 (1주)
- [ ] HomeScreen 구현
  - [ ] 오늘의 질문 배너
  - [ ] 다가오는 모임 캐러셀
  - [ ] 최근 활동 피드
- [ ] MeetingsScreen 구현
  - [ ] 탭 네비게이션 (Casual/Regular)
  - [ ] 모임 카드 리스트
  - [ ] FAB (모임 만들기)
- [ ] QuestionsScreen 구현
  - [ ] 오늘의 질문 강조
  - [ ] 이전 질문 리스트

### Phase 4: 상세 화면 (1주)
- [ ] MeetingDetailScreen 구현
  - [ ] 모임 정보 표시
  - [ ] 실시간 채팅 구현
  - [ ] 참여/나가기 기능
- [ ] QuestionDetailScreen 구현
  - [ ] 답변 작성 폼
  - [ ] 이미지 업로드 (최대 2장)
  - [ ] 답변 리스트

### Phase 5: 프로필 & 설정 (3일)
- [ ] ProfileScreen 구현
  - [ ] 사용자 정보 표시
  - [ ] 활동 통계
  - [ ] 어드민 대시보드 연결
- [ ] SettingsScreen 구현
  - [ ] 테마 설정
  - [ ] 언어 설정
  - [ ] 폰트 크기 조정
- [ ] NotificationsScreen 구현
  - [ ] 알림 리스트
  - [ ] 실시간 구독

### Phase 6: 고급 기능 (1주)
- [ ] VotingScreen 구현
- [ ] AdminDashboardScreen 구현
- [ ] 이미지 업로드 최적화
- [ ] 푸시 알림 설정

### Phase 7: 테스트 & 최적화 (3일)
- [ ] 전체 플로우 테스트
- [ ] 성능 최적화
- [ ] 오프라인 모드 지원
- [ ] 에러 핸들링 개선

---

## 📊 기능 구현 상태

### ✅ 완료된 기능 (Backend/Logic)
| 기능 | API | Store | Utils |
|-----|-----|-------|-------|
| 인증 (로그인/회원가입) | ✅ | ✅ | ✅ |
| 소셜 로그인 | ✅ | ✅ | ✅ |
| 모임 조회/생성/참여 | ✅ | ❌ | ✅ |
| 질문 조회/답변 제출 | ✅ | ❌ | ✅ |
| 실시간 채팅 | ✅ | ❌ | ✅ |
| 알림 시스템 | ✅ | ✅ | ✅ |
| 사용자 프로필 | ✅ | ✅ | ✅ |
| 앱 설정 | ❌ | ✅ | ✅ |

### ❌ 구현 필요 (Frontend/UI)
| 화면 | 우선순위 | 예상 시간 |
|-----|---------|---------|
| LoginScreen | 🔴 High | 4시간 |
| SignupScreen | 🔴 High | 4시간 |
| HomeScreen | 🔴 High | 8시간 |
| MeetingsScreen | 🔴 High | 8시간 |
| MeetingDetailScreen | 🔴 High | 12시간 |
| QuestionsScreen | 🟡 Medium | 6시간 |
| QuestionDetailScreen | 🟡 Medium | 8시간 |
| ProfileScreen | 🟡 Medium | 6시간 |
| NotificationsScreen | 🟡 Medium | 4시간 |
| SettingsScreen | 🟢 Low | 4시간 |
| AdminDashboardScreen | 🟢 Low | 8시간 |
| VotingScreen | 🟢 Low | 8시간 |

---

## 🔧 변환 가이드라인

### 1. HTML → React Native 변환
```typescript
// ❌ Figma (React Web)
<div className="bg-white rounded-xl p-4 shadow">
  <h2 className="text-lg mb-2">Title</h2>
  <p className="text-gray-600">Description</p>
  <button onClick={handleClick}>Click</button>
</div>

// ✅ React Native
<View style={styles.card}>
  <Text style={styles.title}>Title</Text>
  <Text style={styles.description}>Description</Text>
  <TouchableOpacity onPress={handleClick}>
    <Text style={styles.buttonText}>Click</Text>
  </TouchableOpacity>
</View>

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    color: '#6B7280',
  },
});
```

### 2. 스타일 변환
```typescript
// Tailwind CSS → StyleSheet
const tailwindToRN = {
  'p-4': { padding: 16 },
  'px-4': { paddingHorizontal: 16 },
  'py-4': { paddingVertical: 16 },
  'rounded-xl': { borderRadius: 12 },
  'bg-white': { backgroundColor: 'white' },
  'text-lg': { fontSize: 18 },
  'text-gray-600': { color: '#4B5563' },
  'shadow': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
};
```

### 3. 네비게이션 변환
```typescript
// ❌ Figma (useState routing)
const [currentScreen, setCurrentScreen] = useState('home');
const navigateTo = (screen) => setCurrentScreen(screen);

// ✅ React Native (Expo Router)
import { router } from 'expo-router';

router.push('/meetings/123');
router.back();
```

### 4. 리스트 변환
```typescript
// ❌ Figma (map)
{meetings.map(meeting => (
  <div key={meeting.id}>{meeting.title}</div>
))}

// ✅ React Native (FlatList)
<FlatList
  data={meetings}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => <MeetingCard meeting={item} />}
  contentContainerStyle={styles.list}
/>
```

---

## 💡 권장 사항

### 1. 컴포넌트 재사용
Figma의 컴포넌트를 React Native로 변환할 때 재사용 가능하도록 설계:
```
/app/components/
├── common/              # 공통 컴포넌트
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   └── Loading.tsx
├── navigation/          # 네비게이션 컴포넌트
│   ├── TopNavBar.tsx
│   └── BottomNav.tsx
└── screens/             # 화면별 컴포넌트
    ├── LoginScreen.tsx
    ├── HomeScreen.tsx
    └── ...
```

### 2. 스타일 관리
테마 시스템 활용:
```typescript
// /constants/theme/index.ts에 이미 정의됨
import { theme } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
});
```

### 3. 타입 안전성
모든 컴포넌트에 타입 정의:
```typescript
// 이미 /types/index.ts에 정의됨
import { Meeting, Question, User } from '@/types';

interface MeetingCardProps {
  meeting: Meeting;
  onPress: (id: number) => void;
  theme: 'light' | 'dark';
}
```

---

## 🚀 다음 단계

1. **Figma 디자인 분석 완료** ✅
2. **기능 매핑 완료** ✅
3. **변환 작업 시작** ⏳
   - LoginScreen부터 시작 권장
   - 공통 컴포넌트 먼저 구현
   - 화면별로 점진적 변환

---

*Last Updated: 2025-11-09*
