-- =====================================================
-- Content Moderation Tables
-- =====================================================
-- Apple App Store Guideline 1.2 준수를 위한 테이블
-- - 콘텐츠 신고 (content_reports)
-- - 사용자 차단 (user_blocks)
-- =====================================================

-- =====================================================
-- 1. content_reports 테이블
-- =====================================================
-- 사용자가 부적절한 콘텐츠를 신고할 수 있는 테이블

CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 신고자 정보
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 신고 대상 콘텐츠 정보
  content_type TEXT NOT NULL CHECK (content_type IN ('answer', 'comment', 'meeting', 'profile')),
  content_id UUID NOT NULL,
  reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 신고 사유
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'hate_speech', 'violence', 'nsfw', 'misinformation', 'other')),
  description TEXT,

  -- 처리 상태
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),

  -- 관리자 처리 정보
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_content_reports_reporter ON content_reports(reporter_id);
CREATE INDEX idx_content_reports_reported_user ON content_reports(reported_user_id);
CREATE INDEX idx_content_reports_content ON content_reports(content_type, content_id);
CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_content_reports_created_at ON content_reports(created_at DESC);

-- Row Level Security 활성화
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신이 신고한 내용만 볼 수 있음
CREATE POLICY "Users can view their own reports"
  ON content_reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- RLS 정책: 모든 인증된 사용자는 신고를 생성할 수 있음
CREATE POLICY "Authenticated users can create reports"
  ON content_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- RLS 정책: 관리자는 모든 신고를 볼 수 있음
CREATE POLICY "Admins can view all reports"
  ON content_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS 정책: 관리자는 신고를 업데이트할 수 있음
CREATE POLICY "Admins can update reports"
  ON content_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- 2. user_blocks 테이블
-- =====================================================
-- 사용자가 다른 사용자를 차단할 수 있는 테이블

CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 차단한 사용자
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 차단당한 사용자
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 차단 사유 (선택)
  reason TEXT,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 중복 차단 방지 (한 사용자는 다른 사용자를 한 번만 차단)
  UNIQUE(blocker_id, blocked_id),

  -- 자기 자신을 차단할 수 없음
  CHECK (blocker_id != blocked_id)
);

-- 인덱스 생성
CREATE INDEX idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_id);

-- Row Level Security 활성화
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신이 차단한 목록만 볼 수 있음
CREATE POLICY "Users can view their own blocks"
  ON user_blocks FOR SELECT
  USING (auth.uid() = blocker_id);

-- RLS 정책: 사용자는 다른 사용자를 차단할 수 있음
CREATE POLICY "Users can block others"
  ON user_blocks FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

-- RLS 정책: 사용자는 자신의 차단을 해제할 수 있음
CREATE POLICY "Users can unblock others"
  ON user_blocks FOR DELETE
  USING (auth.uid() = blocker_id);

-- =====================================================
-- 3. 트리거: updated_at 자동 업데이트
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_reports_updated_at
  BEFORE UPDATE ON content_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. RPC 함수: report_content
-- =====================================================
-- 콘텐츠를 신고하는 함수

CREATE OR REPLACE FUNCTION report_content(
  p_reporter_id UUID,
  p_content_type TEXT,
  p_content_id UUID,
  p_reported_user_id UUID,
  p_reason TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_report_id UUID;
BEGIN
  -- 중복 신고 확인
  IF EXISTS (
    SELECT 1 FROM content_reports
    WHERE reporter_id = p_reporter_id
    AND content_type = p_content_type
    AND content_id = p_content_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', '이미 신고한 콘텐츠입니다'
    );
  END IF;

  -- 신고 생성
  INSERT INTO content_reports (
    reporter_id,
    content_type,
    content_id,
    reported_user_id,
    reason,
    description
  ) VALUES (
    p_reporter_id,
    p_content_type,
    p_content_id,
    p_reported_user_id,
    p_reason,
    p_description
  )
  RETURNING id INTO v_report_id;

  RETURN json_build_object(
    'success', true,
    'report_id', v_report_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION report_content(UUID, TEXT, UUID, UUID, TEXT, TEXT) TO authenticated;

-- =====================================================
-- 5. RPC 함수: block_user
-- =====================================================
-- 사용자를 차단하는 함수

CREATE OR REPLACE FUNCTION block_user(
  p_blocker_id UUID,
  p_blocked_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
  -- 자기 자신을 차단할 수 없음
  IF p_blocker_id = p_blocked_id THEN
    RETURN json_build_object(
      'success', false,
      'error', '자기 자신을 차단할 수 없습니다'
    );
  END IF;

  -- 이미 차단되어 있는지 확인
  IF EXISTS (
    SELECT 1 FROM user_blocks
    WHERE blocker_id = p_blocker_id
    AND blocked_id = p_blocked_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', '이미 차단한 사용자입니다'
    );
  END IF;

  -- 차단 생성
  INSERT INTO user_blocks (blocker_id, blocked_id, reason)
  VALUES (p_blocker_id, p_blocked_id, p_reason);

  RETURN json_build_object('success', true);

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION block_user(UUID, UUID, TEXT) TO authenticated;

-- =====================================================
-- 6. RPC 함수: unblock_user
-- =====================================================
-- 사용자 차단을 해제하는 함수

CREATE OR REPLACE FUNCTION unblock_user(
  p_blocker_id UUID,
  p_blocked_id UUID
)
RETURNS JSON AS $$
BEGIN
  DELETE FROM user_blocks
  WHERE blocker_id = p_blocker_id
  AND blocked_id = p_blocked_id;

  IF FOUND THEN
    RETURN json_build_object('success', true);
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', '차단 기록을 찾을 수 없습니다'
    );
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION unblock_user(UUID, UUID) TO authenticated;

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON TABLE content_reports IS '콘텐츠 신고 테이블. Apple Guideline 1.2 준수.';
COMMENT ON TABLE user_blocks IS '사용자 차단 테이블. Apple Guideline 1.2 준수.';
COMMENT ON FUNCTION report_content IS '콘텐츠를 신고합니다.';
COMMENT ON FUNCTION block_user IS '사용자를 차단합니다.';
COMMENT ON FUNCTION unblock_user IS '사용자 차단을 해제합니다.';
