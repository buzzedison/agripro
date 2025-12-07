-- Create storage bucket for post images
-- Run this in Supabase SQL Editor

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to images
CREATE POLICY "Post images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own post images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);
