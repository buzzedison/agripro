-- Create covers storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'covers',
    'covers',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for covers
CREATE POLICY "Public covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');

CREATE POLICY "Users can upload covers" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update covers" ON storage.objects FOR UPDATE 
USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete covers" ON storage.objects FOR DELETE 
USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);
