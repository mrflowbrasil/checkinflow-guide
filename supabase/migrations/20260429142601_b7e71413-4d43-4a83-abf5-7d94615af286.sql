-- ========== 1. Catálogo de planos ==========
CREATE TABLE public.subscription_plans (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  property_limit INT NOT NULL,
  price_cents INT NOT NULL DEFAULT 0,
  stripe_price_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans publicly readable"
  ON public.subscription_plans FOR SELECT
  USING (true);

CREATE POLICY "Super admin manages plans"
  ON public.subscription_plans FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER set_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed dos planos
INSERT INTO public.subscription_plans (code, name, property_limit, price_cents, position) VALUES
  ('free',     'Free',     1,   0, 1),
  ('starter',  'Starter',  5,   0, 2),
  ('pro',      'Pro',      20,  0, 3),
  ('business', 'Business', 999, 0, 4);

-- ========== 2. Extensões em tenants ==========
ALTER TABLE public.tenants
  ADD COLUMN plan_code TEXT NOT NULL DEFAULT 'free' REFERENCES public.subscription_plans(code),
  ADD COLUMN plan_status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN stripe_customer_id TEXT,
  ADD COLUMN stripe_subscription_id TEXT,
  ADD COLUMN plan_expires_at TIMESTAMPTZ;

-- ========== 3. Convites ==========
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  plan_code TEXT NOT NULL DEFAULT 'free' REFERENCES public.subscription_plans(code),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invitations_email ON public.invitations (lower(email));
CREATE INDEX idx_invitations_token ON public.invitations (token);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Super admin gerencia tudo
CREATE POLICY "Super admin manages invitations"
  ON public.invitations FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Leitura pública por token (necessário para a página /invite/:token)
CREATE POLICY "Public can read invitation by token"
  ON public.invitations FOR SELECT
  TO anon, authenticated
  USING (true);

-- ========== 4. Função para verificar convite válido ==========
CREATE OR REPLACE FUNCTION public.find_valid_invitation(_email TEXT)
RETURNS public.invitations
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.invitations
  WHERE lower(email) = lower(_email)
    AND accepted_at IS NULL
    AND revoked_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1
$$;

-- ========== 5. Atualiza handle_new_user para exigir convite ==========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tenant_id UUID;
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
  display_name TEXT;
  invite public.invitations;
  applied_plan TEXT := 'free';
BEGIN
  -- Super admins nunca precisam de convite
  IF NOT public.has_role(NEW.id, 'super_admin'::public.app_role) THEN
    -- Procura convite válido para esse email
    SELECT * INTO invite FROM public.find_valid_invitation(NEW.email);

    -- Se não há convite válido, bloqueia o cadastro
    IF invite.id IS NULL THEN
      -- Permite o primeiro usuário do sistema (bootstrap), mas só se não houver nenhum tenant ainda
      IF EXISTS (SELECT 1 FROM public.tenants LIMIT 1) THEN
        RAISE EXCEPTION 'signup_requires_invitation' USING HINT = 'Você precisa de um convite válido para criar uma conta.';
      END IF;
    ELSE
      applied_plan := invite.plan_code;
    END IF;
  END IF;

  display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  base_slug := regexp_replace(lower(unaccent_safe(display_name)), '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  IF base_slug = '' OR base_slug IS NULL THEN base_slug := 'workspace'; END IF;
  final_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM public.tenants WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::TEXT;
  END LOOP;

  INSERT INTO public.tenants (name, slug, plan_code)
  VALUES (display_name || '''s workspace', final_slug, applied_plan)
  RETURNING id INTO new_tenant_id;

  INSERT INTO public.profiles (id, tenant_id, full_name)
  VALUES (NEW.id, new_tenant_id, display_name);

  INSERT INTO public.user_roles (user_id, role, tenant_id)
  VALUES (NEW.id, 'tenant_owner', new_tenant_id);

  -- Marca convite como aceito
  IF invite.id IS NOT NULL THEN
    UPDATE public.invitations SET accepted_at = now() WHERE id = invite.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Garante o trigger (caso não exista)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== 6. Função para contar imóveis ==========
CREATE OR REPLACE FUNCTION public.tenant_property_count(_tenant_id UUID)
RETURNS INT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::INT FROM public.properties WHERE tenant_id = _tenant_id
$$;

-- ========== 7. Trigger de bloqueio do limite de imóveis ==========
CREATE OR REPLACE FUNCTION public.enforce_property_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INT;
  limit_val INT;
  plan TEXT;
BEGIN
  SELECT t.plan_code INTO plan FROM public.tenants t WHERE t.id = NEW.tenant_id;
  SELECT property_limit INTO limit_val FROM public.subscription_plans WHERE code = plan;
  SELECT count(*) INTO current_count FROM public.properties WHERE tenant_id = NEW.tenant_id;

  IF current_count >= COALESCE(limit_val, 1) THEN
    RAISE EXCEPTION 'property_limit_reached' USING HINT = 'Você atingiu o limite de imóveis do seu plano.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_property_limit_trg
  BEFORE INSERT ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.enforce_property_limit();