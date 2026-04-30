
-- 1. integration_webhooks (super admin)
CREATE TABLE public.integration_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE,
  webhook_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.integration_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin manages integration webhooks"
  ON public.integration_webhooks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));
CREATE TRIGGER set_integration_webhooks_updated_at
  BEFORE UPDATE ON public.integration_webhooks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed default rows
INSERT INTO public.integration_webhooks (provider, webhook_url, is_active)
VALUES ('stays', '', false), ('hostaway', '', false);

-- 2. tenant_integrations
CREATE TABLE public.tenant_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  system_url TEXT,
  credentials_encrypted TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, provider)
);
ALTER TABLE public.tenant_integrations ENABLE ROW LEVEL SECURITY;

-- Tenant members can SELECT their own integrations but only safe columns (we revoke credentials col)
CREATE POLICY "Tenant views own integrations"
  ON public.tenant_integrations FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id() OR public.has_role(auth.uid(), 'super_admin'::public.app_role));

-- Only service role / super admin can write (edge functions use service role)
CREATE POLICY "Super admin manages tenant integrations"
  ON public.tenant_integrations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

-- Revoke credentials_encrypted from authenticated select; only service_role can read it
REVOKE SELECT (credentials_encrypted) ON public.tenant_integrations FROM authenticated, anon;

CREATE TRIGGER set_tenant_integrations_updated_at
  BEFORE UPDATE ON public.tenant_integrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. tenant_api_keys
CREATE TABLE public.tenant_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default',
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);
ALTER TABLE public.tenant_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant views own api keys"
  ON public.tenant_api_keys FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id() OR public.has_role(auth.uid(), 'super_admin'::public.app_role));
CREATE POLICY "Super admin manages api keys"
  ON public.tenant_api_keys FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

REVOKE SELECT (key_hash) ON public.tenant_api_keys FROM authenticated, anon;

-- 4. Extend properties
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS external_provider TEXT,
  ADD COLUMN IF NOT EXISTS external_data JSONB;

CREATE UNIQUE INDEX IF NOT EXISTS properties_external_unique
  ON public.properties (tenant_id, external_provider, external_id)
  WHERE external_id IS NOT NULL AND external_provider IS NOT NULL;

-- 5. property_details
CREATE TABLE public.property_details (
  property_id UUID PRIMARY KEY REFERENCES public.properties(id) ON DELETE CASCADE,
  checkin_time TEXT,
  checkin_instructions TEXT,
  checkout_time TEXT,
  checkout_instructions TEXT,
  lock_code TEXT,
  wifi_ssid TEXT,
  wifi_password TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  rules TEXT,
  parking TEXT,
  trash TEXT,
  emergency_contacts JSONB DEFAULT '[]'::jsonb,
  extras JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.property_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads details of active properties"
  ON public.property_details FOR SELECT TO anon
  USING (public.is_property_active(property_id));

CREATE POLICY "Tenant manages property details"
  ON public.property_details FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_details.property_id
      AND (p.tenant_id = public.current_tenant_id() OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_details.property_id
      AND (p.tenant_id = public.current_tenant_id() OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  ));

CREATE TRIGGER set_property_details_updated_at
  BEFORE UPDATE ON public.property_details
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
