-- Create storage bucket for vendor verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-documents', 'vendor-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload/read their documents
CREATE POLICY "Authenticated can upload vendor documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-documents'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated can view vendor documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'vendor-documents'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated can delete vendor documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vendor-documents'
  AND auth.role() = 'authenticated'
);
