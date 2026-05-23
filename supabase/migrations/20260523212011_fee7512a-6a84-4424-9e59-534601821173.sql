GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tenant_property_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tenant_has_feature(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rotate_property_slug(uuid) TO authenticated;