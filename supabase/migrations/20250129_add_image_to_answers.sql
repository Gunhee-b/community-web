-- 답변에 이미지 업로드 기능 추가
-- 작성일: 2025-01-29
-- 설명: 사용자가 답변 작성 시 텍스트 대신 또는 함께 이미지를 업로드할 수 있는 기능

-- question_answers 테이블에 image_url 컬럼 추가
ALTER TABLE question_answers
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 코멘트 추가
COMMENT ON COLUMN question_answers.image_url IS '답변 이미지 URL (Supabase Storage)';

-- content를 선택 사항으로 변경 (이미지만 업로드 가능하도록)
-- PostgreSQL에서는 NOT NULL 제약 조건을 제거해야 함
ALTER TABLE question_answers
ALTER COLUMN content DROP NOT NULL;

-- 최소한 하나는 있어야 함 (content 또는 image_url)
ALTER TABLE question_answers
ADD CONSTRAINT check_content_or_image
CHECK (
  (content IS NOT NULL AND LENGTH(TRIM(content)) >= 10) OR
  (image_url IS NOT NULL)
);

COMMENT ON CONSTRAINT check_content_or_image ON question_answers IS '답변은 최소 10자 이상의 텍스트 또는 이미지를 포함해야 함';
