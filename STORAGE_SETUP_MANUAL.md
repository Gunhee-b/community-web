# Storage 버킷 수동 설정 가이드

## 문제 상황
SQL로 Storage 버킷을 생성하려고 할 때 `ERROR: 42501: must be owner of table buckets` 에러가 발생합니다.

## 해결 방법: Supabase Dashboard 사용 (권장)

Storage 버킷과 정책은 Supabase Dashboard UI를 통해 생성하는 것이 가장 안전합니다.

---

## 1단계: Storage 버킷 생성

### 1. Supabase Dashboard 접속
1. https://supabase.com 로그인
2. 해당 프로젝트 선택
3. 왼쪽 메뉴에서 **Storage** 클릭

### 2. 새 버킷 생성
1. **"New bucket"** 버튼 클릭
2. 버킷 설정:
   - **Name**: `answer-images`
   - **Public bucket**: ✅ 체크 (중요!)
   - **File size limit**: 5242880 (5MB, 선택사항)
   - **Allowed MIME types**: `image/*` (선택사항)
3. **"Create bucket"** 버튼 클릭

---

## 2단계: Storage 정책 설정

### 방법 A: UI로 정책 생성 (권장)

#### 1. 버킷 정책 페이지 이동
1. Storage 메뉴에서 `answer-images` 버킷 클릭
2. 상단의 **"Policies"** 탭 클릭

#### 2. 업로드 정책 생성
1. **"New Policy"** 버튼 클릭
2. **"For full customization"** 선택
3. 정책 설정:
   - **Policy name**: `Authenticated users can upload answer images`
   - **Allowed operation**: `INSERT` 선택
   - **Target roles**: `public` 선택
   - **USING expression**: (비워둠)
   - **WITH CHECK expression**:
     ```sql
     bucket_id = 'answer-images'
     ```
4. **"Review"** → **"Save policy"**

#### 3. 읽기 정책 생성
1. **"New Policy"** 버튼 클릭
2. **"For full customization"** 선택
3. 정책 설정:
   - **Policy name**: `Anyone can view answer images`
   - **Allowed operation**: `SELECT` 선택
   - **Target roles**: `public` 선택
   - **USING expression**:
     ```sql
     bucket_id = 'answer-images'
     ```
   - **WITH CHECK expression**: (비워둠)
4. **"Review"** → **"Save policy"**

#### 4. 업데이트 정책 생성
1. **"New Policy"** 버튼 클릭
2. **"For full customization"** 선택
3. 정책 설정:
   - **Policy name**: `Users can update their own answer images`
   - **Allowed operation**: `UPDATE` 선택
   - **Target roles**: `public` 선택
   - **USING expression**:
     ```sql
     bucket_id = 'answer-images'
     ```
   - **WITH CHECK expression**: (비워둠)
4. **"Review"** → **"Save policy"**

#### 5. 삭제 정책 생성
1. **"New Policy"** 버튼 클릭
2. **"For full customization"** 선택
3. 정책 설정:
   - **Policy name**: `Users can delete their own answer images`
   - **Allowed operation**: `DELETE` 선택
   - **Target roles**: `public` 선택
   - **USING expression**:
     ```sql
     bucket_id = 'answer-images'
     ```
   - **WITH CHECK expression**: (비워둠)
4. **"Review"** → **"Save policy"**

---

### 방법 B: SQL Editor로 정책만 생성 (버킷은 UI로 생성 후)

버킷을 UI로 생성한 후, SQL Editor에서 정책만 생성할 수 있습니다.

1. Supabase Dashboard → **SQL Editor**
2. **"New query"** 클릭
3. 다음 SQL 실행:

```sql
-- 업로드 정책
CREATE POLICY "Authenticated users can upload answer images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'answer-images'
);

-- 읽기 정책
CREATE POLICY "Anyone can view answer images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'answer-images'
);

-- 업데이트 정책
CREATE POLICY "Users can update their own answer images"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'answer-images'
);

-- 삭제 정책
CREATE POLICY "Users can delete their own answer images"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'answer-images'
);
```

---

## 3단계: 확인

### 1. 버킷 확인
1. Storage 메뉴에서 `answer-images` 버킷이 보이는지 확인
2. 버킷 이름 클릭
3. **Public** 배지가 표시되는지 확인

### 2. 정책 확인
1. `answer-images` 버킷 클릭
2. **"Policies"** 탭 클릭
3. 다음 4개 정책이 생성되었는지 확인:
   - ✅ Authenticated users can upload answer images (INSERT)
   - ✅ Anyone can view answer images (SELECT)
   - ✅ Users can update their own answer images (UPDATE)
   - ✅ Users can delete their own answer images (DELETE)

---

## 4단계: 테스트

### 1. 개발 서버 시작
```bash
npm run dev
```

### 2. 이미지 업로드 테스트
1. 로그인
2. 질문 상세 페이지 접속
3. "✍️ 답변 작성하기" 클릭
4. 이미지 업로드
5. "작성 완료" 클릭

### 3. 에러 확인
- **성공**: 답변이 저장되고 이미지가 표시됨
- **실패**: 브라우저 콘솔에서 에러 메시지 확인

---

## 문제 해결

### 문제 1: "Policy violation" 에러

**원인**: 정책이 올바르게 생성되지 않음

**해결**:
1. Storage → answer-images → Policies
2. 기존 정책 삭제
3. 위의 방법 A 또는 B로 재생성

### 문제 2: 이미지가 표시되지 않음

**원인**: 버킷이 Public이 아님

**해결**:
1. Storage → answer-images 클릭
2. Configuration 탭
3. "Make public" 버튼 클릭

### 문제 3: "Bucket not found" 에러

**원인**: 버킷이 생성되지 않음

**해결**:
1. Storage 메뉴에서 버킷 목록 확인
2. `answer-images` 버킷이 없으면 1단계부터 다시 실행

---

## 간단 요약

**최소 필수 설정**:
1. ✅ Storage에서 `answer-images` 버킷 생성
2. ✅ 버킷을 **Public**으로 설정
3. ✅ 4개 정책 생성 (INSERT, SELECT, UPDATE, DELETE)

**권장 방법**:
- 버킷 생성: UI 사용
- 정책 생성: UI 또는 SQL 사용

**주의사항**:
- SQL로 버킷을 생성하려고 하지 마세요 (권한 에러)
- 반드시 버킷을 Public으로 설정하세요
- 정책은 `storage.objects` 테이블에 생성됩니다

---

## 추가 참고

### Supabase Storage 공식 문서
- https://supabase.com/docs/guides/storage

### 버킷 설정 예시
```javascript
// 프론트엔드에서 이미지 업로드
const { data, error } = await supabase.storage
  .from('answer-images')
  .upload(filePath, file)

// 공개 URL 가져오기
const { data: { publicUrl } } = supabase.storage
  .from('answer-images')
  .getPublicUrl(filePath)
```

---

**작성일**: 2025-01-29
**최종 업데이트**: 2025-01-29
