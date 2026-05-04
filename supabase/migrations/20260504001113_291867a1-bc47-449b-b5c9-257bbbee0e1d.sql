-- Update seed function to include Manutenção for new properties
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
    (NEW.id, 'faq', 'FAQ', 'HelpCircle', 23);
  RETURN NEW;
END;
$function$;

-- Backfill: add Manutenção page (disabled by default) to existing properties that don't have it
INSERT INTO public.property_pages (property_id, page_key, title, icon, position, is_enabled)
SELECT p.id, 'maintenance', 'Manutenção', 'Hammer',
       COALESCE((SELECT MAX(position) FROM public.property_pages WHERE property_id = p.id), 0) + 1,
       false
FROM public.properties p
WHERE NOT EXISTS (
  SELECT 1 FROM public.property_pages pp
  WHERE pp.property_id = p.id AND pp.page_key = 'maintenance'
);