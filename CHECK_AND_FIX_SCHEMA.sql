-- ============================================================
-- 1단계: 어디에 테이블이 있는지 확인
-- ============================================================

-- 모든 스키마에서 user_blocks 테이블 찾기
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename = 'user_blocks';

-- 위 쿼리 결과를 확인하세요!
-- schemaname이 'public'이 아니면 문제입니다.

-- ============================================================
-- 2단계: 잘못된 스키마의 테이블 삭제
-- ============================================================

-- 만약 다른 스키마에 있다면 완전히 삭제
DROP TABLE IF EXISTS user_blocks CASCADE;
DROP TABLE IF EXISTS public.user_blocks CASCADE;
DROP TABLE IF EXISTS auth.user_blocks CASCADE;

-- 함수도 삭제
DROP FUNCTION IF EXISTS block_user CASCADE;
DROP FUNCTION IF EXISTS unblock_user CASCADE;
DROP FUNCTION IF EXISTS get_blocked_user_ids CASCADE;

-- ============================================================
-- 3단계: public 스키마에 명시적으로 생성
-- ============================================================

-- 테이블 생성 (public 스키마 명시)
CREATE TABLE public.user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(blocker_id, blocked_id),
    CHECK (blocker_id != blocked_id)
);

-- 인덱스 생성
CREATE INDEX idx_user_blocks_blocker ON public.user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON public.user_blocks(blocked_id);

-- RLS 활성화
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Users can view own blocks" ON public.user_blocks
    FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "Users can insert own blocks" ON public.user_blocks
    FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete own blocks" ON public.user_blocks
    FOR DELETE USING (auth.uid() = blocker_id);

-- ============================================================
-- 4단계: 함수 생성
-- ============================================================

CREATE OR REPLACE FUNCTION public.block_user(
    p_blocker_id UUID,
    p_blocked_id UUID,
    p_reason TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_blocker_id = p_blocked_id THEN
        RETURN jsonb_build_object('success', false, 'error', '자기 자신을 차단할 수 없습니다');
    END IF;

    IF EXISTS (SELECT 1 FROM public.user_blocks WHERE blocker_id = p_blocker_id AND blocked_id = p_blocked_id) THEN
        RETURN jsonb_build_object('success', false, 'error', '이미 차단한 사용자입니다');
    END IF;

    INSERT INTO public.user_blocks (blocker_id, blocked_id, reason)
    VALUES (p_blocker_id, p_blocked_id, p_reason);

    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

CREATE OR REPLACE FUNCTION public.unblock_user(
    p_blocker_id UUID,
    p_blocked_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM public.user_blocks
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

CREATE OR REPLACE FUNCTION public.get_blocked_user_ids(p_user_id UUID)
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN ARRAY(SELECT blocked_id FROM public.user_blocks WHERE blocker_id = p_user_id);
END;
$$;

-- ============================================================
-- 5단계: 확인
-- ============================================================

-- 테이블 확인
SELECT 'user_blocks 테이블 생성 완료!' as status;

-- 모든 user_blocks 테이블 위치 확인
SELECT schemaname, tablename FROM pg_tables WHERE tablename = 'user_blocks';

-- 함수 확인
SELECT
    proname as function_name,
    nspname as schema_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE proname IN ('block_user', 'unblock_user', 'get_blocked_user_ids');
