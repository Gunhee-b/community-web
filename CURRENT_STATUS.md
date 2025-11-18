# 📊 Rezom Community - 현재 프로젝트 상태

**최종 업데이트**: 2025-11-17
**프로젝트명**: Rezom Community (통찰방)
**전체 진행률**: 92% 완료

---

## 🎯 프로젝트 개요

- **목적**: 250명 규모 커뮤니티를 위한 투표 및 오프라인 모임 관리 플랫폼
- **플랫폼**:
  - 웹 (React + PWA) - 주력 플랫폼
  - 모바일 앱 (React Native + Expo) - 개발 진행 중
- **기술 스택**:
  - Frontend: React 18, Vite, TailwindCSS
  - Backend: Supabase (PostgreSQL, Auth, Storage, Realtime)
  - Deployment: Vercel (웹)
  - Mobile: Expo, React Native

---

## ✅ 완료된 핵심 기능 (웹 플랫폼)

### 1. 투표 시스템 (100% 완료)
- ✅ 투표 기간 생성 및 관리
- ✅ 글 추천 제출 (회원)
- ✅ 추천 투표 (1인 1표, 토글 방식)
- ✅ 자동 우승자 선정
- ✅ 투표 결과 공개

### 2. 오프라인 모임 시스템 (98% 완료)

#### 모임 유형
- ✅ **정기 모임**: 매주 정해진 요일/시간, 템플릿 기반 자동 생성
- ✅ **즉흥 모임**: 취미/토론 등 일회성 모임

#### 핵심 기능
- ✅ 모임 생성 (장소, 시간, 인원, 카카오톡 오픈채팅 링크)
- ✅ 모임 참가/나가기 (로그인 필수)
- ✅ 모임 확정/해제 (모임장)
- ✅ 모임 수정/삭제 (모임장/관리자)
- ✅ 참석 체크 시스템 (모임 종료 후)
- ✅ 이미지 업로드 기능 (**최근 수정: 2025-11-17**)

#### 실시간 채팅 (Kakao 스타일)
- ✅ Supabase Realtime 기반
- ✅ 이미지 전송 지원 (최대 10MB)
- ✅ 타이핑 인디케이터
- ✅ 읽음 표시 (미읽음 수 표시)
- ✅ 날짜 구분선
- ✅ 모임장 표시 (👑)
- ✅ 자동 스크롤

### 3. 오늘의 질문 시스템 (90% 완료)
- ✅ 일일 질문 자동 생성
- ✅ 개인 답변 작성 (비공개)
- ✅ 공개 답변 작성 (텍스트 + 이미지 최대 2장)
- ✅ 댓글 시스템
- ✅ 답변 수정/삭제

### 4. 인증 시스템 (100% 완료)

#### 커스텀 인증
- ✅ 초대 코드 기반 회원가입 (6자리, 7일 유효)
- ✅ 닉네임/비밀번호 로그인
- ✅ 7일 세션 유지
- ✅ 프로필 관리

#### 소셜 로그인 (웹)
- ✅ Google OAuth 연동 완료
- ✅ Kakao OAuth 연동 완료
- ✅ Naver OAuth 연동 완료
- ✅ 리다이렉트 처리 및 세션 동기화

### 5. 회원 관리 시스템 (100% 완료)
- ✅ Soft Delete (복구 가능한 삭제)
- ✅ Hard Delete (영구 삭제) - **최근 추가: 2025-11-17**
- ✅ 회원 복구 기능
- ✅ 삭제 이력 아카이브
- ✅ 관리자 권한 제어

### 6. 알림 시스템 (100% 완료)
- ✅ 웹 기반 알림 벨
- ✅ 실시간 알림 수신 (Supabase Realtime)
- ✅ 미읽음 개수 표시
- ✅ 알림 타입별 분류 (모임, 채팅, 투표)

### 7. 관리자 기능 (100% 완료)
- ✅ 회원 관리 (활성화/비활성화, 삭제, 복구, **영구 삭제**)
- ✅ 역할 변경 (일반/모임장/관리자)
- ✅ 초대 코드 생성 및 관리
- ✅ 모임 관리
- ✅ 투표 기간 관리
- ✅ 질문 관리

---

## 🔧 최근 수정 사항 (2025-11-17)

### 1. 이미지 업로드 시스템 수정
**문제**:
- 이미지 업로드 시 `Content-Type: application/json` 헤더가 강제되어 파일이 손상됨
- Workbox Service Worker가 잘못된 캐시 응답 반환

**해결**:
- ✅ Supabase 클라이언트에서 global headers 제거
- ✅ Canvas to Blob 변환 방식 개선
- ✅ Workbox 캐시 정책 수정 (Content-Type 검증 추가)
- ✅ Service Worker에서 이미지 Content-Type 검증 플러그인 추가

**영향받은 파일**:
- `web/src/lib/supabase.js`
- `web/src/pages/meetings/CreateMeetingPage.jsx`
- `web/src/pages/meetings/MeetingDetailPage.jsx`
- `web/vite.config.js`

### 2. 무한 루프 문제 해결
**문제**:
- 채팅 구독이 무한히 설정/해제 반복
- 네트워크 탭에서 계속 리소스 다운로드

**해결**:
- ✅ `useMeetingChat` 훅의 의존성 배열 수정 (`user` → `user?.id`)
- ✅ `useMeetingParticipants` 훅의 의존성 배열 수정
- ✅ `fetchMeetingData` 함수를 `useCallback`으로 메모이제이션
- ✅ `refetchMeetingData` 함수 메모이제이션

**영향받은 파일**:
- `web/src/pages/meetings/MeetingDetailPage.jsx`
- `web/src/hooks/useMeetingChat.js`
- `web/src/hooks/useMeetingParticipants.js`

### 3. 영구 삭제 기능 추가
**기능**:
- ✅ 관리자가 soft delete된 회원을 영구 삭제 가능
- ✅ 닉네임 확인 입력으로 실수 방지
- ✅ 삭제된 회원의 닉네임 재사용 가능
- ✅ 아카이브 기록은 감사 추적을 위해 보존

**새로 추가된 UI**:
- 삭제된 회원 탭에 "영구 삭제" 버튼
- 경고 모달 (되돌릴 수 없음 경고, 삭제될 데이터 목록)
- 닉네임 확인 입력 필드

**영향받은 파일**:
- `web/src/pages/admin/AdminUsersPage.jsx`
- `web/supabase/migrations/20250212_user_soft_delete_and_archive.sql` (기존)

### 4. Vercel 배포 오류 수정
**문제**:
- Workbox 설정에서 `headers` 속성에 정규식 사용 시 빌드 에러

**해결**:
- ✅ `cacheableResponse.headers`를 플러그인 방식으로 변경
- ✅ `cacheWillUpdate` 훅에서 Content-Type 검증
- ✅ Git 커밋 및 푸시 완료

---

## 📱 모바일 앱 개발 상태

### React Native + Expo (개발 진행 중 - 70% 완료)

#### 완료된 화면
- ✅ 로그인 화면 (`app/(auth)/login.tsx`)
- ✅ 회원가입 화면 (`app/(auth)/signup.tsx`)
- ✅ 비밀번호 재설정 (`app/(auth)/reset-password.tsx`)
- ✅ 홈 화면 (`app/(tabs)/home.tsx`)
- ✅ 모임 목록 (`app/(tabs)/meetings.tsx`)
- ✅ 질문 목록 (`app/(tabs)/questions.tsx`)
- ✅ 프로필 (`app/(tabs)/profile.tsx`)
- ✅ 알림 (`app/notifications.tsx`)
- ✅ 설정 (`app/settings.tsx`)

#### 진행 중인 작업
- ⏳ OAuth 소셜 로그인 구현 (Google, Kakao)
  - Deep Link 설정 완료
  - Edge Function 배포 완료
  - 실제 디바이스 테스트 필요

#### 미구현 기능
- ❌ 모임 상세 화면
- ❌ 질문 상세 화면
- ❌ 관리자 대시보드
- ❌ 실시간 채팅
- ❌ API 연결 (현재 Mock 데이터 사용)

---

## 🗂️ 데이터베이스 구조

### 주요 테이블
- `users` - 회원 정보 (soft delete 지원)
- `invitation_codes` - 초대 코드
- `offline_meetings` - 모임 정보 (정기/즉흥 템플릿 및 실제 모임)
- `meeting_participants` - 모임 참가자
- `meeting_chats` - 모임 채팅
- `meeting_chat_read_receipts` - 읽음 표시
- `meeting_typing_indicators` - 입력 중 표시
- `voting_periods` - 투표 기간
- `posts_nominations` - 글 추천
- `votes` - 투표 기록
- `daily_questions` - 오늘의 질문
- `daily_question_answers` - 개인 답변
- `public_answers` - 공개 답변
- `answer_comments` - 댓글
- `deleted_users_archive` - 삭제된 회원 아카이브

### Storage Buckets
- `meeting-images` - 모임 이미지 (public)
- `answer-images` - 답변 이미지 (public)
- `question-images` - 질문 이미지 (public)

---

## 🔐 환경 변수

### 웹 (.env)
```
VITE_SUPABASE_URL=https://wghrshqnexgaojxrtiit.supabase.co
VITE_SUPABASE_ANON_KEY=[키 값]
```

### 모바일 (app/.env)
```
EXPO_PUBLIC_SUPABASE_URL=https://wghrshqnexgaojxrtiit.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[키 값]
EXPO_PUBLIC_GOOGLE_CLIENT_ID=[구글 클라이언트 ID]
EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY=[카카오 네이티브 앱 키]
```

---

## 📈 성능 및 최적화

### 완료된 최적화
- ✅ React Hook 의존성 최적화
- ✅ useCallback/useMemo 메모이제이션
- ✅ Supabase Realtime 최적화
- ✅ Service Worker 캐싱 전략
- ✅ 이미지 업로드 최적화 (Canvas resize)

### 알려진 이슈
- ✅ ~~이미지 업로드 실패~~ (해결됨 - 2025-11-17)
- ✅ ~~무한 루프 문제~~ (해결됨 - 2025-11-17)
- ✅ ~~Vercel 빌드 에러~~ (해결됨 - 2025-11-17)

---

## 🚀 배포 상태

### 웹 (Vercel)
- **URL**: [배포 URL 확인 필요]
- **상태**: ✅ 배포 완료 (2025-11-17 최신 수정사항 반영)
- **자동 배포**: main 브랜치 push 시

### 모바일
- **iOS**: ❌ 미배포 (개발 중)
- **Android**: ❌ 미배포 (개발 중)

---

## 📝 중요 문서

1. **PROGRESS.md** - 전체 진행 상황
2. **SOCIAL_LOGIN_SETUP.md** - 소셜 로그인 설정 가이드
3. **app/OAUTH_IMPLEMENTATION_PROGRESS.md** - 모바일 OAuth 진행 상황
4. **web/USER_DELETE_AND_RECOVERY_GUIDE.md** - 회원 삭제/복구 시스템

---

## 👥 역할 및 권한

### 사용자 역할
- **admin**: 전체 시스템 관리 권한
- **meeting_host**: 모임 생성 권한
- **member**: 일반 회원

### 주요 권한
- 모임 생성: admin, meeting_host
- 회원 관리: admin
- 투표 기간 생성: admin
- 질문 생성: admin

---

**다음 업데이트**: TODO.md 참조
**문의**: 프로젝트 관리자
