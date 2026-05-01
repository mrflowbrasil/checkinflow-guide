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
BEGIN
  -- Procura convite válido para esse email (se houver)
  IF NOT public.has_role(NEW.id, 'super_admin'::public.app_role) THEN
    SELECT * INTO invite FROM public.find_valid_invitation(NEW.email);
    IF invite.id IS NOT NULL THEN
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

  IF invite.id IS NOT NULL THEN
    UPDATE public.invitations SET accepted_at = now() WHERE id = invite.id;
  END IF;

  RETURN NEW;
END;
$function$;