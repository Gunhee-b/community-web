-- User Soft Delete and Archive System
-- This migration implements a comprehensive user deletion and recovery system
--
-- Features:
-- 1. Soft Delete: Users are marked as deleted but not removed from database
-- 2. Archive: Full backup of user data before soft deletion
-- 3. Recovery: Easy restoration of deleted users
-- 4. Audit Trail: Track who deleted/restored users and when

-- ============================================================================
-- STEP 1: Add soft delete columns to users table
-- ============================================================================

-- Add deleted_at timestamp (NULL = active, NOT NULL = deleted)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add deleted_by to track which admin deleted the user
ALTER TABLE users
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add index for filtering deleted users
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================================================
-- STEP 2: Create archive table for complete backup
-- ============================================================================

CREATE TABLE IF NOT EXISTS deleted_users_archive (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Original user data
    user_id UUID NOT NULL,
    user_data JSONB NOT NULL,  -- Complete snapshot of user record

    -- Related data (saved as JSON for complete recovery)
    invitation_codes_data JSONB,  -- Invitation codes used by this user
    posts_data JSONB,              -- Posts created by user
    votes_data JSONB,              -- Votes cast by user
    comments_data JSONB,           -- Comments written by user
    meetings_hosted_data JSONB,    -- Meetings hosted by user
    meeting_participations_data JSONB,  -- Meeting participations
    chat_messages_data JSONB,      -- Chat messages sent
    questions_data JSONB,          -- Daily question answers

    -- Deletion metadata
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Seoul', NOW()) NOT NULL,
    deletion_reason TEXT,

    -- Recovery metadata
    restored_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    restored_by UUID REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('Asia/Seoul', NOW()) NOT NULL
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_archive_user_id ON deleted_users_archive(user_id);
CREATE INDEX IF NOT EXISTS idx_archive_deleted_at ON deleted_users_archive(deleted_at);

-- ============================================================================
-- STEP 3: Soft delete function (replaces delete_user_permanently)
-- ============================================================================

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
    SELECT * INTO v_admin FROM users WHERE id = p_admin_user_id;

    IF NOT FOUND OR v_admin.role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can delete users';
    END IF;

    -- Prevent self-deletion
    IF p_user_id = p_admin_user_id THEN
        RAISE EXCEPTION 'Cannot delete your own account';
    END IF;

    -- Check if user exists
    SELECT * INTO v_user FROM users WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Check if already deleted
    IF v_user.deleted_at IS NOT NULL THEN
        RAISE EXCEPTION 'User is already deleted';
    END IF;

    -- ========================================================================
    -- BACKUP: Collect all user data for archive
    -- ========================================================================

    -- User data
    SELECT row_to_json(u.*) INTO v_user_data
    FROM users u WHERE u.id = p_user_id;

    -- Invitation codes used by user
    SELECT COALESCE(json_agg(row_to_json(ic.*)), '[]'::json) INTO v_invitation_codes
    FROM invitation_codes ic WHERE ic.used_by = p_user_id;

    -- Posts created by user
    SELECT COALESCE(json_agg(row_to_json(p.*)), '[]'::json) INTO v_posts
    FROM posts_nominations p WHERE p.nominator_id = p_user_id;

    -- Votes cast by user
    SELECT COALESCE(json_agg(row_to_json(v.*)), '[]'::json) INTO v_votes
    FROM votes v WHERE v.user_id = p_user_id;

    -- Comments written by user
    SELECT COALESCE(json_agg(row_to_json(c.*)), '[]'::json) INTO v_comments
    FROM post_comments c WHERE c.user_id = p_user_id;

    -- Meetings hosted by user
    SELECT COALESCE(json_agg(row_to_json(m.*)), '[]'::json) INTO v_meetings
    FROM offline_meetings m WHERE m.host_id = p_user_id;

    -- Meeting participations
    SELECT COALESCE(json_agg(row_to_json(mp.*)), '[]'::json) INTO v_participations
    FROM meeting_participants mp WHERE mp.user_id = p_user_id;

    -- Chat messages
    SELECT COALESCE(json_agg(row_to_json(mc.*)), '[]'::json) INTO v_chats
    FROM meeting_chats mc WHERE mc.user_id = p_user_id;

    -- Daily question answers (if table exists)
    BEGIN
        SELECT COALESCE(json_agg(row_to_json(a.*)), '[]'::json) INTO v_questions
        FROM daily_question_answers a WHERE a.user_id = p_user_id;
    EXCEPTION
        WHEN undefined_table THEN
            v_questions := '[]'::json;
    END;

    -- ========================================================================
    -- ARCHIVE: Save to archive table
    -- ========================================================================

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

    -- ========================================================================
    -- SOFT DELETE: Mark user as deleted (don't actually delete)
    -- ========================================================================

    -- Set invitation_codes.used_by to NULL to prevent FK constraint issues
    UPDATE invitation_codes
    SET used_by = NULL
    WHERE used_by = p_user_id;

    -- Mark user as deleted
    UPDATE users
    SET
        deleted_at = timezone('Asia/Seoul', NOW()),
        deleted_by = p_admin_user_id,
        is_active = false  -- Also deactivate
    WHERE id = p_user_id;

    -- Return success with archive ID
    RETURN jsonb_build_object(
        'success', true,
        'message', 'User soft deleted and archived successfully',
        'archive_id', v_archive_id,
        'user_id', p_user_id,
        'username', v_user.username
    );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 4: Restore user function
-- ============================================================================

CREATE OR REPLACE FUNCTION restore_deleted_user(
    p_user_id UUID,
    p_admin_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_admin users;
    v_user users;
    v_archive deleted_users_archive;
BEGIN
    -- Check if admin exists and is admin
    SELECT * INTO v_admin FROM users WHERE id = p_admin_user_id;

    IF NOT FOUND OR v_admin.role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can restore users';
    END IF;

    -- Check if user exists
    SELECT * INTO v_user FROM users WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Check if user is actually deleted
    IF v_user.deleted_at IS NULL THEN
        RAISE EXCEPTION 'User is not deleted';
    END IF;

    -- Restore user
    UPDATE users
    SET
        deleted_at = NULL,
        deleted_by = NULL,
        is_active = true
    WHERE id = p_user_id;

    -- Update archive record to mark as restored
    UPDATE deleted_users_archive
    SET
        restored_at = timezone('Asia/Seoul', NOW()),
        restored_by = p_admin_user_id
    WHERE id = (
        SELECT id
        FROM deleted_users_archive
        WHERE user_id = p_user_id
        AND restored_at IS NULL  -- Only update the most recent unrestored archive
        ORDER BY deleted_at DESC
        LIMIT 1
    );

    -- Note: Related data (posts, votes, etc.) are kept via CASCADE
    -- so they automatically become visible again when user is restored

    RETURN jsonb_build_object(
        'success', true,
        'message', 'User restored successfully',
        'user_id', p_user_id,
        'username', v_user.username
    );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 5: Permanent delete function (only use if absolutely necessary)
-- ============================================================================

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
    -- Safety check: must explicitly confirm
    IF NOT p_confirm_permanent_deletion THEN
        RAISE EXCEPTION 'Must confirm permanent deletion by setting p_confirm_permanent_deletion to true';
    END IF;

    -- Check if admin exists and is admin
    SELECT * INTO v_admin FROM users WHERE id = p_admin_user_id;

    IF NOT FOUND OR v_admin.role != 'admin' THEN
        RAISE EXCEPTION 'Only admins can permanently delete users';
    END IF;

    -- Prevent self-deletion
    IF p_user_id = p_admin_user_id THEN
        RAISE EXCEPTION 'Cannot delete your own account';
    END IF;

    -- Check if user exists
    SELECT * INTO v_user FROM users WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- User should be soft-deleted first
    IF v_user.deleted_at IS NULL THEN
        RAISE EXCEPTION 'User must be soft-deleted first before permanent deletion';
    END IF;

    -- Set invitation_codes.used_by to NULL
    UPDATE invitation_codes
    SET used_by = NULL
    WHERE used_by = p_user_id;

    -- Permanently delete user (CASCADE will delete related data)
    DELETE FROM users WHERE id = p_user_id;

    -- Archive record remains for audit trail

    RETURN jsonb_build_object(
        'success', true,
        'message', 'User permanently deleted',
        'user_id', p_user_id,
        'username', v_user.username,
        'warning', 'This action cannot be undone. Archive record preserved.'
    );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 6: Helper function to list deleted users
-- ============================================================================

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
        AND deleted_at IS NULL  -- Admin must not be deleted
    ) THEN
        RAISE EXCEPTION 'Only active admins can view deleted users';
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

-- ============================================================================
-- STEP 7: Update RLS policies to hide soft-deleted users
-- ============================================================================

-- Drop existing SELECT policies on users
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Recreate policies to exclude soft-deleted users (except for admins)
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT
USING (
    auth.uid() = id
    AND deleted_at IS NULL  -- Can't see own profile if deleted
);

CREATE POLICY "Admins can view all users including deleted"
ON users FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
        AND is_active = true
    )
);

-- ============================================================================
-- STEP 8: Grant permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION soft_delete_user(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_deleted_user(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION permanently_delete_user(UUID, UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_deleted_users(UUID) TO authenticated;

-- ============================================================================
-- NOTES
-- ============================================================================

-- Usage Examples:
--
-- 1. Soft delete a user (recommended):
--    SELECT soft_delete_user(
--        '<user_id>',
--        '<admin_id>',
--        'Violated community guidelines'
--    );
--
-- 2. Restore a deleted user:
--    SELECT restore_deleted_user('<user_id>', '<admin_id>');
--
-- 3. List all deleted users:
--    SELECT * FROM get_deleted_users('<admin_id>');
--
-- 4. Permanently delete (use with caution):
--    SELECT permanently_delete_user('<user_id>', '<admin_id>', true);
--
-- Benefits of this system:
-- - Users can be restored easily
-- - Complete audit trail
-- - Full data backup in archive table
-- - No accidental data loss
-- - Admin accountability (tracks who deleted/restored)
