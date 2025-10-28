# 질문 공개 답변 및 댓글 기능 마이그레이션 가이드

## 개요
오늘의 질문에 공개 답변을 작성하고 다른 사용자의 답변을 보며 댓글을 달 수 있는 기능이 추가되었습니다.

## 변경사항

### 데이터베이스 스키마
1. **question_answers** 테이블 추가
   - 질문에 대한 공개 답변 저장
   - 한 사용자당 질문 하나에 하나의 답변만 작성 가능

2. **answer_comments** 테이블 추가
   - 답변에 대한 댓글 저장
   - 답변당 여러 댓글 작성 가능

### 프론트엔드
- `src/pages/questions/QuestionDetailPage.jsx` 업데이트
  - 공개 답변 작성/수정/삭제 기능
  - 다른 사용자의 답변 목록 표시
  - 답변에 댓글 작성/삭제 기능

## 마이그레이션 실행 방법

### 옵션 1: Supabase Dashboard 사용 (권장)

1. Supabase 프로젝트 대시보드에 로그인
2. 왼쪽 메뉴에서 **SQL Editor** 클릭
3. **New query** 버튼 클릭
4. 아래 파일의 내용을 복사하여 붙여넣기:
   ```
   supabase/migrations/20250129_add_public_answers.sql
   ```
5. **Run** 버튼 클릭하여 실행

### 옵션 2: Supabase CLI 사용

```bash
# 프로젝트 루트 디렉토리에서 실행
supabase db push
```

### 옵션 3: psql 사용

```bash
# PostgreSQL에 직접 연결하여 실행
psql -h db.your-project.supabase.co -U postgres -d postgres -f supabase/migrations/20250129_add_public_answers.sql
```

## 마이그레이션 확인

마이그레이션이 성공적으로 완료되었는지 확인:

```sql
-- 테이블 존재 확인
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('question_answers', 'answer_comments');

-- 인덱스 확인
SELECT indexname
FROM pg_indexes
WHERE tablename IN ('question_answers', 'answer_comments');
```

## 새로운 기능 사용 방법

### 사용자 입장

#### 1. 공개 답변 작성
1. 질문 상세 페이지 접속
2. 하단의 "커뮤니티 답변" 섹션에서 **"✍️ 답변 작성하기"** 버튼 클릭
3. 별도의 답변 작성 페이지로 이동
4. 답변 내용 입력 (최소 10자 이상) 또는 이미지 업로드 (최대 2장)
5. **"작성 완료"** 버튼 클릭

#### 2. 답변 수정/삭제
- 본인이 작성한 답변은 **"✏️ 내 답변 수정"** 버튼으로 수정 가능
- 답변 우측 상단의 **"삭제"** 버튼으로 삭제 가능

#### 3. 댓글 작성
1. 다른 사용자의 답변에서 **"댓글 달기"** 버튼 클릭
2. 댓글 내용 입력
3. **"댓글 작성"** 버튼 클릭

#### 4. 댓글 삭제
- 본인이 작성한 댓글은 우측 상단의 **"삭제"** 버튼으로 삭제 가능

## 주요 기능

### 공개 답변
- ✅ 한 질문당 한 개의 답변만 작성 가능
- ✅ 다른 사용자의 답변 실시간 조회
- ✅ 작성자 닉네임 표시
- ✅ 본인 답변 수정/삭제 가능
- ✅ 작성 시간 표시
- ✅ 이미지 업로드 지원 (최대 2장, 5MB 이하)
- ✅ 텍스트 또는 이미지 중 하나는 필수
- ✅ 별도의 답변 작성 페이지 제공

### 댓글
- ✅ 답변당 여러 댓글 작성 가능
- ✅ 댓글 작성자 닉네임 표시
- ✅ 본인 댓글 삭제 가능
- ✅ 실시간 댓글 업데이트

## 개인 메모 vs 공개 답변

### 개인 메모 (기존 기능)
- **위치**: "✓ 체크하기" 버튼 → 답변 입력 모달
- **공개 여부**: 본인만 볼 수 있음
- **용도**: 개인적인 생각 정리 및 메모

### 공개 답변 (신규 기능)
- **위치**: "커뮤니티 답변" 섹션 → "✍️ 답변 작성하기" 버튼
- **공개 여부**: 모든 사용자가 볼 수 있음
- **용도**: 다른 사용자와 생각 공유 및 토론

## 주의사항

1. **중복 작성 제한**
   - 한 질문당 하나의 공개 답변만 작성 가능
   - 기존 답변이 있으면 수정/삭제만 가능

2. **삭제 시 주의**
   - 답변 삭제 시 해당 답변의 모든 댓글도 함께 삭제됨
   - 삭제된 답변과 댓글은 복구 불가

3. **최소 길이**
   - 공개 답변은 최소 10자 이상 작성 필요

## 문제 해결

### 마이그레이션 실패 시

#### 1. 테이블 이미 존재 오류
```sql
-- 기존 테이블 삭제 후 재실행
DROP TABLE IF EXISTS answer_comments CASCADE;
DROP TABLE IF EXISTS question_answers CASCADE;
```

#### 2. 외래 키 오류
```sql
-- daily_questions와 users 테이블 존재 확인
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('daily_questions', 'users');
```

#### 3. 함수 오류
```sql
-- update_updated_at_column 함수 존재 확인
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'update_updated_at_column';
```

### 프론트엔드 오류

#### 1. 답변이 로드되지 않음
- 브라우저 콘솔에서 에러 확인
- 네트워크 탭에서 API 응답 확인
- 데이터베이스 연결 상태 확인

#### 2. 댓글 작성 실패
- 로그인 상태 확인
- 답변 ID가 올바른지 확인
- Supabase 프로젝트 상태 확인

## 버전 정보

- **작성일**: 2025-01-29
- **마이그레이션 파일**: `20250129_add_public_answers.sql`
- **영향받는 파일**:
  - `src/pages/questions/QuestionDetailPage.jsx`
  - `supabase/migrations/20250129_add_public_answers.sql`

## 이미지 업로드 기능 (추가 마이그레이션 필요)

### 1단계: 이미지 지원 추가
**파일**: `supabase/migrations/20250129_add_image_to_answers.sql`

답변에 이미지를 첨부할 수 있는 기능:
- `image_url` 컬럼 추가
- 텍스트(10자 이상) 또는 이미지 중 하나는 필수

### 2단계: Storage 버킷 및 정책 설정
**파일**: `supabase/migrations/20250129_setup_answer_images_storage.sql`

**중요**: Storage 버킷은 SQL로 생성할 수 없으므로 수동으로 생성해야 합니다!

#### Supabase Dashboard에서 버킷 생성:
1. https://supabase.com 로그인
2. 프로젝트 선택
3. Storage → New bucket 클릭
4. 버킷 설정:
   - Name: `answer-images`
   - Public bucket: ✅ 체크 (필수!)
   - File size limit: 5242880 (5MB)
5. Create bucket 클릭

#### Storage 정책 SQL 실행:
버킷 생성 후 SQL Editor에서 `20250129_setup_answer_images_storage.sql` 실행

### 3단계: 두 번째 이미지 지원 추가
**파일**: `supabase/migrations/20250129_add_second_image.sql`

- `image_url_2` 컬럼 추가
- 최대 2장까지 이미지 업로드 가능

### 마이그레이션 실행 순서 (중요!)

```bash
# 1단계: 공개 답변 테이블 생성
# SQL Editor에서 20250129_add_public_answers.sql 실행

# 2단계: 첫 번째 이미지 컬럼 추가
# SQL Editor에서 20250129_add_image_to_answers.sql 실행

# 3단계: Storage 버킷 생성 (Dashboard에서 수동)
# Storage → New bucket → answer-images (Public)

# 4단계: Storage 정책 설정
# SQL Editor에서 20250129_setup_answer_images_storage.sql 실행

# 5단계: 두 번째 이미지 컬럼 추가
# SQL Editor에서 20250129_add_second_image.sql 실행
```

### 마이그레이션 확인

```sql
-- question_answers 테이블의 모든 컬럼 확인
SELECT
    column_name,
    data_type,
    is_nullable
FROM
    information_schema.columns
WHERE
    table_name = 'question_answers'
ORDER BY
    ordinal_position;
```

**기대 결과**:
- id
- question_id
- user_id
- content (nullable)
- is_public
- created_at
- updated_at
- image_url (nullable)
- image_url_2 (nullable)

## 다음 단계

마이그레이션 완료 후:
1. 개발 서버 재시작: `npm run dev`
2. 질문 상세 페이지에서 새 기능 테스트
3. 여러 사용자 계정으로 답변 및 댓글 작성 테스트
4. 이미지 업로드 기능 테스트 (최대 2장)

## 지원

문제가 발생하면 다음을 확인하세요:
1. Supabase 대시보드의 Database 섹션에서 테이블 생성 확인
2. 브라우저 개발자 도구의 콘솔에서 JavaScript 에러 확인
3. 네트워크 탭에서 API 요청/응답 확인

---

**최종 업데이트**: 2025-01-29
