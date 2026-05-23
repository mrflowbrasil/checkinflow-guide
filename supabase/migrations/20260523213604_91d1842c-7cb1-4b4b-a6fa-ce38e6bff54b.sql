
-- Re-affirm SECURITY DEFINER + search_path on trigger functions
CREATE OR REPLACE FUNCTION public.enforce_property_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.seed_property_pages()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.property_pages (property_id, page_key, title, icon, position) VALUES
    (NEW.id, 'checkin', 'Check-in', 'Clock', 1),
    (NEW.id, 'lock_code', 'Senha Fechadura', 'KeyRound', 2),
    (NEW.id, 'checkout', 'Check-out', 'LogOut', 3),
    (NEW.id, 'wifi', 'Wi-Fi', 'Wifi', 4),
    (NEW.id, 'location', 'Localização', 'MapPin', 5),
    (NEW.id, 'rules', 'Regras', 'BookOpen', 6),
    (NEW.id, 'equipment', 'Equipamentos', 'Wrench', 7),
    (NEW.id, 'furniture', 'Mobília', 'Sofa', 8),
    (NEW.id, 'condo', 'Condomínio', 'Building2', 9),
    (NEW.id, 'parking', 'Estacionamento', 'Car', 10),
    (NEW.id, 'trash', 'Lixo', 'Trash2', 11),
    (NEW.id, 'economy', 'Economia', 'Zap', 12),
    (NEW.id, 'before_leaving', 'Antes de Sair', 'DoorOpen', 13),
    (NEW.id, 'tips', 'Dicas', 'Lightbulb', 14),
    (NEW.id, 'contacts', 'Contatos', 'Phone', 15),
    (NEW.id, 'emergency', 'Emergência', 'Siren', 16),
    (NEW.id, 'how_to_arrive', 'Como Chegar', 'Navigation', 17),
    (NEW.id, 'transport', 'Transportes', 'Bus', 18),
    (NEW.id, 'restaurants', 'Onde Comer', 'UtensilsCrossed', 19),
    (NEW.id, 'attractions', 'Pontos Turísticos', 'Landmark', 20),
    (NEW.id, 'maintenance', 'Manutenção', 'Hammer', 21),
    (NEW.id, 'review', 'Avaliação', 'Star', 22),
    (NEW.id, 'faq', 'FAQ', 'HelpCircle', 23),
    (NEW.id, 'convenience', 'Conveniências', 'Store', 24);
  RETURN NEW;
END;
$function$;

-- Restore grants required by INSERT into properties
GRANT EXECUTE ON FUNCTION public.enforce_property_limit() TO authenticated;
GRANT EXECUTE ON FUNCTION public.seed_property_pages() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.tenant_has_feature(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_property_active(uuid) TO authenticated, anon;

-- Ensure triggers exist
DROP TRIGGER IF EXISTS enforce_property_limit_trg ON public.properties;
CREATE TRIGGER enforce_property_limit_trg
BEFORE INSERT ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.enforce_property_limit();

DROP TRIGGER IF EXISTS on_property_created ON public.properties;
CREATE TRIGGER on_property_created
AFTER INSERT ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.seed_property_pages();
