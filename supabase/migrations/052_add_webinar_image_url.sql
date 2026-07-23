-- Add cover image to webinars + storage bucket for Catalyst W assets
ALTER TABLE public.catalyst_w_webinars
  ADD COLUMN IF NOT EXISTS image_url TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'catalyst-w-assets',
  'catalyst-w-assets',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read catalyst w assets" ON storage.objects;
CREATE POLICY "Public read catalyst w assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'catalyst-w-assets');
