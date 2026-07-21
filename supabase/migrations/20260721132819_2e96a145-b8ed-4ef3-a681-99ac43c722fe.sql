
-- 1) Add public_disabled_reason to properties
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS public_disabled_reason text;

-- 2) Add trial columns to tenants
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_status text NOT NULL DEFAULT 'active';

-- 3) Backfill trial windows for existing tenants
UPDATE public.tenants t
   SET trial_started_at = COALESCE(trial_started_at, t.created_at),
       trial_ends_at    = COALESCE(trial_ends_at, t.created_at + interval '30 days');

-- 4) Mark converted / waived / expired
-- Converted: has an active-ish subscription
UPDATE public.tenants t
   SET trial_status = 'converted'
  WHERE EXISTS (
    SELECT 1 FROM public.subscriptions s
     WHERE s.tenant_id = t.id
       AND s.status IN ('active','trialing','past_due')
  );

-- Waived: launch plan or super admin owner
UPDATE public.tenants t
   SET trial_status = 'waived'
 WHERE trial_status = 'active'
   AND (
     t.plan_code = 'launch'
     OR EXISTS (
       SELECT 1
         FROM public.user_roles ur
        WHERE ur.tenant_id = t.id
          AND ur.role = 'super_admin'::public.app_role
     )
     OR EXISTS (
       SELECT 1
         FROM public.profiles p
         JOIN public.user_roles ur ON ur.user_id = p.id
        WHERE p.tenant_id = t.id
          AND ur.role = 'super_admin'::public.app_role
     )
   );

-- Also: plans other than free are effectively paid
UPDATE public.tenants t
   SET trial_status = 'converted'
 WHERE trial_status = 'active'
   AND t.plan_code NOT IN ('free');

-- Expired: still on free, no subscription, past the trial window
UPDATE public.tenants t
   SET trial_status = 'expired'
 WHERE trial_status = 'active'
   AND t.plan_code = 'free'
   AND t.trial_ends_at < now();

-- 5) Enforcement function
CREATE OR REPLACE FUNCTION public.enforce_trial_expiration()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected int := 0;
BEGIN
  WITH expiring AS (
    SELECT t.id
      FROM public.tenants t
     WHERE t.trial_status = 'active'
       AND t.plan_code = 'free'
       AND t.trial_ends_at IS NOT NULL
       AND t.trial_ends_at < now()
       AND NOT EXISTS (
         SELECT 1 FROM public.subscriptions s
          WHERE s.tenant_id = t.id
            AND s.status IN ('active','trialing','past_due')
       )
  ), upd_tenants AS (
    UPDATE public.tenants
       SET trial_status = 'expired'
     WHERE id IN (SELECT id FROM expiring)
     RETURNING id
  )
  UPDATE public.properties p
     SET status = 'inactive',
         public_disabled_reason = 'trial_expired',
         updated_at = now()
   WHERE p.tenant_id IN (SELECT id FROM upd_tenants)
     AND p.status = 'active';

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

-- 6) Helper to reactivate on payment (called from webhook via RPC or SQL)
CREATE OR REPLACE FUNCTION public.mark_tenant_converted(_tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.tenants
     SET trial_status = 'converted'
   WHERE id = _tenant_id
     AND trial_status IN ('active','expired');

  UPDATE public.properties
     SET status = 'active',
         public_disabled_reason = NULL,
         updated_at = now()
   WHERE tenant_id = _tenant_id
     AND public_disabled_reason = 'trial_expired';
END;
$$;
