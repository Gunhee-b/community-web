# 통찰방 커뮤니티 플랫폼

250명 규모 커뮤니티를 위한 투표 및 오프라인 모임 웹 애플리케이션

## ✨ 주요 기능

### 1. 베스트 글 투표 시스템
- 관리자가 커스텀 제목/설명으로 투표 기간 생성 (예: "통찰방 10월-1 베스트 글 투표")
- 회원들이 글 제출 (제목, 작성자명, 본문)
- 다른 회원들이 추천 투표 (1인 1표, 토글 방식)
- 실시간 투표 현황 및 추천수 표시
- 투표 종료 시 최다 득표자 자동 선정 (동점 시 쉼표 구분 표시)
- 관리자는 추천수 순으로 제출된 글 목록 조회 가능

### 2. 오프라인 모임 시스템
- **로그인 없이도 모임 조회 가능** (참가는 로그인 필요)
- 모임장/관리자만 모임 생성 가능 (커피/술 선택)
- **카카오톡 오픈채팅 링크 연동**
  - 모임 생성 시 오픈채팅 링크 등록
  - 참가 시 자동으로 오픈채팅방 이동
  - 모임 상세 페이지에서 언제든 입장 가능
- **참석 체크 및 참여 횟수 추적**
  - 모임 종료 후 모임장이 실제 참석자 체크
  - 참석 승인 시 사용자 프로필에 참여 횟수 반영
  - 잘못 체크 시 취소 가능
- 참가 신청 시 모임 채팅방 자동 입장
- 실시간 채팅 (Supabase Realtime)
- 실제 사용자 닉네임으로 채팅 (username 표시)
- 메시지 전송 시간 표시 ("3분 전", "1시간 전" 등)
- 주최자는 왕관 이모지(👑)로 구분 표시
- 웹 기반 채팅 알림 시스템 (알림 벨 아이콘)
- 모임장/관리자 권한으로 모든 모임 수정/삭제 가능
- D-1일 미달 시 자동 취소

### 3. 인증 시스템
- 초대 코드 기반 회원가입 (6자리 영문 대문자 + 숫자 코드)
- 초대 코드 만료되어도 기존 가입 사용자는 계속 로그인 가능
- 카카오톡 닉네임으로 중복 가입 방지
- bcrypt 비밀번호 해싱 (서버 사이드)
- 3단계 역할 시스템: 관리자 / 모임장 / 일반 회원
- 커스텀 세션 관리 (7일 만료)
- **공개 콘텐츠 접근**: 로그인 없이도 홈과 오프라인 모임 조회 가능
- **향상된 비로그인 사용자 UX**: 모든 메뉴 표시, 클릭 시 로그인 안내

### 4. 관리자 대시보드
- 회원 관리 (활성화/비활성화, 역할 변경)
- 투표 기간 생성 및 관리 (제목/설명 커스터마이징)
- 제출된 글 추천수 순 조회
- 우승자 자동 선정 및 표시
- 모임 관리 (모든 모임 조회, 수정, 삭제)
- 초대 코드 생성 (6자리 숫자)
- 초대 코드 무효화/삭제 기능
- 커뮤니티 통계 조회

### 5. 알림 시스템
- 웹 기반 알림 벨 (브라우저 알림 대신)
- 채팅 메시지 알림 (실제 사용자 닉네임 표시)
- 알림 클릭 시 자동 삭제로 깔끔한 관리
- 중복 알림 방지 (읽지 않은 알림만 체크)
- Stale Closure 문제 해결 (useRef 사용)
- 알림 개별 삭제 및 전체 삭제
- localStorage 기반 알림 지속성 (읽지 않은 알림만)

## 🛠 기술 스택

- **Frontend**: React 18 + Vite
- **Backend/DB**: Supabase (PostgreSQL + Realtime)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router 6
- **Deployment**: Vercel

## 🚀 시작하기

### 1. 저장소 클론 및 의존성 설치
```bash
git clone <repository-url>
cd vote-example
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
```

`.env` 파일을 열어 Supabase 정보를 입력하세요:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Supabase 프로젝트 설정

#### Option A: Supabase CLI 사용 (권장)
```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 링크
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

#### Option B: 웹 콘솔 사용
1. https://supabase.com 에서 새 프로젝트 생성
2. SQL Editor에서 `supabase/migrations/` 폴더의 SQL 파일들을 순서대로 실행:
   - `20241015000001_initial_schema.sql`
   - `20241015000002_rls_policies.sql`
   - `20241015000003_functions_and_triggers.sql`
   - `20250128_add_kakao_openchat_link.sql` (카카오톡 오픈채팅 링크)
   - `20250128_add_meeting_participation_tracking.sql` (모임 참여 횟수 추적)

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 5. 초기 관리자 계정 설정

1. Supabase SQL Editor에서 초대 코드 생성 (6자리 숫자):
```sql
INSERT INTO invitation_codes (code, expires_at)
VALUES ('123456', NOW() + INTERVAL '7 days');
```

2. http://localhost:3000/signup 에서 회원가입

3. 관리자 권한 부여:
```sql
UPDATE users SET role = 'admin' WHERE username = 'your-username';
```

4. 로그아웃 후 다시 로그인

### 6. 필수 SQL 스크립트 실행

데이터베이스 스키마 업데이트를 위해 다음 SQL 파일들을 순서대로 실행하세요:

```bash
# 1. 인증 함수 설정
psql -f setup_auth_functions.sql

# 2. 투표 스키마 업데이트 (제목/설명 필드 추가)
psql -f new_voting_schema.sql

# 3. 작성자 이름 필드 추가
psql -f add_author_field.sql

# 4. 우승자 이름 필드 추가
psql -f add_winner_names_field.sql

# 5. 투표 관련 RLS 정책 수정
psql -f fix_voting_rls_only.sql

# 6. 초대 코드 RLS 정책 수정
psql -f fix_invitation_codes_rls.sql
```

또는 Supabase SQL Editor에서 각 파일의 내용을 복사하여 실행하세요.

## 📦 빌드 및 배포

### 로컬 빌드
```bash
npm run build
npm run preview
```

### Vercel 배포
```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

Vercel 대시보드에서 환경 변수 설정:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📁 프로젝트 구조

```
tongchalban-community/
├── src/
│   ├── components/        # 재사용 가능한 컴포넌트
│   ├── pages/             # 페이지 컴포넌트
│   ├── utils/             # 유틸리티 함수
│   ├── lib/               # 외부 라이브러리 설정
│   ├── store/             # 전역 상태 관리
│   └── hooks/             # 커스텀 React 훅
├── supabase/
│   └── migrations/        # 데이터베이스 마이그레이션
├── public/                # 정적 파일
├── DEPLOYMENT.md          # 배포 가이드
├── DEVELOPMENT.md         # 개발 가이드
└── PROJECT_SUMMARY.md     # 프로젝트 요약
```

## 📚 문서

- [프로젝트 요약](PROJECT_SUMMARY.md) - 전체 프로젝트 개요 및 기능 설명
- [배포 가이드](DEPLOYMENT.md) - 상세한 배포 절차
- [개발 가이드](DEVELOPMENT.md) - 개발 규칙 및 가이드라인

## 🔒 보안

- Row Level Security (RLS) 모든 테이블 적용
- bcrypt 비밀번호 해싱
- JWT 기반 인증
- XSS/SQL Injection 방지

## 🎯 현재 구현된 기능

### 완료된 주요 기능
- ✅ 초대 코드 기반 회원가입/로그인 (6자리 숫자)
- ✅ 커스텀 인증 시스템 (서버 사이드 bcrypt 해싱)
- ✅ 3단계 역할 시스템 (관리자/모임장/일반 회원)
- ✅ **로그인 없이 공개 콘텐츠 접근** (홈, 오프라인 모임)
- ✅ 베스트 글 투표 시스템 (1인 1표 토글 방식)
- ✅ 투표 작성자 이름 필드 (원작자/본인 구분)
- ✅ 투표 종료 시 우승자 자동 선정 (동점 처리)
- ✅ 관리자 글 추천수 순 조회
- ✅ 오프라인 모임 생성 및 참가 (모임장/관리자만 생성 가능)
- ✅ **카카오톡 오픈채팅 링크 연동** (참가 시 자동 이동)
- ✅ **모임 참석 체크 시스템** (모임장 승인)
- ✅ **모임 참여 횟수 추적** (프로필에 표시)
- ✅ 모임 수정 기능 (모임장/관리자)
- ✅ 실시간 채팅 (Supabase Realtime)
- ✅ 채팅에서 실제 사용자 닉네임 표시
- ✅ 메시지 전송 시간 표시 ("3분 전", "1시간 전" 등)
- ✅ 채팅에서 주최자 왕관 이모지 구분
- ✅ 웹 기반 알림 시스템 (알림 벨)
- ✅ 알림 클릭 시 자동 삭제 및 중복 방지
- ✅ Stale Closure 문제 해결 (폴링 알림 재생성 방지)
- ✅ 초대 코드 무효화/삭제 기능
- ✅ 관리자 대시보드 (회원/투표/모임/초대 관리)
- ✅ 회원 역할 변경 기능
- ✅ 커뮤니티 참가 링크 (메인 페이지)

### 향후 추가 가능
- 모바일 반응형 디자인
- 푸시 알림 (PWA)
- 이메일 인증
- 파일/이미지 첨부
- 검색 기능
- 댓글 대댓글
- 이모지 반응

## 🤝 기여

버그 리포트나 기능 제안은 이슈로 남겨주세요.

## 📄 라이선스

MIT License

## 📋 추가 문서

- [프로젝트 요약](PROJECT_SUMMARY.md) - 전체 프로젝트 개요
- [배포 가이드](DEPLOYMENT.md) - 상세한 배포 절차
- [개발 가이드](DEVELOPMENT.md) - 개발 규칙 및 가이드라인
- [새 기능 가이드](NEW_FEATURES.md) - 최근 추가된 기능 설명
- [알림 시스템 가이드](NOTIFICATION_GUIDE.md) - 알림 시스템 사용법

---

**버전**: 2.5.1
**최종 업데이트**: 2025년 10월 28일
**개발**: Claude Code

## 📝 최근 변경사항

### v2.5.1 (2025-10-28)

#### UX 개선
- 🎨 **비로그인 사용자 경험 개선**
  - 모든 메뉴를 비로그인 사용자에게도 표시
  - 보호된 메뉴(질문, 투표, 베스트, 프로필) 클릭 시 로그인 안내
  - 자동으로 로그인 페이지로 리다이렉션
  - Desktop, Mobile Sidebar, Mobile Bottom Navigation 모두 적용

#### 기능 개선
- 🔧 **홈 페이지 모임 표시 개수 확대**
  - 모집 중인 모임 표시: 3개 → 6개로 증가

#### 문서화
- 📚 **초대 코드 시스템 명확화**
  - 초대 코드 만료되어도 기존 사용자는 계속 이용 가능
  - 초대 코드는 회원가입 시에만 검증됨

### v2.5.0 (2025-10-28)

#### 신규 기능
- ✨ 로그인 없이도 홈 및 오프라인 모임 조회 가능
- ✨ 카카오톡 오픈채팅 링크 연동 (모임 참가 시 자동 이동)
- ✨ 모임 참석 체크 시스템 (모임장이 실제 참석자 승인)
- ✨ 모임 참여 횟수 추적 (프로필에 자동 반영)

#### 개선사항
- 🎨 비로그인 사용자를 위한 환영 배너 추가
- 🎨 네비게이션 바 동적 메뉴 (로그인 상태에 따라 변경)
- 🔒 오프라인 모임 외 기능은 로그인 필요 (투표, 질문, 베스트 글)

#### 데이터베이스 마이그레이션
- `offline_meetings.kakao_openchat_link` 컬럼 추가
- `users.meeting_participation_count` 컬럼 추가
- `meeting_participants.attended` 컬럼 추가
- `mark_attendance()` 함수 추가 (참석 체크 및 횟수 관리)
