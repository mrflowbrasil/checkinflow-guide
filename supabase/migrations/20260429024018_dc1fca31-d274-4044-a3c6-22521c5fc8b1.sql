CREATE POLICY "Public read tenant logos" ON storage.objects FOR SELECT USING (bucket_id = 'tenant-logos');
CREATE POLICY "Authenticated upload tenant logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'tenant-logos');
CREATE POLICY "Authenticated update tenant logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'tenant-logos');
CREATE POLICY "Authenticated delete tenant logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'tenant-logos');