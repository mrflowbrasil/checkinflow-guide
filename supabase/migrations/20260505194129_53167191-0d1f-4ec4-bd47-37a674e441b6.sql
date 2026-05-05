
-- 1. Update plan prices and limits
UPDATE public.subscription_plans SET
  price_cents = 0, price_yearly_cents = 0, property_limit = 1,
  description = '1 imóvel · guias personalizáveis · 3 templates'
WHERE code = 'free';

UPDATE public.subscription_plans SET
  price_cents = 2990, price_yearly_cents = 29900, property_limit = 5,
  description = '5 imóveis · guias personalizáveis · 3 templates'
WHERE code = 'starter';

UPDATE public.subscription_plans SET
  price_cents = 4990, price_yearly_cents = 49900, property_limit = 20,
  description = '20 imóveis · 15 templates · logo no guia · URL rotativa'
WHERE code = 'pro';

UPDATE public.subscription_plans SET
  price_cents = 9990, price_yearly_cents = 99900, property_limit = 20,
  description = 'Tudo do Pro + integração nativa Stays e Hostaway'
WHERE code = 'business';

-- 2. Feature-gating helper
CREATE OR REPLACE FUNCTION public.tenant_has_feature(_tenant_id uuid, _feature text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE _feature
    WHEN 'pro_templates'    THEN EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant_id AND plan_code IN ('pro','business'))
    WHEN 'custom_logo'      THEN EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant_id AND plan_code IN ('pro','business'))
    WHEN 'slug_rotation'    THEN EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant_id AND plan_code IN ('pro','business'))
    WHEN 'pms_integrations' THEN EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant_id AND plan_code = 'business')
    ELSE false
  END
$$;

-- 3. Harden rotate_property_slug to require slug_rotation feature
CREATE OR REPLACE FUNCTION public.rotate_property_slug(_property_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  prop_tenant uuid;
  prop_name text;
  old_slug text;
  base_slug text;
  candidate text;
  attempts int := 0;
BEGIN
  SELECT tenant_id, name, public_slug
    INTO prop_tenant, prop_name, old_slug
  FROM public.properties
  WHERE id = _property_id;

  IF prop_tenant IS NULL THEN
    RAISE EXCEPTION 'property_not_found';
  END IF;

  IF NOT (prop_tenant = current_tenant_id() OR has_role(auth.uid(), 'super_admin'::app_role)) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  IF NOT has_role(auth.uid(), 'super_admin'::app_role)
     AND NOT public.tenant_has_feature(prop_tenant, 'slug_rotation') THEN
    RAISE EXCEPTION 'feature_not_available_in_plan';
  END IF;

  base_slug := regexp_replace(lower(unaccent_safe(coalesce(prop_name, 'guia'))), '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  IF base_slug = '' OR base_slug IS NULL THEN base_slug := 'guia'; END IF;
  base_slug := substr(base_slug, 1, 60);

  LOOP
    attempts := attempts + 1;
    candidate := base_slug || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 6);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.properties WHERE public_slug = candidate)
              AND NOT EXISTS (SELECT 1 FROM public.property_slug_history WHERE slug = candidate);
    IF attempts > 10 THEN
      RAISE EXCEPTION 'could_not_generate_unique_slug';
    END IF;
  END LOOP;

  IF old_slug IS NOT NULL THEN
    INSERT INTO public.property_slug_history (slug, property_id)
    VALUES (old_slug, _property_id)
    ON CONFLICT (slug) DO UPDATE SET rotated_at = now(), property_id = EXCLUDED.property_id;
  END IF;

  UPDATE public.properties
     SET public_slug = candidate, updated_at = now()
   WHERE id = _property_id;

  RETURN candidate;
END;
$function$;
