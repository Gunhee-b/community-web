-- Fix foreign key constraints to enable CASCADE delete for voting_periods
-- This allows deleting a voting period along with all its related posts and votes

-- Drop existing foreign key constraint
ALTER TABLE posts_nominations
DROP CONSTRAINT IF EXISTS posts_nominations_voting_period_id_fkey;

-- Re-add with CASCADE delete
ALTER TABLE posts_nominations
ADD CONSTRAINT posts_nominations_voting_period_id_fkey
FOREIGN KEY (voting_period_id)
REFERENCES voting_periods(id)
ON DELETE CASCADE;

-- Also fix votes table foreign key
ALTER TABLE votes
DROP CONSTRAINT IF EXISTS votes_voting_period_id_fkey;

ALTER TABLE votes
ADD CONSTRAINT votes_voting_period_id_fkey
FOREIGN KEY (voting_period_id)
REFERENCES voting_periods(id)
ON DELETE CASCADE;

-- Fix winner_post_id constraint to SET NULL on delete
ALTER TABLE voting_periods
DROP CONSTRAINT IF EXISTS fk_winner_post;

ALTER TABLE voting_periods
ADD CONSTRAINT fk_winner_post
FOREIGN KEY (winner_post_id)
REFERENCES posts_nominations(id)
ON DELETE SET NULL;
