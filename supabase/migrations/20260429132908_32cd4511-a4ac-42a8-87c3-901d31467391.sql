-- Update seed function to include 2 new pages
CREATE OR REPLACE FUNCTION public.seed_property_pages()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.property_pages (property_id, page_key, title, icon, position) VALUES
    (NEW.id, 'checkin', 'Check-in', 'Clock', 1),
    (NEW.id, 'checkout', 'Check-out', 'LogOut', 2),
    (NEW.id, 'wifi', 'Wi-Fi', 'Wifi', 3),
    (NEW.id, 'location', 'Localização', 'MapPin', 4),
    (NEW.id, 'rules', 'Regras', 'BookOpen', 5),
    (NEW.id, 'equipment', 'Equipamentos', 'Wrench', 6),
    (NEW.id, 'furniture', 'Mobília', 'Sofa', 7),
    (NEW.id, 'condo', 'Condomínio', 'Building2', 8),
    (NEW.id, 'parking', 'Estacionamento', 'Car', 9),
    (NEW.id, 'trash', 'Lixo', 'Trash2', 10),
    (NEW.id, 'economy', 'Economia', 'Zap', 11),
    (NEW.id, 'before_leaving', 'Antes de Sair', 'DoorOpen', 12),
    (NEW.id, 'tips', 'Dicas', 'Lightbulb', 13),
    (NEW.id, 'contacts', 'Contatos', 'Phone', 14),
    (NEW.id, 'emergency', 'Emergência', 'Siren', 15),
    (NEW.id, 'how_to_arrive', 'Como Chegar', 'Navigation', 16),
    (NEW.id, 'transport', 'Transportes', 'Bus', 17),
    (NEW.id, 'restaurants', 'Onde Comer', 'UtensilsCrossed', 18),
    (NEW.id, 'attractions', 'Pontos Turísticos', 'Landmark', 19),
    (NEW.id, 'review', 'Avaliação', 'Star', 20),
    (NEW.id, 'faq', 'FAQ', 'HelpCircle', 21);
  RETURN NEW;
END;
$$;

-- Backfill existing properties with the two new pages
INSERT INTO public.property_pages (property_id, page_key, title, icon, position)
SELECT p.id, 'restaurants', 'Onde Comer', 'UtensilsCrossed', 18
FROM public.properties p
WHERE NOT EXISTS (
  SELECT 1 FROM public.property_pages pp WHERE pp.property_id = p.id AND pp.page_key = 'restaurants'
);

INSERT INTO public.property_pages (property_id, page_key, title, icon, position)
SELECT p.id, 'attractions', 'Pontos Turísticos', 'Landmark', 19
FROM public.properties p
WHERE NOT EXISTS (
  SELECT 1 FROM public.property_pages pp WHERE pp.property_id = p.id AND pp.page_key = 'attractions'
);

-- Shift review and faq positions for existing properties
UPDATE public.property_pages SET position = 20 WHERE page_key = 'review' AND position = 18;
UPDATE public.property_pages SET position = 21 WHERE page_key = 'faq' AND position = 19;