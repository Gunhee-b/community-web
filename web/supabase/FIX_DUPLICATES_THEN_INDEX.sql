-- ============================================================================
-- 중복 데이터 확인 및 정리 후 UNIQUE 인덱스 생성
-- ============================================================================

-- STEP 1: 중복된 데이터 확인
-- ============================================================================

-- 중복된 username 확인 (deleted_at IS NULL인 경우만)
SELECT username, COUNT(*) as count
FROM users
WHERE deleted_at IS NULL
GROUP BY username
HAVING COUNT(*) > 1;

-- 중복된 kakao_nickname 확인 (deleted_at IS NULL인 경우만)
SELECT kakao_nickname, COUNT(*) as count
FROM users
WHERE deleted_at IS NULL
GROUP BY kakao_nickname
HAVING COUNT(*) > 1;

-- 모든 kakao_nickname 중복 확인 (삭제된 것 포함)
SELECT
    kakao_nickname,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_count,
    COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_count
FROM users
GROUP BY kakao_nickname
HAVING COUNT(*) > 1
ORDER BY total_count DESC;

-- STEP 2: 중복 데이터 상세 조회
-- ============================================================================

-- "배건희1" 중복 상세 확인
SELECT
    id,
    username,
    kakao_nickname,
    email,
    deleted_at,
    is_active,
    created_at
FROM users
WHERE kakao_nickname = '배건희1'
ORDER BY created_at;

-- STEP 3: 중복 해결 전략
-- ============================================================================

-- 전략 1: 활성 사용자 중 가장 최근 것만 유지하고 나머지는 kakao_nickname을 변경
-- 전략 2: 활성 사용자 중 가장 오래된 것만 유지하고 나머지는 kakao_nickname을 변경

-- STEP 4: 중복된 kakao_nickname 자동 수정
-- ============================================================================

DO $$
DECLARE
    r RECORD;
    dup_record RECORD;
    counter INTEGER;
BEGIN
    -- 각 중복된 kakao_nickname에 대해 처리
    FOR r IN
        SELECT kakao_nickname, COUNT(*) as count
        FROM users
        WHERE deleted_at IS NULL
        GROUP BY kakao_nickname
        HAVING COUNT(*) > 1
    LOOP
        RAISE NOTICE 'Processing duplicate kakao_nickname: % (total: %)', r.kakao_nickname, r.count;

        counter := 1;

        -- 해당 kakao_nickname을 가진 활성 사용자들을 처리
        -- 첫 번째(가장 오래된) 것을 제외하고 나머지에 suffix 추가
        FOR dup_record IN
            SELECT id, username, kakao_nickname
            FROM users
            WHERE kakao_nickname = r.kakao_nickname
            AND deleted_at IS NULL
            ORDER BY created_at
            OFFSET 1  -- 첫 번째를 건너뜀
        LOOP
            UPDATE users
            SET kakao_nickname = r.kakao_nickname || '_dup' || counter
            WHERE id = dup_record.id;

            RAISE NOTICE '  → Updated user % (%) to %', dup_record.username, dup_record.id, r.kakao_nickname || '_dup' || counter;

            counter := counter + 1;
        END LOOP;
    END LOOP;
END $$;

-- STEP 5: username 중복도 같은 방식으로 처리
-- ============================================================================

DO $$
DECLARE
    r RECORD;
    dup_record RECORD;
    counter INTEGER;
BEGIN
    FOR r IN
        SELECT username, COUNT(*) as count
        FROM users
        WHERE deleted_at IS NULL
        GROUP BY username
        HAVING COUNT(*) > 1
    LOOP
        RAISE NOTICE 'Processing duplicate username: % (total: %)', r.username, r.count;

        counter := 1;

        FOR dup_record IN
            SELECT id, username
            FROM users
            WHERE username = r.username
            AND deleted_at IS NULL
            ORDER BY created_at
            OFFSET 1
        LOOP
            UPDATE users
            SET username = r.username || '_dup' || counter
            WHERE id = dup_record.id;

            RAISE NOTICE '  → Updated user % to %', dup_record.id, r.username || '_dup' || counter;

            counter := counter + 1;
        END LOOP;
    END LOOP;
END $$;

-- STEP 6: 다시 중복 확인
-- ============================================================================

SELECT 'Checking for remaining duplicates...' as status;

SELECT username, COUNT(*) as count
FROM users
WHERE deleted_at IS NULL
GROUP BY username
HAVING COUNT(*) > 1;

SELECT kakao_nickname, COUNT(*) as count
FROM users
WHERE deleted_at IS NULL
GROUP BY kakao_nickname
HAVING COUNT(*) > 1;

-- STEP 7: UNIQUE 제약 제거 및 부분 인덱스 생성
-- ============================================================================

-- 기존 UNIQUE 제약 제거
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_kakao_nickname_key;

-- 기존 인덱스 제거
DROP INDEX IF EXISTS users_username_unique_active;
DROP INDEX IF EXISTS users_kakao_nickname_unique_active;

-- 부분 UNIQUE 인덱스 생성 (deleted_at IS NULL인 활성 사용자만)
CREATE UNIQUE INDEX users_username_unique_active
ON users(username)
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX users_kakao_nickname_unique_active
ON users(kakao_nickname)
WHERE deleted_at IS NULL;

SELECT '✅ Duplicates fixed and unique indexes created!' as result;

-- STEP 8: 나머지 함수들 업데이트 (FIX_ALL_ISSUES.sql의 STEP 2-6)
-- ============================================================================

-- admin_get_all_users_secure 함수 수정
DROP FUNCTION IF EXISTS admin_get_all_users_secure(UUID);

CREATE OR REPLACE FUNCTION admin_get_all_users_secure(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users
        WHERE id = p_user_id
        AND role = 'admin'
        AND is_active = true
        AND deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Only active admins can view users';
    END IF;

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

-- soft_delete_user 함수
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
    SELECT * INTO v_admin FROM users WHERE id = p_admin_user_id AND deleted_at IS NULL;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Admin user not found or deleted');
    END IF;
    IF v_admin.role != 'admin' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Only admins can delete users');
    END IF;
    IF p_user_id = p_admin_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cannot delete your own account');
    END IF;

    SELECT * INTO v_user FROM users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;
    IF v_user.deleted_at IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User is already deleted', 'deleted_at', v_user.deleted_at);
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
    EXCEPTION WHEN undefined_table THEN
        v_questions := '[]'::json;
    END;

    INSERT INTO deleted_users_archive (
        user_id, user_data, invitation_codes_data, posts_data, votes_data, comments_data,
        meetings_hosted_data, meeting_participations_data, chat_messages_data, questions_data,
        deleted_by, deletion_reason
    ) VALUES (
        p_user_id, v_user_data, v_invitation_codes, v_posts, v_votes, v_comments,
        v_meetings, v_participations, v_chats, v_questions, p_admin_user_id, p_deletion_reason
    ) RETURNING id INTO v_archive_id;

    UPDATE invitation_codes SET used_by = NULL WHERE used_by = p_user_id;
    UPDATE users SET deleted_at = timezone('Asia/Seoul', NOW()), deleted_by = p_admin_user_id, is_active = false WHERE id = p_user_id;

    RETURN jsonb_build_object('success', true, 'message', 'User soft deleted and archived successfully', 'archive_id', v_archive_id, 'user_id', p_user_id, 'username', v_user.username);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION soft_delete_user(UUID, UUID, TEXT) TO authenticated;

-- restore_deleted_user 함수
DROP FUNCTION IF EXISTS restore_deleted_user(UUID, UUID);

CREATE OR REPLACE FUNCTION restore_deleted_user(p_user_id UUID, p_admin_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_admin users;
    v_user users;
BEGIN
    SELECT * INTO v_admin FROM users WHERE id = p_admin_user_id AND deleted_at IS NULL;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Admin user not found or deleted');
    END IF;
    IF v_admin.role != 'admin' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Only admins can restore users');
    END IF;

    SELECT * INTO v_user FROM users WHERE id = p_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;
    IF v_user.deleted_at IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User is not deleted');
    END IF;

    UPDATE users SET deleted_at = NULL, deleted_by = NULL, is_active = true WHERE id = p_user_id;
    UPDATE deleted_users_archive SET restored_at = timezone('Asia/Seoul', NOW()), restored_by = p_admin_user_id
    WHERE id = (SELECT id FROM deleted_users_archive WHERE user_id = p_user_id AND restored_at IS NULL ORDER BY deleted_at DESC LIMIT 1);

    RETURN jsonb_build_object('success', true, 'message', 'User restored successfully', 'user_id', p_user_id, 'username', v_user.username);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION restore_deleted_user(UUID, UUID) TO authenticated;

-- get_deleted_users 함수
DROP FUNCTION IF EXISTS get_deleted_users(UUID);

CREATE OR REPLACE FUNCTION get_deleted_users(p_admin_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_admin_user_id AND role = 'admin' AND is_active = true AND deleted_at IS NULL) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Only active admins can view deleted users');
    END IF;

    SELECT COALESCE(json_agg(row_to_json(t.*)), '[]'::json)::jsonb INTO v_result
    FROM (
        SELECT u.id as user_id, u.username, u.email, u.role, u.deleted_at, deleter.username as deleted_by_username, a.deletion_reason, true as can_restore
        FROM users u
        LEFT JOIN users deleter ON u.deleted_by = deleter.id
        LEFT JOIN LATERAL (SELECT deletion_reason FROM deleted_users_archive WHERE user_id = u.id ORDER BY deleted_at DESC LIMIT 1) a ON true
        WHERE u.deleted_at IS NOT NULL
        ORDER BY u.deleted_at DESC
    ) t;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_deleted_users(UUID) TO authenticated;

SELECT '✅ All functions updated successfully!' as result;
