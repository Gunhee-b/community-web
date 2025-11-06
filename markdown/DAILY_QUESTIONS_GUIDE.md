# 오늘의 질문 기능 가이드

통찰방 커뮤니티에 추가된 '오늘의 질문' 기능에 대한 상세 가이드입니다.

## 기능 개요

오늘의 질문은 매일 하나의 깊이 있는 질문을 제공하고, 사용자들이 자신만의 답변과 생각을 기록할 수 있는 기능입니다. 90개의 질문에 답변하는 챌린지를 통해 지속적인 참여를 유도합니다.

## 주요 기능

### 1. 사용자 기능

#### 오늘의 질문 배너
- **위치**: 홈페이지 최상단
- **내용**:
  - 오늘의 질문 제목과 짧은 설명
  - 완료 여부 표시
  - 그라디언트 배경과 시각적 효과

#### 질문 상세 페이지
- **URL**: `/questions/:id`
- **구성 요소**:
  - 질문 제목과 상세 내용
  - 이미지 (있는 경우)
  - 외부 링크 및 참고 문헌
  - 사용자 답변 및 메모 입력 영역
  - 체크 완료 표시

#### 질문 모음 페이지
- **URL**: `/questions`
- **기능**:
  - 모든 발행된 질문 목록 조회
  - 필터링 (전체/완료/미완료)
  - 90-Day Challenge 진행 상황
  - 연속 참여 일수 통계

#### 90-Day Challenge
- **목표**: 90개의 서로 다른 질문에 체크 완료
- **통계**:
  - 총 완료 개수 (예: 23/90)
  - 현재 연속 참여 일수
  - 최장 연속 참여 일수
  - 챌린지 완료 시 총 소요 일수
- **진행 바**: 시각적 진행 상황 표시

### 2. 관리자 기능

#### 질문 관리 페이지
- **URL**: `/admin/questions`
- **기능**:
  - 질문 생성 (CRUD)
  - 예약 게시 설정
  - 발행/미발행 상태 관리
  - 질문 통계 조회

#### 질문 생성 양식
- **필수 필드**:
  - 제목
  - 짧은 설명 (배너용, 200자 이내)
  - 상세 내용
  - 예약 날짜
- **선택 필드**:
  - 이미지 URL
  - 외부 링크
  - 참고 문헌 (JSON 형식)
  - 발행 상태

## 데이터베이스 구조

### 테이블

#### 1. daily_questions
```sql
- id: UUID (Primary Key)
- title: TEXT (제목)
- short_description: TEXT (짧은 설명)
- content: TEXT (상세 내용)
- image_url: TEXT (이미지 URL, nullable)
- external_link: TEXT (외부 링크, nullable)
- references: TEXT (참고 문헌 JSON, nullable)
- scheduled_date: DATE (예약 날짜)
- is_published: BOOLEAN (발행 여부)
- created_by: UUID (생성자 ID)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 2. question_checks
```sql
- id: UUID (Primary Key)
- user_id: UUID (사용자 ID)
- question_id: UUID (질문 ID)
- is_checked: BOOLEAN (체크 여부)
- user_answer: TEXT (사용자 답변, nullable)
- user_note: TEXT (사용자 메모, nullable)
- checked_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- UNIQUE(user_id, question_id)
```

#### 3. challenge_stats
```sql
- id: UUID (Primary Key)
- user_id: UUID (사용자 ID, UNIQUE)
- total_checks: INTEGER (총 체크 수)
- current_streak: INTEGER (현재 연속 일수)
- longest_streak: INTEGER (최장 연속 일수)
- started_at: TIMESTAMPTZ (시작일)
- completed_at: TIMESTAMPTZ (완료일, nullable)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## 설치 및 설정

### 1. 데이터베이스 마이그레이션 실행

Supabase SQL Editor에서 다음 파일을 실행하세요:

```bash
supabase/migrations/20250121_daily_questions_feature.sql
```

또는 Supabase CLI 사용:

```bash
supabase db push
```

### 2. RLS 정책 확인

마이그레이션 파일에 포함된 RLS 정책:
- 모든 사용자: 발행된 질문 조회 가능
- 관리자: 모든 질문 CRUD 가능
- 사용자: 자신의 체크/답변만 관리 가능

### 3. 초기 질문 데이터 생성

관리자 계정으로 로그인 후:
1. `/admin/questions` 페이지 접속
2. "새 질문 만들기" 버튼 클릭
3. 질문 정보 입력 및 저장

## 사용 가이드

### 일반 사용자

#### 질문에 답변하기
1. 홈페이지에서 "오늘의 질문" 배너 클릭
2. 질문 내용 확인
3. "체크하기" 버튼 클릭
4. 선택적으로 답변과 메모 작성
5. "저장" 버튼 클릭

#### 과거 질문 보기
1. 네비게이션에서 "질문모음" 클릭
2. 원하는 필터 선택 (전체/완료/미완료)
3. 질문 카드 클릭하여 상세 페이지로 이동

#### 챌린지 진행 상황 확인
- 질문 모음 페이지 상단에서 확인
- 총 완료 개수, 연속 일수 등 통계 제공

### 관리자

#### 질문 생성
1. 관리자 대시보드 접속
2. "질문 관리" 메뉴 선택
3. "새 질문 만들기" 클릭
4. 필수 정보 입력:
   - 제목
   - 짧은 설명
   - 상세 내용
   - 예약 날짜
5. 선택 정보 입력 (이미지, 링크, 참고 문헌)
6. 발행 여부 선택
7. "생성" 버튼 클릭

#### 참고 문헌 JSON 형식
```json
[
  {
    "title": "참고 자료 제목",
    "author": "저자명",
    "url": "https://example.com/article"
  },
  {
    "title": "또 다른 참고 자료",
    "author": "저자명",
    "url": "https://example.com/article2"
  }
]
```

#### 예약 게시 관리
- `scheduled_date`: 질문이 노출될 날짜
- `is_published`: 발행 여부
- 예약된 날짜가 되어도 `is_published`가 false면 노출되지 않음
- 과거 날짜로 설정하면 즉시 노출 가능

## 네비게이션 구조

### 일반 사용자
- **홈**: 오늘의 질문 배너 표시
- **질문모음**: 모든 질문 리스트 + 챌린지 진행 상황
- **모바일 하단 네비게이션**: 질문 아이콘 추가

### 관리자
- **관리자 대시보드**: 질문 관리 메뉴 추가
- **질문 관리**: 질문 CRUD, 발행 관리

## 기술적 세부사항

### 자동 업데이트 기능

#### Trigger: 챌린지 통계 자동 업데이트
- 질문 체크 시 자동으로 `challenge_stats` 업데이트
- 총 체크 수, 연속 일수 자동 계산
- 90개 완료 시 자동으로 완료 일시 기록

#### Trigger: updated_at 자동 업데이트
- 모든 테이블의 `updated_at` 필드 자동 업데이트

### Function: get_today_question()
- 오늘 날짜의 발행된 질문과 사용자 체크 정보를 함께 반환
- Security Definer로 설정되어 RLS 우회

## UI/UX 특징

### 시각적 요소
- 그라디언트 배경 (파란색 → 보라색)
- 진행 바 애니메이션
- 체크 완료 배지
- 오늘의 질문 강조 (링 효과)

### 반응형 디자인
- 모바일: 하단 네비게이션 바에 질문 아이콘 추가
- 태블릿/데스크톱: 상단 네비게이션 바 확장

### 사용성
- 한 번의 클릭으로 질문 체크 가능
- 답변은 선택사항
- 체크 취소 가능
- 이전 답변 수정 가능

## 문제 해결

### 질문이 표시되지 않음
- `is_published`가 `true`인지 확인
- `scheduled_date`가 오늘 날짜 이전인지 확인
- RLS 정책 확인

### 체크가 저장되지 않음
- 로그인 상태 확인
- 네트워크 연결 확인
- 브라우저 콘솔에서 에러 확인

### 챌린지 통계가 업데이트되지 않음
- Trigger가 제대로 생성되었는지 확인
- `question_checks` 테이블에 데이터가 있는지 확인

## 향후 개선 사항

- [ ] 마크다운 렌더링 지원
- [ ] 이미지 업로드 기능
- [ ] 질문 카테고리 분류
- [ ] 사용자 답변 공유 기능
- [ ] 질문 검색 기능
- [ ] 푸시 알림 (오늘의 질문 알림)
- [ ] 통계 차트 시각화
- [ ] 질문 좋아요/북마크 기능

## 라이선스

MIT License

---

**버전**: 1.0.0
**최종 업데이트**: 2025년 1월 21일
**개발**: Claude Code
