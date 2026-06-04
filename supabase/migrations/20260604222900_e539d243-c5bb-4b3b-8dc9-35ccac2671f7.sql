-- Step 1: Restrict anon column access on public.tenants
REVOKE SELECT ON public.tenants FROM anon;
GRANT SELECT (
  id, name, slug,
  primary_color, secondary_color, template,
  support_whatsapp, logo_url, show_logo,
  instagram_url, facebook_url,
  plan_code, is_active
) ON public.tenants TO anon;