
CREATE TABLE public.onboarding_profiles (
  user_id UUID NOT NULL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  state TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  properties_count TEXT NOT NULL,
  pms TEXT NOT NULL,
  pms_other TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own onboarding"
  ON public.onboarding_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users insert own onboarding"
  ON public.onboarding_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own onboarding"
  ON public.onboarding_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admin manages onboarding"
  ON public.onboarding_profiles FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER set_onboarding_profiles_updated_at
  BEFORE UPDATE ON public.onboarding_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.integration_webhooks (provider, webhook_url, is_active)
VALUES ('onboarding', '', false)
ON CONFLICT DO NOTHING;
