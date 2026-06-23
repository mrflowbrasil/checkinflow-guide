
-- Add 'launch' plan mirroring Pro permissions, plus helper function for slot tracking.

-- 1. Insert launch plan (mirrors Pro: 20 properties, R$89,90)
INSERT INTO public.subscription_plans (
  code, name, property_limit, price_cents, price_yearly_cents,
  stripe_price_id_yearly, description, is_active, position
) VALUES (
  'launch', 'Lançamento', 20, 8990, 8990,
  'launch_yearly',
  'Oferta de lançamento — 1 ano completo com os recursos do plano Pro.',
  true, 5
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  property_limit = EXCLUDED.property_limit,
  price_cents = EXCLUDED.price_cents,
  price_yearly_cents = EXCLUDED.price_yearly_cents,
  stripe_price_id_yearly = EXCLUDED.stripe_price_id_yearly,
  description = EXCLUDED.description;

-- 2. Update tenant_has_feature so launch inherits Pro feature set
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
    WHEN 'pms_integrations' THEN EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant_id AND plan_code = 'business')
    ELSE false
  END
$function$;

-- 3. Helper to count Launch slots — public read so the landing page can show "remaining"
CREATE OR REPLACE FUNCTION public.get_launch_slots()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH sold AS (
    SELECT COUNT(DISTINCT tenant_id)::int AS n
    FROM public.subscriptions
    WHERE plan_code = 'launch'
      AND status IN ('active','trialing','past_due')
  )
  SELECT jsonb_build_object(
    'limit', 100,
    'sold', sold.n,
    'remaining', GREATEST(0, 100 - sold.n),
    'available', (sold.n < 100)
  ) FROM sold;
$function$;

GRANT EXECUTE ON FUNCTION public.get_launch_slots() TO anon, authenticated;
