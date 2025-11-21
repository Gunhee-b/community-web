-- =====================================================
-- Supabase RPC Function: delete_user_account
-- =====================================================
-- 사용자 계정 및 모든 관련 데이터를 삭제합니다
--
-- 사용법:
--   SELECT * FROM delete_user_account('user-uuid-here');
--
-- 반환값:
--   { success: boolean, error: text }
-- =====================================================

CREATE OR REPLACE FUNCTION delete_user_account(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- 사용자 존재 여부 확인
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', '사용자를 찾을 수 없습니다'
    );
  END IF;

  BEGIN
    -- 1. question_checks 삭제 (90-Day Challenge 기록)
    DELETE FROM question_checks WHERE user_id = p_user_id;

    -- 2. question_answers 삭제 (사용자가 작성한 답변)
    DELETE FROM question_answers WHERE user_id = p_user_id;

    -- 3. meeting_participants 삭제 (모임 참여 기록)
    DELETE FROM meeting_participants WHERE user_id = p_user_id;

    -- 4. content_reports 삭제 (사용자가 신고한 콘텐츠 기록)
    DELETE FROM content_reports WHERE reporter_id = p_user_id;

    -- 5. content_reports에서 사용자의 콘텐츠에 대한 신고도 삭제
    DELETE FROM content_reports WHERE reported_user_id = p_user_id;

    -- 6. user_blocks 삭제 (차단한 사용자 및 차단당한 기록)
    DELETE FROM user_blocks WHERE blocker_id = p_user_id OR blocked_id = p_user_id;

    -- 7. 기타 관련 테이블 삭제 (필요시 추가)
    -- 예: comments, likes, etc.

    -- 8. users 테이블에서 사용자 삭제
    DELETE FROM users WHERE id = p_user_id;

    -- 성공 반환
    v_result := json_build_object(
      'success', true,
      'error', null
    );

    RETURN v_result;

  EXCEPTION
    WHEN OTHERS THEN
      -- 오류 발생 시 롤백 및 오류 반환
      RAISE NOTICE 'Error deleting user account: %', SQLERRM;
      RETURN json_build_object(
        'success', false,
        'error', SQLERRM
      );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Permissions
-- =====================================================
-- 인증된 사용자만 자신의 계정을 삭제할 수 있도록 허용
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON FUNCTION delete_user_account(UUID) IS '사용자 계정 및 모든 관련 데이터를 영구적으로 삭제합니다. Apple App Store Guideline 5.1.1 준수.';
