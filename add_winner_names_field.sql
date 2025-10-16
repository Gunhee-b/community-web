-- Add winner_names field to voting_periods table
-- This stores the names of all winners (comma-separated for ties)

ALTER TABLE voting_periods
ADD COLUMN IF NOT EXISTS winner_names TEXT;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'voting_periods'
ORDER BY ordinal_position;
