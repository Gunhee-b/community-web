-- Remove the old check constraint and let the enum type handle validation
-- The check constraint is conflicting with the new meeting_host role

-- Drop the existing check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- The enum type user_role already enforces valid values, so we don't need a separate check constraint
-- Verify the change
DO $$
BEGIN
    RAISE NOTICE 'Check constraint removed. The user_role enum type will handle role validation.';
END $$;

-- Verify that the enum has all three values
SELECT enumlabel
FROM pg_enum
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
WHERE pg_type.typname = 'user_role'
ORDER BY enumsortorder;
