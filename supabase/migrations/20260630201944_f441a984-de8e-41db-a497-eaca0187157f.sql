GRANT SELECT ON public.tenants TO anon;
GRANT SELECT, UPDATE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;