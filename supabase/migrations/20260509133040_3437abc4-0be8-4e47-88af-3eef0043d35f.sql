
-- Single (mantém code='free' para preservar FKs)
UPDATE public.subscription_plans
SET name = 'Single',
    description = 'Host individual',
    price_cents = 890,
    price_yearly_cents = 8900,
    property_limit = 1,
    position = 1
WHERE code = 'free';

-- Starter
UPDATE public.subscription_plans
SET description = 'Pequenas operações',
    position = 2
WHERE code = 'starter';

-- Pro
UPDATE public.subscription_plans
SET description = 'Operação profissional',
    price_cents = 8990,
    price_yearly_cents = 89900,
    position = 3
WHERE code = 'pro';

-- Business
UPDATE public.subscription_plans
SET description = 'Administradora',
    price_cents = 19990,
    price_yearly_cents = 199000,
    property_limit = 50,
    position = 4
WHERE code = 'business';

-- Enterprise (novo)
INSERT INTO public.subscription_plans
  (code, name, description, property_limit, price_cents, price_yearly_cents, position, is_active)
VALUES
  ('enterprise', 'Enterprise', 'Rede / grande operação', 999999, 0, 0, 5, true)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      property_limit = EXCLUDED.property_limit,
      price_cents = EXCLUDED.price_cents,
      price_yearly_cents = EXCLUDED.price_yearly_cents,
      position = EXCLUDED.position,
      is_active = EXCLUDED.is_active;
