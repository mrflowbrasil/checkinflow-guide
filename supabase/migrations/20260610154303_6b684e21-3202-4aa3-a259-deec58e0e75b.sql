
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS max_guests integer,
  ADD COLUMN IF NOT EXISTS base_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'properties_source_check'
  ) THEN
    ALTER TABLE public.properties
      ADD CONSTRAINT properties_source_check
      CHECK (source IN ('manual','stays','hub'));
  END IF;
END $$;

UPDATE public.properties
   SET source = CASE
     WHEN external_provider ILIKE 'stays' THEN 'stays'
     WHEN external_provider ILIKE 'hub' OR external_provider ILIKE 'hospedin' THEN 'hub'
     ELSE 'manual'
   END
 WHERE source = 'manual';

CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties (city);

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS catalog_bio text;

INSERT INTO public.integration_webhooks (provider, webhook_url, is_active)
VALUES ('catalog_search', '', false)
ON CONFLICT (provider) DO NOTHING;
