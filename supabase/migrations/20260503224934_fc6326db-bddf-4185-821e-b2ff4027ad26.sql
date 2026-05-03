-- Add support whatsapp to tenants for the expired-link help button
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS support_whatsapp text;

-- Mapping table: old slug -> property (used only to render the expired-link page
-- with the correct host's booking_url and WhatsApp; no content stored)
CREATE TABLE IF NOT EXISTS public.property_slug_history (
  slug text PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  rotated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_slug_history_property
  ON public.property_slug_history(property_id);

ALTER TABLE public.property_slug_history ENABLE ROW LEVEL SECURITY;

-- Public can read the mapping to resolve expired links to the correct host info
CREATE POLICY "Public reads slug history"
  ON public.property_slug_history
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only super_admin can manage directly; rotation happens via SECURITY DEFINER fn
CREATE POLICY "Super admin manages slug history"
  ON public.property_slug_history
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Rotate the public_slug of a property. Returns the new slug.
CREATE OR REPLACE FUNCTION public.rotate_property_slug(_property_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  -- Save old slug for the expired-link page (overwrite if collides)
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
$$;

REVOKE ALL ON FUNCTION public.rotate_property_slug(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.rotate_property_slug(uuid) TO authenticated;