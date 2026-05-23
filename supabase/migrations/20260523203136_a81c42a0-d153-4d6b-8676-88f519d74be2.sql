
-- =========================================================
-- 1) INVITATIONS: remove public-readable policy + add safe RPC
-- =========================================================
DROP POLICY IF EXISTS "Public can read invitation by token" ON public.invitations;

CREATE OR REPLACE FUNCTION public.get_invitation_by_token(_token uuid)
RETURNS TABLE (
  id uuid,
  email text,
  plan_code text,
  expires_at timestamptz,
  accepted_at timestamptz,
  revoked_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, email, plan_code, expires_at, accepted_at, revoked_at
  FROM public.invitations
  WHERE token = _token
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_invitation_by_token(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invitation_by_token(uuid) TO anon, authenticated;

-- =========================================================
-- 2) TENANTS: hide Stripe + plan billing columns from anon
-- =========================================================
REVOKE SELECT (stripe_customer_id, stripe_subscription_id, plan_expires_at, plan_status)
  ON public.tenants FROM anon;

-- =========================================================
-- 3) REALTIME: stop broadcasting tenant_integrations changes
-- =========================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'tenant_integrations'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.tenant_integrations;
  END IF;
END $$;

-- =========================================================
-- 4) STORAGE: enforce tenant_id-prefixed paths on upload
--    Drop redundant tenant-logos policies; keep owner-scoped ones.
-- =========================================================
DROP POLICY IF EXISTS "Authenticated delete tenant logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update tenant logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload tenant logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload storage" ON storage.objects;

CREATE POLICY "Authenticated upload tenant-scoped storage"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = ANY (ARRAY['property-covers','property-gallery','block-media','tenant-logos'])
  AND (
    (storage.foldername(name))[1] = public.current_tenant_id()::text
    OR (
      bucket_id = 'block-media'
      AND (storage.foldername(name))[1] = 'videos'
      AND (storage.foldername(name))[2] = public.current_tenant_id()::text
    )
  )
);

-- =========================================================
-- 5) STORAGE: prevent anonymous listing of public buckets
--    Files remain reachable via getPublicUrl since buckets are public,
--    but the LIST API will no longer enumerate objects.
-- =========================================================
DROP POLICY IF EXISTS "Public read storage" ON storage.objects;
DROP POLICY IF EXISTS "Public read tenant logos" ON storage.objects;
DROP POLICY IF EXISTS "Public read email-assets" ON storage.objects;

-- =========================================================
-- 6) FUNCTIONS: set search_path on the ones missing it
-- =========================================================
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;

-- =========================================================
-- 7) FUNCTIONS: restrict EXECUTE on SECURITY DEFINER helpers
--    Keep callable by anon only what's actually used in anon RLS or by guests
--    (is_property_active is used in anon RLS — must stay executable).
-- =========================================================
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.current_tenant_id() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.find_valid_invitation(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.tenant_property_count(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.tenant_has_feature(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.rotate_property_slug(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.enforce_property_limit() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.seed_property_pages() FROM anon, authenticated, public;

-- Keep is_property_active executable by anon (used by anon RLS policies)
GRANT EXECUTE ON FUNCTION public.is_property_active(uuid) TO anon, authenticated;
