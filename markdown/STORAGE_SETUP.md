# Supabase Storage 설정 가이드

이미지 업로드 기능을 사용하기 위해 Supabase Storage 버킷을 설정해야 합니다.

## 1. Storage 버킷 생성

### 단계별 설정:

1. **Supabase 대시보드 접속**
   - https://app.supabase.com
   - 프로젝트 선택

2. **Storage 메뉴 이동**
   - 왼쪽 메뉴에서 "Storage" 클릭
   - "Create a new bucket" 버튼 클릭

3. **버킷 생성**
   - **Name**: `post-images`
   - **Public bucket**: ✅ 체크 (공개 버킷으로 설정)
   - "Create bucket" 버튼 클릭

## 2. 버킷 정책 설정

### 자동 생성된 정책 확인:

버킷 생성 시 기본 정책이 자동으로 생성됩니다. 추가 설정이 필요한 경우:

1. **Storage → Policies 탭 이동**
2. `post-images` 버킷 선택
3. 다음 정책들이 있는지 확인:

#### 정책 1: 모든 사용자 읽기 허용
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');
```

#### 정책 2: 인증된 사용자 업로드 허용
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-images'
  AND auth.role() = 'authenticated'
);
```

#### 정책 3: 본인이 업로드한 파일 삭제 허용
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 간단한 설정 (Public 버킷):

Public 버킷으로 설정했다면 위 정책은 자동으로 적용됩니다.

## 3. 수동 정책 설정 (UI 사용)

⚠️ **중요**: Storage 정책은 SQL Editor가 아닌 **Storage UI**에서 설정해야 합니다!

Public 버킷으로 생성하지 않았거나 정책을 추가로 설정해야 한다면:

### 단계별 설정 (정확한 방법):

⚠️ **주의**: 정책 입력란에는 `CREATE POLICY` 같은 SQL 문장이 아니라, **조건식만** 입력합니다!

#### 정책 1: Public 읽기 허용

1. **Supabase 대시보드 → Storage → post-images 버킷 선택**
2. **"Policies" 탭 클릭**
3. **"New Policy" 버튼 클릭**
4. 입력:
   - **Policy name**: `Public read access`
   - **Policy definition**: `SELECT` 선택 (또는 "Get object" 체크)
   - **Target roles**: `public` 선택
   - **USING expression** (조건식 입력란에):
     ```
     bucket_id = 'post-images'
     ```
     ❌ 잘못된 예: `CREATE POLICY "Public Access" ON storage.objects ...`
     ✅ 올바른 예: `bucket_id = 'post-images'`
5. **"Save policy"** 클릭

#### 정책 2: 인증된 사용자 업로드 허용

1. **"New Policy" 버튼 클릭**
2. 입력:
   - **Policy name**: `Authenticated users can upload`
   - **Policy definition**: `INSERT` 선택 (또는 "Insert object" 체크)
   - **Target roles**: `authenticated` 선택
   - **WITH CHECK expression**:
     ```
     bucket_id = 'post-images'
     ```
3. **"Save policy"** 클릭

#### 정책 3: 본인 파일 삭제 허용

1. **"New Policy" 버튼 클릭**
2. 입력:
   - **Policy name**: `Users can delete own files`
   - **Policy definition**: `DELETE` 선택 (또는 "Delete object" 체크)
   - **Target roles**: `authenticated` 선택
   - **USING expression**:
     ```
     bucket_id = 'post-images' AND owner = auth.uid()
     ```
3. **"Save policy"** 클릭

### 빠른 테스트 방법 (정책 없이 임시 사용)

정책 설정이 복잡하다면, 개발/테스트 단계에서는 **일시적으로 RLS 비활성화**할 수 있습니다:

1. **Supabase 대시보드 → Database → Tables**
2. **`storage` 스키마 → `objects` 테이블 선택**
3. **RLS 설정**:
   - "Disable RLS" 클릭 (빨간색 경고 표시됨)
   - ⚠️ **주의**: 프로덕션에서는 사용하지 마세요!

이렇게 하면 정책 없이도 이미지 업로드/조회가 가능합니다.

**프로덕션 배포 전에 반드시 RLS를 다시 활성화하고 정책을 설정하세요!**

### 더 간단한 방법 (권장):

버킷을 삭제하고 다시 생성:

1. **Storage → post-images 버킷 삭제**
2. **"Create a new bucket" 클릭**
3. **설정**:
   - Name: `post-images`
   - ✅ **Public bucket 체크** ← 이것이 중요!
   - "Create bucket" 클릭

Public 버킷으로 생성하면 기본 정책이 자동으로 적용됩니다!

## 4. 확인 사항

### 버킷이 제대로 생성되었는지 확인:

1. **Storage 메뉴에서 확인**
   - `post-images` 버킷이 목록에 표시됨
   - "Public" 라벨 표시됨

2. **테스트 업로드**
   - 버킷 클릭
   - "Upload file" 버튼으로 테스트 이미지 업로드
   - 업로드 성공 확인

3. **Public URL 확인**
   - 업로드한 파일 클릭
   - "Get URL" 버튼 클릭
   - URL이 생성되면 정상 ✅

## 5. 환경 변수 확인

`.env` 파일에 Supabase URL과 KEY가 설정되어 있는지 확인:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 6. 파일 업로드 제한 설정

### 권장 설정:

1. **파일 크기 제한**: 5MB
2. **허용 파일 형식**:
   - image/jpeg
   - image/png
   - image/gif
   - image/webp

코드에서 이미 이 제한이 구현되어 있습니다.

## 7. 버킷 구조

업로드된 이미지는 다음과 같은 구조로 저장됩니다:

```
post-images/
  └── {user_id}/
      └── {timestamp}_{random}_{filename}
          예: 1705123456789_abc123_image.jpg
```

## 문제 해결

### 업로드 실패: "new row violates row-level security policy"
- **원인**: RLS 정책 문제
- **해결**: 위의 정책 SQL을 다시 실행

### 이미지가 표시되지 않음
- **원인**: 버킷이 Public이 아님
- **해결**: 버킷 설정에서 "Public bucket" 체크

### 403 Forbidden 에러
- **원인**: 정책 문제 또는 인증 문제
- **해결**:
  1. 로그인 상태 확인
  2. Storage Policies 재확인
  3. 버킷 이름 확인 (`post-images`)

## 완료 체크리스트

- [ ] `post-images` 버킷 생성 완료
- [ ] Public 버킷으로 설정 완료
- [ ] 정책 설정 완료
- [ ] 테스트 파일 업로드 성공
- [ ] Public URL 생성 확인
- [ ] 환경 변수 설정 확인

---

**설정 완료 후**: 앱에서 글 제출 시 이미지 업로드 기능을 사용할 수 있습니다.
