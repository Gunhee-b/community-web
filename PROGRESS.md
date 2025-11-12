# 📊 INGK Community App - 개발 진행 상황

> 마지막 업데이트: 2025-11-10

## ✅ 완료된 작업

### 1. 프로젝트 분석 및 설계
- [x] Markdown 문서 읽고 프로젝트 구조 파악
- [x] Figma 디자인 분석 (`Figma_design/` 폴더)
- [x] DESIGN_INTEGRATION_MAP.md 검토
- [x] 디자인 시스템 확인 (색상, 폰트, 간격 등)

### 2. UI 화면 구현 (Figma → React Native 변환)

#### 🔐 인증 화면 (Auth Screens)
- [x] **LoginScreen** - `app/(auth)/login.tsx`
  - 이메일/비밀번호 로그인
  - 소셜 로그인 버튼 (Google, Kakao, Naver)
  - 그라디언트 로고
  - 다크모드 지원
  - 🔧 개발자 모드 버튼 추가 (테스트용)

- [x] **SignupScreen** - `app/(auth)/signup.tsx`
  - 사용자 이름, 이메일, 비밀번호 입력
  - 비밀번호 확인
  - 초대 코드 입력
  - 유효성 검사
  - 다크모드 지원

- [x] **ResetPasswordScreen** - `app/(auth)/reset-password.tsx`
  - 이메일 입력
  - 재설정 링크 전송
  - 다크모드 지원

#### 📱 메인 화면 (Tab Screens)
- [x] **HomeScreen** - `app/(tabs)/home.tsx`
  - 오늘의 질문 그라디언트 배너
  - 다가오는 모임 가로 스크롤 캐러셀
  - 월간 투표 배너
  - 최근 활동 피드
  - 알림 아이콘 (뱃지 카운트)
  - 다크모드 지원

- [x] **MeetingsScreen** - `app/(tabs)/meetings.tsx`
  - 탭 네비게이션 (자율 모임 / 정기 모임)
  - 모임 카드 (이미지, 정보, 상태)
  - 호스트 정보 섹션
  - 참여 버튼 + 카카오톡 버튼
  - FAB (Floating Action Button - 모임 만들기)
  - 마감 상태 표시
  - 다크모드 지원

- [x] **QuestionsScreen** - `app/(tabs)/questions.tsx`
  - 오늘의 질문 그라디언트 배너
  - 이전 질문 리스트
  - 답변 개수 표시
  - 날짜 표시
  - 다크모드 지원

- [x] **ProfileScreen** - `app/(tabs)/profile.tsx`
  - 프로필 헤더 (아바타, 이름, 이메일)
  - 역할 배지 (Admin/Member)
  - 활동 통계 (참여한 모임, 답변한 질문, 투표 참여)
  - 관리자 대시보드 버튼 (관리자만 표시)
  - 메뉴 항목 (내 모임, 내 답변, 설정)
  - 로그아웃 버튼
  - 다크모드 지원

#### ⚙️ 추가 화면
- [x] **NotificationsScreen** - `app/notifications.tsx`
  - 알림 목록
  - 읽음/읽지 않음 상태 표시
  - 알림 타입별 아이콘 (모임, 질문, 투표, 채팅)
  - 모두 읽음 처리 버튼
  - 빈 상태 UI
  - 다크모드 지원

- [x] **SettingsScreen** - `app/settings.tsx`
  - 테마 설정 (라이트/다크 토글)
  - 언어 설정 (한국어)
  - 알림 설정 (푸시, 모임, 질문, 채팅, 소리)
  - 정보 섹션 (이용약관, 개인정보처리방침, 버전)
  - 다크모드 지원

### 3. 기술적 개선사항
- [x] **Root Layout 네비게이션 수정** - `app/_layout.tsx`
  - "Attempted to navigate before mounting" 에러 해결
  - segments 초기화 검증 추가
  - setTimeout으로 네비게이션 타이밍 조정

- [x] **개발자 모드 추가** - `app/(auth)/login.tsx`
  - Mock 로그인 함수 추가 (서버 연결 없이 테스트)
  - 주황색 개발자 모드 버튼 추가
  - 테스트 유저 데이터 생성

### 4. 디자인 시스템

#### 색상 팔레트
- Primary: `#007AFF` (iOS Blue)
- Secondary: `#5856D6` (Purple)
- Success: `#34C759` (Green)
- Warning: `#FF9500` (Orange)
- Error: `#FF3B30` (Red)

#### 컴포넌트
- **그라디언트**: `expo-linear-gradient` 사용
- **아이콘**: `@expo/vector-icons` (Ionicons)
- **폰트**: iOS 시스템 폰트 (SF Pro)
- **그림자**: iOS 스타일 shadow 적용

#### 테마
- 라이트 모드: 흰색 배경, 검정 텍스트
- 다크 모드: 검정 배경, 흰색 텍스트
- 모든 화면에서 다크모드 완벽 지원

---

## 🚧 진행 중인 작업

현재 진행 중인 작업 없음. 다음 단계를 시작할 준비가 되었습니다.

---

## 📋 다음 단계 (우선순위 순)

### Phase 1: 상세 화면 구현 (높은 우선순위)
- [ ] **MeetingDetailScreen** - 모임 상세 정보
  - 모임 정보 (제목, 설명, 날짜, 시간, 장소)
  - 참여자 목록
  - 호스트 정보
  - 채팅 버튼 / 카카오톡 링크
  - 참여/취소 버튼
  - 모임 수정/삭제 (호스트만)
  - 예상 위치: `app/meetings/[id].tsx`

- [ ] **QuestionDetailScreen** - 질문 상세 및 답변
  - 질문 내용
  - 답변 작성 폼
  - 답변 목록 (무한 스크롤)
  - 좋아요 기능
  - 답변 수정/삭제 (본인만)
  - 예상 위치: `app/questions/[id].tsx`

### Phase 2: 관리자 기능 (중간 우선순위)
- [ ] **AdminDashboardScreen** - 관리자 대시보드
  - 회원 관리
  - 모임 관리
  - 질문 관리
  - 초대 코드 생성
  - 통계 대시보드
  - 예상 위치: `app/admin/dashboard.tsx`

- [ ] **VotingScreen** - 투표 화면
  - 월간 베스트 투표
  - 투표 항목 리스트
  - 투표 결과 확인
  - 예상 위치: `app/voting.tsx`

### Phase 3: API 연결 및 데이터 통합 (높은 우선순위)
- [ ] **AuthService API 연결**
  - `services/auth.ts`에서 실제 API 호출
  - Supabase Auth 통합 또는 백엔드 API 연결
  - 토큰 관리 (저장, 갱신, 삭제)
  - 소셜 로그인 구현 (Google, Kakao, Naver)

- [ ] **Meetings API 연결**
  - `services/api/meetings.ts` 구현
  - 모임 목록 불러오기 (자율/정기 필터)
  - 모임 생성/수정/삭제
  - 모임 참여/취소

- [ ] **Questions API 연결**
  - `services/api/questions.ts` 구현
  - 오늘의 질문 불러오기
  - 이전 질문 목록
  - 답변 작성/수정/삭제
  - 좋아요 기능

- [ ] **Notifications API 연결**
  - 실시간 알림 수신 (FCM 또는 Supabase Realtime)
  - 알림 목록 불러오기
  - 읽음 처리
  - 알림 설정 저장

### Phase 4: 채팅 기능 (중간 우선순위)
- [ ] **ChatScreen** - 모임 채팅
  - 실시간 채팅 (Supabase Realtime 또는 Socket.io)
  - 메시지 전송/수신
  - 이미지 전송
  - 읽음 표시
  - 예상 위치: `app/chat/[meetingId].tsx`

### Phase 5: 추가 기능 (낮은 우선순위)
- [ ] **이미지 업로드**
  - 프로필 사진 업로드
  - 모임 이미지 업로드
  - Supabase Storage 연동

- [ ] **검색 기능**
  - 모임 검색
  - 사용자 검색
  - 질문 검색

- [ ] **필터 및 정렬**
  - 모임 필터 (날짜, 장소, 카테고리)
  - 정렬 옵션 (최신순, 인기순, 마감임박순)

- [ ] **푸시 알림 설정**
  - Expo Notifications 설정
  - FCM 통합
  - 알림 권한 요청

### Phase 6: 테스트 및 최적화 (배포 전)
- [ ] **에러 처리 개선**
  - 네트워크 에러 처리
  - 오프라인 모드 지원
  - 에러 바운더리 추가

- [ ] **성능 최적화**
  - 이미지 최적화 (lazy loading)
  - 무한 스크롤 최적화
  - 메모이제이션 (React.memo, useMemo)

- [ ] **테스트 작성**
  - Unit 테스트 (Jest)
  - E2E 테스트 (Detox)
  - API 통합 테스트

- [ ] **접근성 개선**
  - 스크린 리더 지원
  - 키보드 네비게이션
  - 고대비 모드

---

### 현재 개발 모드
- **개발자 모드 로그인 활성화**: 서버 연결 없이 UI 테스트 가능
- 로그인 화면에서 "🔧 개발자 모드: 바로 입장하기" 버튼 클릭

---

## 📁 프로젝트 구조

```
app/
├── (auth)/                    # 인증 화면
│   ├── login.tsx             # ✅ 완료
│   ├── signup.tsx            # ✅ 완료
│   └── reset-password.tsx    # ✅ 완료
├── (tabs)/                    # 메인 탭 화면
│   ├── home.tsx              # ✅ 완료
│   ├── meetings.tsx          # ✅ 완료
│   ├── questions.tsx         # ✅ 완료
│   └── profile.tsx           # ✅ 완료
├── notifications.tsx          # ✅ 완료
├── settings.tsx              # ✅ 완료
├── meetings/
│   └── [id].tsx              # ⏳ TODO: 모임 상세
├── questions/
│   └── [id].tsx              # ⏳ TODO: 질문 상세
├── admin/
│   └── dashboard.tsx         # ⏳ TODO: 관리자 대시보드
├── voting.tsx                # ⏳ TODO: 투표 화면
└── _layout.tsx               # ✅ 완료 (네비게이션 수정)

components/
├── common/                    # 공통 컴포넌트
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Loading.tsx
└── navigation/               # 네비게이션 컴포넌트
    └── TopNavBar.tsx

services/
├── api.ts                    # API 클라이언트
├── auth.ts                   # ⏳ TODO: API 연결 필요
├── api/
│   ├── meetings.ts           # ⏳ TODO: API 연결 필요
│   ├── questions.ts          # ⏳ TODO: API 연결 필요
│   └── chat.ts               # ⏳ TODO: 구현 필요
└── supabase.ts              # Supabase 클라이언트

Figma_design/                 # Figma 디자인 참조 (React Web)
└── src/components/screens/   # 원본 디자인 파일들
```

---

## 🎯 즉시 시작 가능한 작업

### 1. UI 테스트하기 (지금 바로!)
```bash
npm start
# 로그인 화면에서 "🔧 개발자 모드: 바로 입장하기" 클릭
# 모든 화면 탐색 및 테스트
```

### 2. 상세 화면 구현하기 (다음 작업)
Figma 디자인 참조:
- `Figma_design/src/components/screens/MeetingDetailScreen.tsx`
- `Figma_design/src/components/screens/QuestionDetailScreen.tsx`

### 3. API 연결하기 (중요)
선택지:
- **옵션 A**: 기존 백엔드 API 연결
- **옵션 B**: Supabase로 백엔드 구축 (권장)
- **옵션 C**: 로컬 개발 서버 구축

---

## 📝 노트

### Mock 데이터 위치
현재 모든 화면에서 Mock 데이터 사용 중:
- `// TODO: Replace with API calls` 주석으로 표시
- `// Mock data` 주석으로 데이터 위치 표시

### 테스트 계정 (개발자 모드)
```javascript
{
  id: 1,
  username: '테스트유저',
  email: 'test@example.com',
  role: 'member'
}
```

### 알려진 이슈
- [ ] 네트워크 에러 시 로그인 실패 → 개발자 모드로 우회 가능
- [ ] 이미지 업로드 기능 미구현
- [ ] 실시간 채팅 미구현
- [ ] 푸시 알림 미구현

---

## 🤝 기여 가이드

### 새로운 화면 추가 시
1. Figma 디자인 확인 (`Figma_design/src/components/screens/`)
2. React Native로 변환 (View, Text, TouchableOpacity 등)
3. 다크모드 지원 추가 (`isDark` 조건부 스타일)
4. Mock 데이터로 테스트
5. `// TODO:` 주석으로 API 연결 필요 표시

### 코드 스타일
- TypeScript 사용
- StyleSheet.create() 사용
- theme 상수 활용 (`@/constants/theme`)
- 컴포넌트 상단에 JSDoc 주석 작성

---

## 📞 문의 및 지원

- 프로젝트 문서: `PROJECT_STRUCTURE.md`
- 디자인 가이드: `DESIGN_INTEGRATION_MAP.md`
- Vercel 배포: `VERCEL_DEPLOYMENT_GUIDE.md`

---

**마지막 업데이트**: 2025-11-10
**다음 작업**: MeetingDetailScreen 또는 API 연결 시작
**현재 상태**: ✅ UI 구현 완료, ⏳ API 연결 대기 중
