-- ============================================================================
-- 빠른 수정: 기존 함수 제거 후 새로운 시스템 적용
-- ============================================================================

-- STEP 1: 기존 함수들 모두 제거
DROP FUNCTION IF EXISTS get_deleted_users(UUID);
DROP FUNCTION IF EXISTS soft_delete_user(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS restore_deleted_user(UUID, UUID);
DROP FUNCTION IF EXISTS permanently_delete_user(UUID, UUID, BOOLEAN);
DROP FUNCTION IF EXISTS delete_user_permanently(UUID, UUID);

-- STEP 2: users 테이블에 컬럼 추가
ALTER TABLE users
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;

-- STEP 3: Archive 테이블 생성
CREATE TABLE IF NOT EXISTS deleted_users_archive (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    user_data JSONB NOT NULL,
    invitation_codes_data JSONB,
    posts_data JSONB,
    votes_data JSONB,
    comments_data JSONB,
    meetings_hosted_data JSONB,
    meeting_participations_data JSONB,
    chat_messages_data JSONB,
    questions_data JSONB,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Seoul', NOW()) NOT NULL,
    deletion_reason TEXT,
    restored_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    restored_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Seoul', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_archive_user_id ON deleted_users_archive(user_id);
CREATE INDEX IF NOT EXISTS idx_archive_deleted_at ON deleted_users_archive(deleted_at);

-- STEP 4: soft_delete_user 함수
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
    SELECT * INTO v_admin FROM users WHERE id = p_admin_user_id;
    IF NOT FOUND OR v_admin.role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can delete users';
    END IF;

    IF p_user_id = p_admin_user_id THEN
        RAISE EXCEPTION 'Cannot delete your own account';
    END IF;

    SELECT * INTO v_user FROM users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF v_user.deleted_at IS NOT NULL THEN
        RAISE EXCEPTION 'User is already deleted';
    END IF;

    -- Backup data
    SELECT row_to_json(u.*) INTO v_user_data FROM users u WHERE u.id = p_user_id;
    SELECT COALESCE(json_agg(row_to_json(ic.*)), '[]'::json) INTO v_invitation_codes FROM invitation_codes ic WHERE ic.used_by = p_user_id;
    SELECT COALESCE(json_agg(row_to_json(p.*)), '[]'::json) INTO v_posts FROM posts_nominations p WHERE p.nominator_id = p_user_id;
    SELECT COALESCE(json_agg(row_to_json(v.*)), '[]'::json) INTO v_votes FROM votes v WHERE v.user_id = p_user_id;
    SELECT COALESCE(json_agg(row_to_json(c.*)), '[]'::json) INTO v_comments FROM post_comments c WHERE c.user_id = p_user_id;
    SELECT COALESCE(json_agg(row_to_json(m.*)), '[]'::json) INTO v_meetings FROM offline_meetings m WHERE m.host_id = p_user_id;
    SELECT COALESCE(json_agg(row_to_json(mp.*)), '[]'::json) INTO v_participations FROM meeting_participants mp WHERE mp.user_id = p_user_id;
    SELECT COALESCE(json_agg(row_to_json(mc.*)), '[]'::json) INTO v_chats FROM meeting_chats mc WHERE mc.user_id = p_user_id;

    BEGIN
        SELECT COALESCE(json_agg(row_to_json(a.*)), '[]'::json) INTO v_questions FROM daily_question_answers a WHERE a.user_id = p_user_id;
    EXCEPTION
        WHEN undefined_table THEN
            v_questions := '[]'::json;
    END;

    -- Archive
    INSERT INTO deleted_users_archive (
        user_id, user_data, invitation_codes_data, posts_data, votes_data, comments_data,
        meetings_hosted_data, meeting_participations_data, chat_messages_data, questions_data,
        deleted_by, deletion_reason
    ) VALUES (
        p_user_id, v_user_data, v_invitation_codes, v_posts, v_votes, v_comments,
        v_meetings, v_participations, v_chats, v_questions, p_admin_user_id, p_deletion_reason
    ) RETURNING id INTO v_archive_id;

    -- Clear invitation codes
    UPDATE invitation_codes SET used_by = NULL WHERE used_by = p_user_id;

    -- Soft delete
    UPDATE users SET deleted_at = timezone('Asia/Seoul', NOW()), deleted_by = p_admin_user_id, is_active = false WHERE id = p_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'User soft deleted and archived successfully',
        'archive_id', v_archive_id,
        'user_id', p_user_id,
        'username', v_user.username
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 5: restore_deleted_user 함수
CREATE OR REPLACE FUNCTION restore_deleted_user(
    p_user_id UUID,
    p_admin_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_admin users;
    v_user users;
BEGIN
    SELECT * INTO v_admin FROM users WHERE id = p_admin_user_id;
    IF NOT FOUND OR v_admin.role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can restore users';
    END IF;

    SELECT * INTO v_user FROM users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF v_user.deleted_at IS NULL THEN
        RAISE EXCEPTION 'User is not deleted';
    END IF;

    UPDATE users SET deleted_at = NULL, deleted_by = NULL, is_active = true WHERE id = p_user_id;

    UPDATE deleted_users_archive
    SET restored_at = timezone('Asia/Seoul', NOW()), restored_by = p_admin_user_id
    WHERE id = (
        SELECT id FROM deleted_users_archive
        WHERE user_id = p_user_id AND restored_at IS NULL
        ORDER BY deleted_at DESC LIMIT 1
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'User restored successfully',
        'user_id', p_user_id,
        'username', v_user.username
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 6: get_deleted_users 함수 (JSONB 반환)
CREATE OR REPLACE FUNCTION get_deleted_users(p_admin_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users
        WHERE id = p_admin_user_id AND role = 'admin' AND is_active = true AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Only active admins can view deleted users';
    END IF;

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
            SELECT deletion_reason FROM deleted_users_archive
            WHERE user_id = u.id ORDER BY deleted_at DESC LIMIT 1
        ) a ON true
        WHERE u.deleted_at IS NOT NULL
        ORDER BY u.deleted_at DESC
    ) t;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 7: permanently_delete_user 함수
CREATE OR REPLACE FUNCTION permanently_delete_user(
    p_user_id UUID,
    p_admin_user_id UUID,
    p_confirm_permanent_deletion BOOLEAN DEFAULT false
)
RETURNS JSONB AS $$
DECLARE
    v_admin users;
    v_user users;
BEGIN
    IF NOT p_confirm_permanent_deletion THEN
        RAISE EXCEPTION 'Must confirm permanent deletion by setting p_confirm_permanent_deletion to true';
    END IF;

    SELECT * INTO v_admin FROM users WHERE id = p_admin_user_id;
    IF NOT FOUND OR v_admin.role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can permanently delete users';
    END IF;

    IF p_user_id = p_admin_user_id THEN
        RAISE EXCEPTION 'Cannot delete your own account';
    END IF;

    SELECT * INTO v_user FROM users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF v_user.deleted_at IS NULL THEN
        RAISE EXCEPTION 'User must be soft-deleted first before permanent deletion';
    END IF;

    UPDATE invitation_codes SET used_by = NULL WHERE used_by = p_user_id;
    DELETE FROM users WHERE id = p_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'User permanently deleted',
        'user_id', p_user_id,
        'username', v_user.username,
        'warning', 'This action cannot be undone. Archive record preserved.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 8: RLS 정책 업데이트
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users including deleted" ON users;

CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (auth.uid() = id AND deleted_at IS NULL);

CREATE POLICY "Admins can view all users including deleted"
ON users FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'admin' AND is_active = true
    )
);

-- STEP 9: 권한 부여
GRANT EXECUTE ON FUNCTION soft_delete_user(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_deleted_user(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION permanently_delete_user(UUID, UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_deleted_users(UUID) TO authenticated;

-- 완료!
SELECT '✅ User soft delete and recovery system installed successfully!' as result;
