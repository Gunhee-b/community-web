# 답변 이미지 업로드 기능 가이드

## 개요
오늘의 질문에 대한 답변을 작성할 때 텍스트 대신 또는 함께 이미지를 업로드할 수 있는 기능이 추가되었습니다.

## 새로운 기능

### 1. 이미지 업로드
- **텍스트 또는 이미지**: 최소 10자의 텍스트 또는 이미지 중 하나는 필수
- **이미지만 업로드 가능**: 텍스트 없이 이미지만으로도 답변 작성 가능
- **텍스트 + 이미지**: 텍스트와 이미지를 함께 업로드 가능

### 2. 이미지 제한사항
- **파일 형식**: JPG, PNG, GIF
- **최대 크기**: 5MB
- **저장소**: Supabase Storage (`answer-images` 버킷)

## 데이터베이스 마이그레이션

### 실행해야 할 SQL 파일

1. **기본 스키마 업데이트** (필수)
   ```
   supabase/migrations/20250129_add_image_to_answers.sql
   ```
   - `question_answers` 테이블에 `image_url` 컬럼 추가
   - `content` 컬럼을 선택 사항으로 변경
   - 최소 조건 체크 제약 추가 (텍스트 10자 이상 또는 이미지 필수)

2. **Storage 버킷 설정** (필수)
   ```
   supabase/migrations/20250129_setup_answer_images_storage.sql
   ```
   - `answer-images` 버킷 생성
   - Storage 정책 설정 (업로드, 읽기, 수정, 삭제)

## 마이그레이션 실행 방법

### 옵션 1: Supabase Dashboard (권장)

#### 1단계: 기본 스키마 업데이트
1. Supabase 대시보드 로그인
2. SQL Editor 열기
3. `20250129_add_image_to_answers.sql` 내용 복사
4. Run 클릭

#### 2단계: Storage 버킷 설정
1. 같은 SQL Editor에서
2. `20250129_setup_answer_images_storage.sql` 내용 복사
3. Run 클릭

#### 3단계: Storage 버킷 확인
1. 왼쪽 메뉴에서 **Storage** 클릭
2. `answer-images` 버킷이 생성되었는지 확인
3. 버킷 설정에서 **Public bucket** 활성화 확인

### 옵션 2: Supabase CLI

```bash
# 프로젝트 루트 디렉토리에서
supabase db push
```

## Storage 정책 확인

다음 SQL로 정책이 올바르게 생성되었는지 확인:

```sql
-- Storage 정책 확인
SELECT * FROM storage.policies
WHERE bucket_id = 'answer-images';

-- 버킷 확인
SELECT * FROM storage.buckets
WHERE id = 'answer-images';
```

## 사용 방법

### 사용자 입장

#### 1. 답변 작성 페이지 접속
1. 질문 상세 페이지에서 "✍️ 답변 작성하기" 클릭
2. `/questions/:id/write-answer` 페이지로 이동

#### 2. 이미지 업로드
1. "이미지 첨부" 섹션에서 점선 박스 클릭
2. 이미지 파일 선택 (JPG, PNG, GIF)
3. 미리보기 확인
4. 필요시 X 버튼으로 삭제 후 재업로드

#### 3. 답변 작성 옵션

**옵션 A: 이미지만 업로드**
- 텍스트 없이 이미지만 선택
- "✍️ 작성 완료" 버튼 클릭

**옵션 B: 텍스트만 작성**
- 최소 10자 이상의 텍스트 입력
- "✍️ 작성 완료" 버튼 클릭

**옵션 C: 텍스트 + 이미지**
- 텍스트 입력 (최소 10자)
- 이미지 업로드
- "✍️ 작성 완료" 버튼 클릭

#### 4. 답변 보기
- 질문 상세 페이지의 "커뮤니티 답변" 섹션에 표시
- 이미지가 있으면 상단에 표시
- 텍스트가 있으면 이미지 아래에 표시

## 파일 구조

### 새로 추가된 파일
```
supabase/migrations/
├── 20250129_add_image_to_answers.sql          # 스키마 업데이트
└── 20250129_setup_answer_images_storage.sql   # Storage 설정
```

### 수정된 파일
```
src/pages/questions/
├── WriteAnswerPage.jsx       # 이미지 업로드 UI 추가
└── QuestionDetailPage.jsx    # 이미지 표시 기능 추가
```

## 주요 기능

### 이미지 업로드 프로세스
1. 사용자가 이미지 선택
2. 클라이언트에서 파일 크기 및 형식 검증
3. 미리보기 생성 (Base64)
4. "작성 완료" 클릭 시 Supabase Storage에 업로드
5. 업로드된 이미지의 공개 URL 획득
6. `question_answers` 테이블에 URL 저장

### 이미지 저장 경로
```
answer-images/
└── {user_id}-{timestamp}.{ext}
```

예시: `123e4567-e89b-12d3-a456-426614174000-1738147200000.jpg`

## 데이터베이스 제약 조건

### CHECK 제약 조건
```sql
CHECK (
  (content IS NOT NULL AND LENGTH(TRIM(content)) >= 10) OR
  (image_url IS NOT NULL)
)
```

이 제약 조건은 다음을 보장합니다:
- 답변에는 최소한 하나가 있어야 함:
  - 10자 이상의 텍스트
  - 또는 이미지 URL

## Storage 정책

### 1. 업로드 정책
- 모든 인증된 사용자가 이미지 업로드 가능
- 버킷: `answer-images`

### 2. 읽기 정책
- 모든 사용자가 이미지 조회 가능 (Public 버킷)

### 3. 수정/삭제 정책
- 자신이 업로드한 이미지만 수정/삭제 가능

## 문제 해결

### 1. 이미지 업로드 실패

**증상**: "답변 저장에 실패했습니다" 에러

**해결 방법**:
```sql
-- Storage 버킷 존재 확인
SELECT * FROM storage.buckets WHERE id = 'answer-images';

-- 버킷이 없으면 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('answer-images', 'answer-images', true);
```

### 2. 이미지가 표시되지 않음

**원인**: 버킷이 Public이 아님

**해결 방법**:
1. Supabase Dashboard → Storage
2. `answer-images` 버킷 클릭
3. Configuration → Public bucket 활성화

### 3. 정책 에러

**증상**: "Policy violation" 에러

**해결 방법**:
```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Authenticated users can upload answer images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view answer images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own answer images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own answer images" ON storage.objects;

-- 정책 재생성 (20250129_setup_answer_images_storage.sql 재실행)
```

### 4. 파일 크기 제한 에러

**클라이언트 측**: 5MB 제한
```javascript
if (file.size > 5 * 1024 * 1024) {
  alert('이미지 크기는 5MB 이하여야 합니다.')
}
```

**서버 측**: Supabase Storage 기본 제한 50MB

## 향후 개선 가능 사항

- [ ] 이미지 리사이징 (클라이언트 또는 서버)
- [ ] 이미지 최적화 (압축)
- [ ] 다중 이미지 업로드
- [ ] 이미지 편집 기능 (자르기, 회전)
- [ ] 드래그 앤 드롭 업로드
- [ ] 진행률 표시
- [ ] 이미지 갤러리 뷰

## 보안 고려사항

1. **파일 타입 검증**: 클라이언트와 서버 양쪽에서 검증
2. **파일 크기 제한**: 5MB로 제한하여 스토리지 남용 방지
3. **인증 필요**: 로그인한 사용자만 업로드 가능
4. **공개 URL**: 이미지는 공개되므로 민감한 정보 업로드 주의

## 비용 고려사항

- **Supabase Storage**: 무료 플랜 1GB
- **이미지당 평균 크기**: 약 500KB - 2MB
- **예상 저장 가능 이미지 수**: 약 500-2000개

---

**작성일**: 2025-01-29
**최종 업데이트**: 2025-01-29
