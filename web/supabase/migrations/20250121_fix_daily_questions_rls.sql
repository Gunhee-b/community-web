-- 오늘의 질문 RLS 정책 수정
-- 커스텀 인증 시스템에 맞게 RLS 정책 재설정

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view published questions" ON daily_questions;
DROP POLICY IF EXISTS "Admins can view all questions" ON daily_questions;
DROP POLICY IF EXISTS "Admins can insert questions" ON daily_questions;
DROP POLICY IF EXISTS "Admins can update questions" ON daily_questions;
DROP POLICY IF EXISTS "Admins can delete questions" ON daily_questions;

DROP POLICY IF EXISTS "Users can view own checks" ON question_checks;
DROP POLICY IF EXISTS "Users can create own checks" ON question_checks;
DROP POLICY IF EXISTS "Users can update own checks" ON question_checks;
DROP POLICY IF EXISTS "Users can delete own checks" ON question_checks;

DROP POLICY IF EXISTS "Users can view own stats" ON challenge_stats;
DROP POLICY IF EXISTS "Users can create own stats" ON challenge_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON challenge_stats;

-- RLS 비활성화 (커스텀 인증 시스템 사용)
ALTER TABLE daily_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_checks DISABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_stats DISABLE ROW LEVEL SECURITY;

-- 대신 애플리케이션 레벨에서 권한 검증
COMMENT ON TABLE daily_questions IS '오늘의 질문 테이블 - 애플리케이션 레벨에서 권한 관리';
COMMENT ON TABLE question_checks IS '사용자 질문 체크 테이블 - 애플리케이션 레벨에서 권한 관리';
COMMENT ON TABLE challenge_stats IS '90-Day 챌린지 통계 테이블 - 애플리케이션 레벨에서 권한 관리';
