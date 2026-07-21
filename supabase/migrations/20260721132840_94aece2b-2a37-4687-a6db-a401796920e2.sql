
REVOKE ALL ON FUNCTION public.enforce_trial_expiration() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_tenant_converted(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_trial_expiration() TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_tenant_converted(uuid) TO service_role;
