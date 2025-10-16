-- New voting system schema
-- Allows admin to create voting periods and users to submit posts

-- This schema assumes the existing tables from initial_schema.sql
-- We'll modify the voting_periods table to add a title field

-- Add title field to voting_periods (nullable first, then set default)
ALTER TABLE voting_periods
ADD COLUMN IF NOT EXISTS title TEXT;

-- Update existing rows to have default title
UPDATE voting_periods
SET title = '베스트 글 투표'
WHERE title IS NULL;

-- Now make it NOT NULL with default
ALTER TABLE voting_periods
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN title SET DEFAULT '베스트 글 투표';

-- Add description field to voting_periods (nullable)
ALTER TABLE voting_periods
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update posts_nominations to better reflect user-submitted posts
-- (The existing table structure is actually perfect for this use case)
-- title: 글 제목
-- content: 글 본문
-- nominator_id: 글 작성자 (기존 추천자 -> 작성자로 의미 변경)
-- voting_period_id: 어느 투표 기간에 속하는지

-- votes table allows multiple votes from same user (중복 투표 가능)
-- This is already set up correctly

-- Create permissive RLS policies for the voting system
DROP POLICY IF EXISTS "Enable all for voting_periods" ON voting_periods;
CREATE POLICY "Enable all for voting_periods" ON voting_periods
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for posts_nominations" ON posts_nominations;
CREATE POLICY "Enable all for posts_nominations" ON posts_nominations
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for votes" ON votes;
CREATE POLICY "Enable all for votes" ON votes
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for post_comments" ON post_comments;
CREATE POLICY "Enable all for post_comments" ON post_comments
    FOR ALL USING (true) WITH CHECK (true);

-- Verify changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'voting_periods'
ORDER BY ordinal_position;
