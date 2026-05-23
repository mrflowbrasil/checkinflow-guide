
-- Restore SELECT policies on storage.objects that were dropped by the security hardening migration.
-- Needed because supabase-js storage.upload uses INSERT ... RETURNING *, which requires SELECT RLS to pass.

-- 1) Authenticated tenant-scoped read on tenant buckets (matches the INSERT policy scope)
DROP POLICY IF EXISTS "Authenticated read tenant-scoped storage" ON storage.objects;
CREATE POLICY "Authenticated read tenant-scoped storage"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = ANY (ARRAY['property-covers','property-gallery','block-media','tenant-logos'])
  AND (
    (storage.foldername(name))[1] = public.current_tenant_id()::text
    OR (
      bucket_id = 'block-media'
      AND (storage.foldername(name))[1] = 'videos'
      AND (storage.foldername(name))[2] = public.current_tenant_id()::text
    )
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
);

-- 2) Public read on email-assets (used by transactional email templates)
DROP POLICY IF EXISTS "Public read email-assets" ON storage.objects;
CREATE POLICY "Public read email-assets"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'email-assets');
