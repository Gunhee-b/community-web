-- ============================================================
-- Rezom App - 사용자 차단 기능 구현을 위한 Supabase SQL
-- App Store 반려 해결 (Guideline 1.2 - User-Generated Content)
-- ============================================================

-- 1. user_blocks 테이블 생성
-- 사용자 차단 관계를 저장하는 테이블
CREATE TABLE IF NOT EXISTS user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 동일한 차단 관계 중복 방지
    UNIQUE(blocker_id, blocked_id),

    -- 자기 자신 차단 방지
    CHECK (blocker_id != blocked_id)
);

-- 2. 인덱스 추가 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_created_at ON user_blocks(created_at DESC);

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 삭제 (기존 정책이 있을 경우 충돌 방지)
DROP POLICY IF EXISTS "Users can view own blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can insert own blocks" ON user_blocks;
DROP POLICY IF EXISTS "Users can delete own blocks" ON user_blocks;

-- 5. RLS 정책 생성: 본인의 차단 목록만 조회/수정 가능
CREATE POLICY "Users can view own blocks" ON user_blocks
    FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users can insert own blocks" ON user_blocks
    FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete own blocks" ON user_blocks
    FOR DELETE USING (auth.uid() = blocker_id);

-- ============================================================
-- 6. 기존 RPC 함수 삭제 (있는 경우)
-- ============================================================
DROP FUNCTION IF EXISTS block_user(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS unblock_user(UUID, UUID);
DROP FUNCTION IF EXISTS get_blocked_user_ids(UUID);

-- ============================================================
-- 7. RPC 함수: 사용자 차단
-- ============================================================
CREATE OR REPLACE FUNCTION block_user(
    p_blocker_id UUID,
    p_blocked_id UUID,
    p_reason TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- 자기 자신 차단 방지
    IF p_blocker_id = p_blocked_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', '자기 자신을 차단할 수 없습니다'
        );
    END IF;

    -- 이미 차단된 사용자인지 확인
    IF EXISTS (
        SELECT 1 FROM user_blocks
        WHERE blocker_id = p_blocker_id AND blocked_id = p_blocked_id
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', '이미 차단한 사용자입니다'
        );
    END IF;

    -- 차단 관계 추가
    INSERT INTO user_blocks (blocker_id, blocked_id, reason)
    VALUES (p_blocker_id, p_blocked_id, p_reason);

    RETURN jsonb_build_object(
        'success', true
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. RPC 함수: 사용자 차단 해제
-- ============================================================
CREATE OR REPLACE FUNCTION unblock_user(
    p_blocker_id UUID,
    p_blocked_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- 차단 관계 삭제
    DELETE FROM user_blocks
    WHERE blocker_id = p_blocker_id AND blocked_id = p_blocked_id;

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    IF v_deleted_count = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', '차단되지 않은 사용자입니다'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 9. RPC 함수: 차단된 사용자 ID 목록 조회 (필터링용)
-- ============================================================
CREATE OR REPLACE FUNCTION get_blocked_user_ids(p_user_id UUID)
RETURNS UUID[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT blocked_id
        FROM user_blocks
        WHERE blocker_id = p_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 10. 기존 데이터 정리 (선택사항)
-- ============================================================
-- 만약 테스트 데이터가 있다면 아래 주석을 해제하여 실행
-- DELETE FROM user_blocks;

-- ============================================================
-- 11. 완료 메시지
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '사용자 차단 기능 설정이 완료되었습니다!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'user_blocks 테이블 생성 완료';
    RAISE NOTICE 'RPC 함수 생성 완료:';
    RAISE NOTICE '  - block_user(p_blocker_id, p_blocked_id, p_reason)';
    RAISE NOTICE '  - unblock_user(p_blocker_id, p_blocked_id)';
    RAISE NOTICE '  - get_blocked_user_ids(p_user_id)';
    RAISE NOTICE '========================================';
END $$;
