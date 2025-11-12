-- ============================================================================
-- 모든 문제 해결: 삭제 시스템 완전 수정
-- ============================================================================

-- STEP 1: 닉네임 UNIQUE 제약 문제 해결
-- ============================================================================

-- 기존 UNIQUE 제약 제거
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_kakao_nickname_key;

-- 부분 UNIQUE 인덱스 생성 (deleted_at IS NULL인 활성 사용자만)
DROP INDEX IF EXISTS users_username_unique_active;
DROP INDEX IF EXISTS users_kakao_nickname_unique_active;

CREATE UNIQUE INDEX users_username_unique_active
ON users(username)
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX users_kakao_nickname_unique_active
ON users(kakao_nickname)
WHERE deleted_at IS NULL;

-- 이제 삭제된 사용자의 닉네임은 중복 가능하므로, 새 사용자가 같은 닉네임을 사용할 수 있음

-- STEP 2: admin_get_all_users_secure 함수 수정
-- ============================================================================

DROP FUNCTION IF EXISTS admin_get_all_users_secure(UUID);

CREATE OR REPLACE FUNCTION admin_get_all_users_secure(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM users
        WHERE id = p_user_id
        AND role = 'admin'
        AND is_active = true
        AND deleted_at IS NULL  -- Admin must not be deleted
    ) THEN
        RAISE EXCEPTION 'Only active admins can view users';
    END IF;

    -- Return all users (admins can see deleted users too, but we'll filter in frontend)
    SELECT COALESCE(json_agg(row_to_json(t.*)), '[]'::json)::jsonb INTO v_result
    FROM (
        SELECT
            id,
            username,
            email,
            kakao_nickname,
            role,
            is_active,
            created_at,
            deleted_at,
            deleted_by,
            last_login,
            avatar_url,
            provider
        FROM users
        ORDER BY created_at DESC
    ) t;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION admin_get_all_users_secure(UUID) TO authenticated;

-- STEP 3: soft_delete_user 함수 개선 (더 명확한 에러 메시지)
-- ============================================================================

DROP FUNCTION IF EXISTS soft_delete_user(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION soft_delete_user(
    p_user_id UUID,
    p_admin_user_id UUID,
    p_deletion_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_admin users;
    v_user users;
    v_archive_id UUID;
    v_user_data JSONB;
    v_invitation_codes JSONB;
    v_posts JSONB;
    v_votes JSONB;
    v_comments JSONB;
    v_meetings JSONB;
    v_participations JSONB;
    v_chats JSONB;
    v_questions JSONB;
BEGIN
    -- Check if admin exists and is admin
    SELECT * INTO v_admin FROM users WHERE id = p_admin_user_id AND deleted_at IS NULL;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Admin user not found or deleted'
        );
    END IF;

    IF v_admin.role != 'admin' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Only admins can delete users'
        );
    END IF;

    -- Prevent self-deletion
    IF p_user_id = p_admin_user_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Cannot delete your own account'
        );
    END IF;

    -- Check if user exists
    SELECT * INTO v_user FROM users WHERE id = p_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;

    -- Check if already deleted
    IF v_user.deleted_at IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User is already deleted',
            'deleted_at', v_user.deleted_at,
            'deleted_by', v_user.deleted_by
        );
    END IF;

    -- Backup all user data
    SELECT row_to_json(u.*) INTO v_user_data
    FROM users u WHERE u.id = p_user_id;

    SELECT COALESCE(json_agg(row_to_json(ic.*)), '[]'::json) INTO v_invitation_codes
    FROM invitation_codes ic WHERE ic.used_by = p_user_id;

    SELECT COALESCE(json_agg(row_to_json(p.*)), '[]'::json) INTO v_posts
    FROM posts_nominations p WHERE p.nominator_id = p_user_id;

    SELECT COALESCE(json_agg(row_to_json(v.*)), '[]'::json) INTO v_votes
    FROM votes v WHERE v.user_id = p_user_id;

    SELECT COALESCE(json_agg(row_to_json(c.*)), '[]'::json) INTO v_comments
    FROM post_comments c WHERE c.user_id = p_user_id;

    SELECT COALESCE(json_agg(row_to_json(m.*)), '[]'::json) INTO v_meetings
    FROM offline_meetings m WHERE m.host_id = p_user_id;

    SELECT COALESCE(json_agg(row_to_json(mp.*)), '[]'::json) INTO v_participations
    FROM meeting_participants mp WHERE mp.user_id = p_user_id;

    SELECT COALESCE(json_agg(row_to_json(mc.*)), '[]'::json) INTO v_chats
    FROM meeting_chats mc WHERE mc.user_id = p_user_id;

    BEGIN
        SELECT COALESCE(json_agg(row_to_json(a.*)), '[]'::json) INTO v_questions
        FROM daily_question_answers a WHERE a.user_id = p_user_id;
    EXCEPTION
        WHEN undefined_table THEN
            v_questions := '[]'::json;
    END;

    -- Create archive record
    INSERT INTO deleted_users_archive (
        user_id,
        user_data,
        invitation_codes_data,
        posts_data,
        votes_data,
        comments_data,
        meetings_hosted_data,
        meeting_participations_data,
        chat_messages_data,
        questions_data,
        deleted_by,
        deletion_reason
    ) VALUES (
        p_user_id,
        v_user_data,
        v_invitation_codes,
        v_posts,
        v_votes,
        v_comments,
        v_meetings,
        v_participations,
        v_chats,
        v_questions,
        p_admin_user_id,
        p_deletion_reason
    ) RETURNING id INTO v_archive_id;

    -- Clear invitation codes foreign key
    UPDATE invitation_codes
    SET used_by = NULL
    WHERE used_by = p_user_id;

    -- Soft delete the user
    UPDATE users
    SET
        deleted_at = timezone('Asia/Seoul', NOW()),
        deleted_by = p_admin_user_id,
        is_active = false
    WHERE id = p_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'User soft deleted and archived successfully',
        'archive_id', v_archive_id,
        'user_id', p_user_id,
        'username', v_user.username
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION soft_delete_user(UUID, UUID, TEXT) TO authenticated;

-- STEP 4: restore_deleted_user 함수 개선
-- ============================================================================

DROP FUNCTION IF EXISTS restore_deleted_user(UUID, UUID);

CREATE OR REPLACE FUNCTION restore_deleted_user(
    p_user_id UUID,
    p_admin_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_admin users;
    v_user users;
BEGIN
    -- Check if admin exists and is admin
    SELECT * INTO v_admin FROM users WHERE id = p_admin_user_id AND deleted_at IS NULL;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Admin user not found or deleted'
        );
    END IF;

    IF v_admin.role != 'admin' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Only admins can restore users'
        );
    END IF;

    -- Check if user exists
    SELECT * INTO v_user FROM users WHERE id = p_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found'
        );
    END IF;

    -- Check if user is actually deleted
    IF v_user.deleted_at IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User is not deleted'
        );
    END IF;

    -- Restore user
    UPDATE users
    SET
        deleted_at = NULL,
        deleted_by = NULL,
        is_active = true
    WHERE id = p_user_id;

    -- Update archive record
    UPDATE deleted_users_archive
    SET
        restored_at = timezone('Asia/Seoul', NOW()),
        restored_by = p_admin_user_id
    WHERE id = (
        SELECT id
        FROM deleted_users_archive
        WHERE user_id = p_user_id
        AND restored_at IS NULL
        ORDER BY deleted_at DESC
        LIMIT 1
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'User restored successfully',
        'user_id', p_user_id,
        'username', v_user.username
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION restore_deleted_user(UUID, UUID) TO authenticated;

-- STEP 5: get_deleted_users 함수 (이미 수정됨)
-- ============================================================================

DROP FUNCTION IF EXISTS get_deleted_users(UUID);

CREATE OR REPLACE FUNCTION get_deleted_users(p_admin_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Check if admin
    IF NOT EXISTS (
        SELECT 1 FROM users
        WHERE id = p_admin_user_id
        AND role = 'admin'
        AND is_active = true
        AND deleted_at IS NULL
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Only active admins can view deleted users'
        );
    END IF;

    -- Get deleted users as JSONB array
    SELECT COALESCE(json_agg(row_to_json(t.*)), '[]'::json)::jsonb INTO v_result
    FROM (
        SELECT
            u.id as user_id,
            u.username,
            u.email,
            u.role,
            u.deleted_at,
            deleter.username as deleted_by_username,
            a.deletion_reason,
            true as can_restore
        FROM users u
        LEFT JOIN users deleter ON u.deleted_by = deleter.id
        LEFT JOIN LATERAL (
            SELECT deletion_reason
            FROM deleted_users_archive
            WHERE user_id = u.id
            ORDER BY deleted_at DESC
            LIMIT 1
        ) a ON true
        WHERE u.deleted_at IS NOT NULL
        ORDER BY u.deleted_at DESC
    ) t;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_deleted_users(UUID) TO authenticated;

-- STEP 6: 데이터 정리 (이미 deleted_at이 설정된 데이터가 있다면)
-- ============================================================================

-- 혹시 이미 deleted_at이 설정되었는데 Archive가 없는 경우를 위한 정리
-- (선택사항: 필요시 주석 해제)

/*
-- Archive 레코드가 없는 삭제된 사용자를 위한 백업 생성
INSERT INTO deleted_users_archive (
    user_id,
    user_data,
    deleted_by,
    deleted_at,
    deletion_reason
)
SELECT
    u.id,
    row_to_json(u.*)::jsonb,
    u.deleted_by,
    u.deleted_at,
    'Migrated from existing deleted users'
FROM users u
WHERE u.deleted_at IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM deleted_users_archive da
    WHERE da.user_id = u.id
);
*/

-- 완료 메시지
SELECT '✅ All issues fixed! Username unique constraint updated, functions improved with better error handling.' as result;
