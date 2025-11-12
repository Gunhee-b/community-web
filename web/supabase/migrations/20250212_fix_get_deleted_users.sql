-- Fix get_deleted_users function to return JSONB instead of TABLE
-- This is more compatible with Supabase RPC

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

-- Grant permission
GRANT EXECUTE ON FUNCTION get_deleted_users(UUID) TO authenticated;

-- Test the function (replace with your admin user ID)
-- SELECT get_deleted_users('your-admin-user-id-here');
