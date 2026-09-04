CREATE TABLE public.tenant_slug_history (
  slug text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  rotated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tenant_slug_history TO anon, authenticated;
GRANT ALL ON public.tenant_slug_history TO service_role;

ALTER TABLE public.tenant_slug_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "slug history readable by everyone"
ON public.tenant_slug_history FOR SELECT
USING (true);

CREATE OR REPLACE FUNCTION public.normalize_tenant_slug(_slug text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(both '-' from regexp_replace(lower(public.unaccent_safe(coalesce(_slug,''))), '[^a-z0-9]+', '-', 'g'))
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_slug_available(_slug text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s text := public.normalize_tenant_slug(_slug);
  reserved text[] := ARRAY['app','auth','admin','api','c','signup','login','logout','invite','billing','settings','dashboard','public','assets','static','www','mrflow','hub','oferta','suporte','help','blog','docs','functions','storage'];
  mine boolean;
BEGIN
  IF s IS NULL OR length(s) < 3 OR length(s) > 40 THEN
    RETURN jsonb_build_object('slug', s, 'available', false, 'reason', 'invalid_length');
  END IF;

  IF s = ANY(reserved) THEN
    RETURN jsonb_build_object('slug', s, 'available', false, 'reason', 'reserved');
  END IF;

  SELECT EXISTS (SELECT 1 FROM public.tenants WHERE slug = s AND id = public.current_tenant_id()) INTO mine;
  IF mine THEN
    RETURN jsonb_build_object('slug', s, 'available', true, 'reason', 'current');
  END IF;

  IF EXISTS (SELECT 1 FROM public.tenants WHERE slug = s)
     OR EXISTS (SELECT 1 FROM public.tenant_slug_history WHERE slug = s AND tenant_id <> coalesce(public.current_tenant_id(), '00000000-0000-0000-0000-000000000000'::uuid)) THEN
    RETURN jsonb_build_object('slug', s, 'available', false, 'reason', 'taken');
  END IF;

  RETURN jsonb_build_object('slug', s, 'available', true, 'reason', 'ok');
END;
$$;

CREATE OR REPLACE FUNCTION public.set_tenant_slug(_slug text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s text := public.normalize_tenant_slug(_slug);
  t_id uuid := public.current_tenant_id();
  old_slug text;
  check_result jsonb;
BEGIN
  IF t_id IS NULL THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  IF NOT (public.has_role(auth.uid(), 'tenant_owner'::public.app_role)
          OR public.has_role(auth.uid(), 'super_admin'::public.app_role)) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  check_result := public.is_tenant_slug_available(s);
  IF NOT (check_result->>'available')::boolean THEN
    RAISE EXCEPTION '%', check_result->>'reason';
  END IF;

  SELECT slug INTO old_slug FROM public.tenants WHERE id = t_id;
  IF old_slug = s THEN
    RETURN s;
  END IF;

  DELETE FROM public.tenant_slug_history WHERE slug = s;

  UPDATE public.tenants SET slug = s, updated_at = now() WHERE id = t_id;

  IF old_slug IS NOT NULL THEN
    INSERT INTO public.tenant_slug_history (slug, tenant_id)
    VALUES (old_slug, t_id)
    ON CONFLICT (slug) DO UPDATE SET tenant_id = EXCLUDED.tenant_id, rotated_at = now();
  END IF;

  RETURN s;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_tenant_slug_available(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_tenant_slug(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_tenant_slug(text) TO anon, authenticated;