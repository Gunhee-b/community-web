-- Add image_url column to posts_nominations table
ALTER TABLE posts_nominations
ADD COLUMN image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN posts_nominations.image_url IS 'URL of the uploaded image from Supabase Storage';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_nominations_image_url ON posts_nominations(image_url) WHERE image_url IS NOT NULL;
