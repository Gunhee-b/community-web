-- 답변에 두 번째 이미지 추가
-- 작성일: 2025-01-29
-- 설명: 사용자가 답변에 최대 2장의 이미지를 업로드할 수 있도록 기능 추가

-- question_answers 테이블에 두 번째 이미지 컬럼 추가
ALTER TABLE question_answers
ADD COLUMN IF NOT EXISTS image_url_2 TEXT;

-- 코멘트 추가
COMMENT ON COLUMN question_answers.image_url_2 IS '두 번째 답변 이미지 URL (Supabase Storage)';

-- 기존 제약 조건 삭제
ALTER TABLE question_answers
DROP CONSTRAINT IF EXISTS check_content_or_image;

-- 새로운 제약 조건: 텍스트 또는 이미지(1장 또는 2장) 중 하나는 필수
ALTER TABLE question_answers
ADD CONSTRAINT check_content_or_images
CHECK (
  (content IS NOT NULL AND LENGTH(TRIM(content)) >= 10) OR
  (image_url IS NOT NULL) OR
  (image_url_2 IS NOT NULL)
);

COMMENT ON CONSTRAINT check_content_or_images ON question_answers IS '답변은 최소 10자 이상의 텍스트 또는 이미지(1장 또는 2장)를 포함해야 함';
