-- get_today_question 함수 수정
-- 커스텀 인증에 맞게 user_id를 파라미터로 받도록 변경

DROP FUNCTION IF EXISTS get_today_question();

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
