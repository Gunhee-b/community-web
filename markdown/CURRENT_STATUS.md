# 현재 작업 상황 (2025-01-29)

## 진행 중인 작업

### 오늘의 질문 - 공개 답변 및 이미지 업로드 기능 구현

**날짜**: 2025-01-29
**버전**: v2.6.0
**상태**: 🔄 디버깅 중 (400 에러 해결 필요)

---

## 완료된 작업 ✅

### 1. 데이터베이스 스키마 설계 및 구현
- ✅ `question_answers` 테이블 생성
  - 공개 답변 저장
  - 한 사용자당 질문 하나에 하나의 답변만 작성 가능 (UNIQUE 제약)
  - 텍스트 또는 이미지 중 하나는 필수 (CHECK 제약)

- ✅ `answer_comments` 테이블 생성
  - 답변에 대한 댓글 저장
  - CASCADE DELETE로 답변 삭제 시 댓글도 함께 삭제

### 2. 이미지 업로드 기능
- ✅ 첫 번째 이미지 컬럼 추가 (`image_url`)
- ✅ 두 번째 이미지 컬럼 추가 (`image_url_2`)
- ✅ Storage 정책 설정 SQL 작성
- ✅ 이미지 미리보기 기능
- ✅ 개별 이미지 삭제 기능
- ✅ 파일 크기 검증 (5MB 제한)
- ✅ 파일 타입 검증 (이미지만 허용)

### 3. 프론트엔드 구현
- ✅ 별도의 답변 작성 페이지 생성 (`WriteAnswerPage.jsx`)
  - 질문 전체 내용 표시
  - 텍스트 입력 영역
  - 이미지 업로드 UI (2개 슬롯)
  - 실시간 글자 수 카운터
  - 저장/수정 버튼

- ✅ 질문 상세 페이지 수정 (`QuestionDetailPage.jsx`)
  - 공개 답변 목록 표시
  - 이미지 그리드 레이아웃 (반응형)
  - 댓글 작성/삭제 UI
  - 본인 답변 수정/삭제 버튼

- ✅ 라우트 추가
  - `/questions/:id/write-answer` 경로 설정

### 4. 문서 작성
- ✅ `MIGRATION_GUIDE_20250129.md` - 마이그레이션 가이드
- ✅ `IMAGE_UPLOAD_GUIDE.md` - 이미지 업로드 가이드
- ✅ `STORAGE_SETUP_MANUAL.md` - Storage 수동 설정 가이드
- ✅ `FEATURES.md` - 기능 문서에 오늘의 질문 섹션 추가
- ✅ `NEW_FEATURES.md` - 신규 기능 상세 설명 추가

---

## 현재 문제 🔴

### 400 에러 발생

**증상**:
```
Failed to load resource: the server responded with a status of 400
Error saving public answer: Object
```

**발생 위치**: `WriteAnswerPage.jsx:209` (handleSavePublicAnswer 함수)

**원인 추정**:
1. **데이터베이스 컬럼 누락** (가장 가능성 높음)
   - `image_url_2` 컬럼이 데이터베이스에 아직 생성되지 않음
   - 프론트엔드에서는 `image_url_2` 값을 보내지만 DB에 해당 컬럼 없음

2. **Storage 버킷 미생성**
   - `answer-images` 버킷이 Supabase Dashboard에서 생성되지 않음
   - 이미지 업로드 시도 시 실패

3. **CHECK 제약 조건 실패**
   - 텍스트와 이미지 모두 없거나 형식 오류

**적용된 임시 해결책**:
- ✅ 에러 로깅 개선 (더 자세한 에러 메시지 출력)
  ```javascript
  console.error('Error details:', JSON.stringify(error, null, 2))
  ```

---

## 해결 방법 (사용자에게 안내)

### Step 1: 데이터베이스 마이그레이션 확인

다음 SQL을 Supabase SQL Editor에서 실행하여 현재 스키마 확인:

```sql
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

**기대 결과** (다음 컬럼들이 모두 있어야 함):
- `id` (uuid)
- `question_id` (uuid)
- `user_id` (uuid)
- `content` (text, nullable)
- `is_public` (boolean)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)
- `image_url` (text, nullable) ⚠️
- `image_url_2` (text, nullable) ⚠️

### Step 2: 누락된 마이그레이션 실행

#### 2-1. 테이블 생성 (아직 안 했다면)
**파일**: `supabase/migrations/20250129_add_public_answers.sql`

Supabase SQL Editor에서 실행

#### 2-2. 첫 번째 이미지 컬럼 추가
**파일**: `supabase/migrations/20250129_add_image_to_answers.sql`

```sql
ALTER TABLE question_answers
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE question_answers
ALTER COLUMN content DROP NOT NULL;

-- 제약 조건 추가
ALTER TABLE question_answers
DROP CONSTRAINT IF EXISTS check_content_or_image;

ALTER TABLE question_answers
ADD CONSTRAINT check_content_or_image
CHECK (
  (content IS NOT NULL AND LENGTH(TRIM(content)) >= 10) OR
  (image_url IS NOT NULL)
);
```

#### 2-3. Storage 버킷 생성 (수동)
**중요**: SQL로 불가능, Dashboard에서 수동으로 생성

1. https://supabase.com 로그인
2. 프로젝트 선택
3. Storage → New bucket
4. 설정:
   - Name: `answer-images`
   - Public bucket: ✅ **반드시 체크!**
   - File size limit: 5242880 (5MB)
5. Create bucket 클릭

#### 2-4. Storage 정책 설정
**파일**: `supabase/migrations/20250129_setup_answer_images_storage.sql`

버킷 생성 후 SQL Editor에서 실행:

```sql
DROP POLICY IF EXISTS "Authenticated users can upload answer images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view answer images" ON storage.objects;

CREATE POLICY "Authenticated users can upload answer images"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'answer-images');

CREATE POLICY "Anyone can view answer images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'answer-images');
```

#### 2-5. 두 번째 이미지 컬럼 추가 ⚠️ **이것이 가장 중요!**
**파일**: `supabase/migrations/20250129_add_second_image.sql`

```sql
ALTER TABLE question_answers
ADD COLUMN IF NOT EXISTS image_url_2 TEXT;

-- 기존 제약 조건 삭제
ALTER TABLE question_answers
DROP CONSTRAINT IF EXISTS check_content_or_image;

-- 새로운 제약 조건: 이미지 2장 지원
ALTER TABLE question_answers
ADD CONSTRAINT check_content_or_images
CHECK (
  (content IS NOT NULL AND LENGTH(TRIM(content)) >= 10) OR
  (image_url IS NOT NULL) OR
  (image_url_2 IS NOT NULL)
);
```

### Step 3: 확인 및 테스트

1. **스키마 확인**
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'question_answers'
   AND column_name LIKE '%image%';
   ```

   **기대 출력**:
   ```
   image_url
   image_url_2
   ```

2. **Storage 버킷 확인**
   - Supabase Dashboard → Storage
   - `answer-images` 버킷 존재 여부 확인
   - Public 배지 표시 확인

3. **개발 서버 재시작**
   ```bash
   npm run dev
   ```

4. **기능 테스트**
   - 질문 상세 페이지 접속
   - "✍️ 답변 작성하기" 클릭
   - 이미지 2장 업로드 시도
   - 저장 버튼 클릭
   - 콘솔에서 에러 확인

---

## 마이그레이션 실행 순서 요약

**반드시 이 순서대로 실행해야 합니다!**

```bash
1. SQL Editor: 20250129_add_public_answers.sql          (테이블 생성)
2. SQL Editor: 20250129_add_image_to_answers.sql        (image_url 컬럼)
3. Dashboard:  Storage 버킷 수동 생성 (answer-images)   (버킷 생성)
4. SQL Editor: 20250129_setup_answer_images_storage.sql (Storage 정책)
5. SQL Editor: 20250129_add_second_image.sql            (image_url_2 컬럼) ⚠️
```

---

## 디버깅 체크리스트

사용자가 확인해야 할 사항:

- [ ] `question_answers` 테이블이 존재하는가?
- [ ] `image_url` 컬럼이 존재하는가?
- [ ] `image_url_2` 컬럼이 존재하는가? ⚠️ **가장 중요**
- [ ] `answer-images` Storage 버킷이 생성되었는가?
- [ ] Storage 버킷이 Public으로 설정되었는가?
- [ ] Storage 정책이 생성되었는가?
- [ ] 브라우저 콘솔에서 더 자세한 에러 메시지를 확인했는가?

---

## 개선된 코드 (적용됨)

### WriteAnswerPage.jsx:209-211

**이전**:
```javascript
console.error('Error saving public answer:', error)
alert('답변 저장에 실패했습니다: ' + error.message)
```

**현재**:
```javascript
console.error('Error saving public answer:', error)
console.error('Error details:', JSON.stringify(error, null, 2))
alert('답변 저장에 실패했습니다: ' + (error.message || JSON.stringify(error)))
```

이제 사용자는 브라우저 콘솔에서 더 자세한 에러 정보를 볼 수 있습니다.

---

## 다음 단계

### 사용자가 해야 할 일:
1. ✅ 브라우저 콘솔에서 상세 에러 메시지 확인
2. ⬜ 위의 "해결 방법" 섹션을 순서대로 따라 실행
3. ⬜ 각 단계 완료 후 체크리스트 확인
4. ⬜ 개발 서버 재시작 및 기능 테스트
5. ⬜ 여전히 오류 발생 시 콘솔 에러 메시지 공유

### 개발자가 할 일:
1. ✅ 에러 로깅 개선 완료
2. ⬜ 사용자로부터 상세 에러 메시지 수신 대기
3. ⬜ 에러 메시지 기반 추가 디버깅
4. ⬜ 필요시 코드 수정

---

## 예상 해결 시간

- **마이그레이션만 실행**: 5-10분
- **Storage 버킷 설정 포함**: 10-15분
- **전체 테스트 완료**: 15-20분

---

## 참고 문서

- [MIGRATION_GUIDE_20250129.md](./MIGRATION_GUIDE_20250129.md) - 전체 마이그레이션 가이드
- [STORAGE_SETUP_MANUAL.md](./STORAGE_SETUP_MANUAL.md) - Storage 설정 상세 가이드
- [IMAGE_UPLOAD_GUIDE.md](./IMAGE_UPLOAD_GUIDE.md) - 이미지 업로드 기능 가이드
- [NEW_FEATURES.md](./NEW_FEATURES.md) - 신규 기능 전체 설명

---

**최종 업데이트**: 2025-01-29
**작업자**: Claude Code
**상태**: 디버깅 중 (사용자 액션 대기)
