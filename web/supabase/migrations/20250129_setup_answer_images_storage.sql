-- 답변 이미지를 위한 Supabase Storage 정책 설정
-- 작성일: 2025-01-29
--
-- 주의: 이 파일을 실행하기 전에 Supabase Dashboard의 Storage UI에서
-- 'answer-images' 버킷을 먼저 생성해야 합니다.
--
-- 버킷 생성 방법:
-- 1. Supabase Dashboard → Storage
-- 2. "New bucket" 클릭
-- 3. Name: answer-images
-- 4. Public bucket: 체크 ✅
-- 5. "Create bucket" 클릭
--
-- 자세한 내용은 STORAGE_SETUP_MANUAL.md 참고

-- Storage 정책 설정 (버킷이 이미 생성된 후 실행)

-- 기존 정책이 있다면 먼저 삭제 (에러가 나도 계속 진행)
DROP POLICY IF EXISTS "Authenticated users can upload answer images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view answer images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own answer images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own answer images" ON storage.objects;

-- 업로드 정책: 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload answer images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'answer-images'
);

-- 읽기 정책: 모든 사용자가 이미지 조회 가능 (public 버킷)
CREATE POLICY "Anyone can view answer images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'answer-images'
);

-- 업데이트 정책: 자신이 업로드한 이미지만 수정 가능
CREATE POLICY "Users can update their own answer images"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'answer-images'
);

-- 삭제 정책: 자신이 업로드한 이미지만 삭제 가능
CREATE POLICY "Users can delete their own answer images"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'answer-images'
);

-- 확인 쿼리 (선택사항)
-- SELECT * FROM storage.buckets WHERE id = 'answer-images';
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects' AND qual LIKE '%answer-images%';
