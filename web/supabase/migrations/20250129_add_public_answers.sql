-- 질문에 대한 공개 답변 기능 추가
-- 작성일: 2025-01-29
-- 설명: 사용자가 질문에 공개 답변을 작성하고, 다른 사용자의 답변을 보고 댓글을 달 수 있는 기능

-- 1. 공개 답변 테이블 (question_answers)
CREATE TABLE IF NOT EXISTS question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES daily_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL, -- 답변 내용
  is_public BOOLEAN DEFAULT true, -- 공개 여부
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id) -- 한 질문당 한 개의 답변만 작성 가능
);

-- 2. 답변 댓글 테이블 (answer_comments)
CREATE TABLE IF NOT EXISTS answer_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID NOT NULL REFERENCES question_answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL, -- 댓글 내용
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_question_answers_question_id ON question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_user_id ON question_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_created_at ON question_answers(created_at);
CREATE INDEX IF NOT EXISTS idx_answer_comments_answer_id ON answer_comments(answer_id);
CREATE INDEX IF NOT EXISTS idx_answer_comments_user_id ON answer_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_comments_created_at ON answer_comments(created_at);

-- RLS 비활성화 (커스텀 세션 기반 인증 사용)
ALTER TABLE question_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE answer_comments DISABLE ROW LEVEL SECURITY;

-- Trigger: updated_at 자동 업데이트
CREATE TRIGGER update_question_answers_updated_at
  BEFORE UPDATE ON question_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answer_comments_updated_at
  BEFORE UPDATE ON answer_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 코멘트 추가
COMMENT ON TABLE question_answers IS '질문에 대한 공개 답변 테이블';
COMMENT ON TABLE answer_comments IS '답변에 대한 댓글 테이블';
COMMENT ON COLUMN question_answers.is_public IS '공개 여부 (기본값: true)';
