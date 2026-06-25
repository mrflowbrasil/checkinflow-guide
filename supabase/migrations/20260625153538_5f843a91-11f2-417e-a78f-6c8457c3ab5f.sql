CREATE OR REPLACE FUNCTION public.tenant_has_feature(_tenant_id uuid, _feature text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE _feature
    WHEN 'pro_templates'    THEN EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant_id AND plan_code IN ('pro','business','launch'))
    WHEN 'custom_logo'      THEN EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant_id AND plan_code IN ('pro','business','launch'))
    WHEN 'slug_rotation'    THEN EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant_id AND plan_code IN ('pro','business','launch'))
    WHEN 'pms_integrations' THEN EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant_id AND plan_code IN ('pro','business','launch'))
    ELSE false
  END
$function$;