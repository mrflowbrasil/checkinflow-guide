
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_tenant_id UUID;
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
  display_name TEXT;
  invite public.invitations;
  applied_plan TEXT := 'free';
  pending public.pending_purchases;
BEGIN
  IF NOT public.has_role(NEW.id, 'super_admin'::public.app_role) THEN
    SELECT * INTO invite FROM public.find_valid_invitation(NEW.email);
    IF invite.id IS NOT NULL THEN
      applied_plan := invite.plan_code;
    END IF;
  END IF;

  SELECT * INTO pending
  FROM public.pending_purchases
  WHERE lower(email) = lower(NEW.email)
    AND claimed_at IS NULL
    AND status IN ('active','trialing','past_due')
  ORDER BY created_at DESC
  LIMIT 1;

  IF pending.id IS NOT NULL THEN
    applied_plan := pending.plan_code;
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

  INSERT INTO public.tenants (name, slug, plan_code, trial_started_at, trial_ends_at)
  VALUES (
    display_name || '''s workspace',
    final_slug,
    applied_plan,
    now(),
    now() + interval '30 days'
  )
  RETURNING id INTO new_tenant_id;

  IF public.has_role(NEW.id, 'super_admin'::public.app_role) THEN
    UPDATE public.tenants SET trial_status = 'waived' WHERE id = new_tenant_id;
  ELSIF applied_plan <> 'free' THEN
    UPDATE public.tenants SET trial_status = 'converted' WHERE id = new_tenant_id;
  END IF;

  IF pending.id IS NOT NULL THEN
    UPDATE public.tenants
       SET plan_status = pending.status,
           plan_expires_at = pending.current_period_end,
           stripe_customer_id = pending.stripe_customer_id,
           stripe_subscription_id = pending.stripe_subscription_id,
           trial_status = 'converted'
     WHERE id = new_tenant_id;

    INSERT INTO public.subscriptions (
      tenant_id, user_id, stripe_subscription_id, stripe_customer_id,
      product_id, price_id, plan_code, billing_interval, status,
      current_period_start, current_period_end, environment
    ) VALUES (
      new_tenant_id, NEW.id, pending.stripe_subscription_id, pending.stripe_customer_id,
      COALESCE(pending.product_id, ''), pending.price_id, pending.plan_code,
      pending.billing_interval, pending.status,
      pending.current_period_start, pending.current_period_end, pending.environment
    )
    ON CONFLICT (stripe_subscription_id) DO NOTHING;

    UPDATE public.pending_purchases
       SET claimed_at = now(), claimed_by_user_id = NEW.id, updated_at = now()
     WHERE id = pending.id;
  END IF;

  INSERT INTO public.profiles (id, tenant_id, full_name)
  VALUES (NEW.id, new_tenant_id, display_name);

  INSERT INTO public.user_roles (user_id, role, tenant_id)
  VALUES (NEW.id, 'tenant_owner', new_tenant_id);

  IF invite.id IS NOT NULL THEN
    UPDATE public.invitations SET accepted_at = now() WHERE id = invite.id;
  END IF;

  RETURN NEW;
END;
$function$;
