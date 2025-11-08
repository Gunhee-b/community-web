-- Add 'meeting_host' role to user_role enum
-- This migration adds a new role type for meeting organizers

-- Check if the value already exists, if not add it
DO $$
BEGIN
    -- Try to add the new enum value
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'user_role'
        AND e.enumlabel = 'meeting_host'
    ) THEN
        ALTER TYPE user_role ADD VALUE 'meeting_host';
        RAISE NOTICE 'Added meeting_host to user_role enum';
    ELSE
        RAISE NOTICE 'meeting_host already exists in user_role enum';
    END IF;
END $$;

-- Add a comment to document the role
COMMENT ON TYPE user_role IS 'User roles: admin (administrator), meeting_host (meeting organizer), member (regular member)';
