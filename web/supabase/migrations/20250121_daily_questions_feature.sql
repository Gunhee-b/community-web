-- 오늘의 질문 기능 추가
-- 작성일: 2025-01-21

-- 1. 질문 테이블 (daily_questions)
CREATE TABLE IF NOT EXISTS daily_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  short_description TEXT NOT NULL, -- 배너용 짧은 설명 (100자 이내)
  content TEXT NOT NULL, -- 상세 내용 (마크다운 지원)
  image_url TEXT, -- 질문 이미지 URL
  external_link TEXT, -- 외부 링크
  reference_links TEXT, -- 참고 문헌 (JSON 형태로 저장)
  scheduled_date DATE NOT NULL, -- 노출 예약 날짜
  is_published BOOLEAN DEFAULT false, -- 발행 여부
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 사용자 체크 테이블 (question_checks)
CREATE TABLE IF NOT EXISTS question_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES daily_questions(id) ON DELETE CASCADE,
  is_checked BOOLEAN DEFAULT true,
  user_answer TEXT, -- 사용자의 답변 (선택사항)
  user_note TEXT, -- 사용자의 메모 (선택사항)
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- 3. 챌린지 통계 테이블 (challenge_stats)
CREATE TABLE IF NOT EXISTS challenge_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_checks INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0, -- 연속 참여 일수
  longest_streak INTEGER DEFAULT 0, -- 최장 연속 일수
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ, -- 90개 완료 시 기록
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_daily_questions_scheduled_date ON daily_questions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_daily_questions_is_published ON daily_questions(is_published);
CREATE INDEX IF NOT EXISTS idx_question_checks_user_id ON question_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_question_checks_question_id ON question_checks(question_id);
CREATE INDEX IF NOT EXISTS idx_question_checks_checked_at ON question_checks(checked_at);
CREATE INDEX IF NOT EXISTS idx_challenge_stats_user_id ON challenge_stats(user_id);

-- RLS (Row Level Security) 비활성화
-- 이 프로젝트는 커스텀 세션 기반 인증을 사용하므로 RLS를 사용하지 않음
-- 대신 애플리케이션 레벨에서 권한을 관리함
ALTER TABLE daily_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_checks DISABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_stats DISABLE ROW LEVEL SECURITY;

-- Trigger: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_questions_updated_at
  BEFORE UPDATE ON daily_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_checks_updated_at
  BEFORE UPDATE ON question_checks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenge_stats_updated_at
  BEFORE UPDATE ON challenge_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function: 오늘의 질문 가져오기
-- user_id를 파라미터로 받도록 수정 (커스텀 인증 대응)
CREATE OR REPLACE FUNCTION get_today_question(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  short_description TEXT,
  content TEXT,
  image_url TEXT,
  external_link TEXT,
  reference_links TEXT,
  scheduled_date DATE,
  is_checked BOOLEAN,
  user_answer TEXT,
  user_note TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dq.id,
    dq.title,
    dq.short_description,
    dq.content,
    dq.image_url,
    dq.external_link,
    dq.reference_links,
    dq.scheduled_date,
    COALESCE(qc.is_checked, false) as is_checked,
    qc.user_answer,
    qc.user_note
  FROM daily_questions dq
  LEFT JOIN question_checks qc ON dq.id = qc.question_id AND qc.user_id = p_user_id
  WHERE dq.scheduled_date = CURRENT_DATE
    AND dq.is_published = true
  ORDER BY dq.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: 챌린지 통계 업데이트
CREATE OR REPLACE FUNCTION update_challenge_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_total_checks INTEGER;
  v_last_check_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  -- 총 체크 수 계산
  SELECT COUNT(DISTINCT question_id) INTO v_total_checks
  FROM question_checks
  WHERE user_id = NEW.user_id AND is_checked = true;

  -- 마지막 체크 날짜
  SELECT MAX(DATE(checked_at)) INTO v_last_check_date
  FROM question_checks
  WHERE user_id = NEW.user_id AND is_checked = true AND question_id != NEW.question_id;

  -- 연속 일수 계산
  IF v_last_check_date IS NULL THEN
    v_current_streak := 1;
  ELSIF DATE(NEW.checked_at) - v_last_check_date = 1 THEN
    -- 연속된 날짜
    SELECT current_streak + 1 INTO v_current_streak
    FROM challenge_stats
    WHERE user_id = NEW.user_id;
  ELSIF DATE(NEW.checked_at) = v_last_check_date THEN
    -- 같은 날짜
    SELECT current_streak INTO v_current_streak
    FROM challenge_stats
    WHERE user_id = NEW.user_id;
  ELSE
    -- 연속이 끊김
    v_current_streak := 1;
  END IF;

  -- challenge_stats 업데이트 또는 생성
  INSERT INTO challenge_stats (user_id, total_checks, current_streak, longest_streak, completed_at)
  VALUES (
    NEW.user_id,
    v_total_checks,
    v_current_streak,
    GREATEST(v_current_streak, 0),
    CASE WHEN v_total_checks >= 90 THEN NOW() ELSE NULL END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_checks = v_total_checks,
    current_streak = v_current_streak,
    longest_streak = GREATEST(challenge_stats.longest_streak, v_current_streak),
    completed_at = CASE WHEN v_total_checks >= 90 AND challenge_stats.completed_at IS NULL THEN NOW() ELSE challenge_stats.completed_at END,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: 체크 시 챌린지 통계 자동 업데이트
CREATE TRIGGER trigger_update_challenge_stats
  AFTER INSERT OR UPDATE ON question_checks
  FOR EACH ROW
  WHEN (NEW.is_checked = true)
  EXECUTE FUNCTION update_challenge_stats();

-- 코멘트 추가
COMMENT ON TABLE daily_questions IS '오늘의 질문 테이블';
COMMENT ON TABLE question_checks IS '사용자 질문 체크 테이블';
COMMENT ON TABLE challenge_stats IS '90-Day 챌린지 통계 테이블';
