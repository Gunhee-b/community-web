-- Add author field to posts_nominations table
-- This allows users to enter a custom author name (different from their username)

ALTER TABLE posts_nominations
ADD COLUMN IF NOT EXISTS author_name TEXT;

-- Update existing posts to use the nominator's username as author
UPDATE posts_nominations pn
SET author_name = u.username
FROM users u
WHERE pn.nominator_id = u.id
AND pn.author_name IS NULL;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'posts_nominations'
ORDER BY ordinal_position;
