-- ============================================================
-- 간단한 버전: 사용자 차단 기능 설정
-- 오류 발생 시 단계별로 실행하세요
-- ============================================================

-- ============================================================
-- 1단계: 테이블 생성
-- ============================================================
CREATE TABLE user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(blocker_id, blocked_id),
    CHECK (blocker_id != blocked_id)
);

-- ============================================================
-- 2단계: 인덱스 생성
-- ============================================================
CREATE INDEX idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_id);

-- ============================================================
-- 3단계: RLS 활성화 및 정책 설정
-- ============================================================
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blocks" ON user_blocks
    FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users can insert own blocks" ON user_blocks
    FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete own blocks" ON user_blocks
    FOR DELETE USING (auth.uid() = blocker_id);

-- ============================================================
-- 4단계: block_user 함수
-- ============================================================
CREATE OR REPLACE FUNCTION block_user(
    p_blocker_id UUID,
    p_blocked_id UUID,
    p_reason TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 자기 자신 차단 방지
    IF p_blocker_id = p_blocked_id THEN
        RETURN jsonb_build_object('success', false, 'error', '자기 자신을 차단할 수 없습니다');
    END IF;

    -- 이미 차단된 사용자인지 확인
    IF EXISTS (SELECT 1 FROM user_blocks WHERE blocker_id = p_blocker_id AND blocked_id = p_blocked_id) THEN
        RETURN jsonb_build_object('success', false, 'error', '이미 차단한 사용자입니다');
    END IF;

    -- 차단 관계 추가
    INSERT INTO user_blocks (blocker_id, blocked_id, reason)
    VALUES (p_blocker_id, p_blocked_id, p_reason);

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================================
-- 5단계: unblock_user 함수
-- ============================================================
CREATE OR REPLACE FUNCTION unblock_user(
    p_blocker_id UUID,
    p_blocked_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM user_blocks
    WHERE blocker_id = p_blocker_id AND blocked_id = p_blocked_id;

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    IF v_deleted_count = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', '차단되지 않은 사용자입니다');
    END IF;

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================================
-- 6단계: get_blocked_user_ids 함수
-- ============================================================
CREATE OR REPLACE FUNCTION get_blocked_user_ids(p_user_id UUID)
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN ARRAY(
        SELECT blocked_id FROM user_blocks WHERE blocker_id = p_user_id
    );
END;
$$;

-- 완료!
SELECT '사용자 차단 기능 설정 완료!' as message;
