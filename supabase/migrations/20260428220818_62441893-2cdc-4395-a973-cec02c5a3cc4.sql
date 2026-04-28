
-- Fix search_path on remaining functions
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.unaccent_safe(TEXT) SET search_path = public;

-- Revoke broad execute and grant only what's needed
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_tenant_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_property_active(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_property_pages() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.unaccent_safe(TEXT) FROM PUBLIC, anon;

-- Allow needed grants
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_property_active(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.unaccent_safe(TEXT) TO authenticated;
