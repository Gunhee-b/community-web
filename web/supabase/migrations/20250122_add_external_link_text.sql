-- 외부 링크 텍스트 필드 추가
-- 작성일: 2025-01-22
-- 목적: 관리자가 외부 링크에 대한 표시 텍스트를 지정할 수 있도록 함

-- external_link_text 컬럼 추가
ALTER TABLE daily_questions
ADD COLUMN IF NOT EXISTS external_link_text TEXT;

-- 코멘트 추가
COMMENT ON COLUMN daily_questions.external_link_text IS '외부 링크에 표시할 텍스트 (예: "원문 보기", "관련 자료")';
