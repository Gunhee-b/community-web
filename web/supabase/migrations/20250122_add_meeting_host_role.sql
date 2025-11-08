-- Add 'meeting_host' role to user_role enum
-- This migration adds a new role type for meeting organizers

-- First, add the new value to the enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'meeting_host';

-- Add a comment to document the role
COMMENT ON TYPE user_role IS 'User roles: admin (administrator), meeting_host (meeting organizer), member (regular member)';
