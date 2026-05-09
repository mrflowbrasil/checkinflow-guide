CREATE TABLE public.guide_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  locale text NOT NULL,
  content_hash text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (property_id, locale)
);

CREATE INDEX idx_guide_translations_lookup ON public.guide_translations(property_id, locale);

ALTER TABLE public.guide_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads translations of active properties"
ON public.guide_translations FOR SELECT
TO anon, authenticated
USING (is_property_active(property_id));

CREATE POLICY "Service role manages translations"
ON public.guide_translations FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER trg_guide_translations_updated_at
BEFORE UPDATE ON public.guide_translations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();