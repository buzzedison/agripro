-- Add gif_url column to posts table
ALTER TABLE posts 
ADD COLUMN gif_url TEXT;

-- Add gif_url column to post_comments table
ALTER TABLE post_comments 
ADD COLUMN gif_url TEXT;
