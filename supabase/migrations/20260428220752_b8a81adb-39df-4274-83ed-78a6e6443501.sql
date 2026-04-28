
-- ========== ENUMS ==========
CREATE TYPE public.app_role AS ENUM ('super_admin', 'tenant_owner');
CREATE TYPE public.property_status AS ENUM ('active', 'inactive');
CREATE TYPE public.tenant_template AS ENUM ('clean', 'dark', 'luxury');
CREATE TYPE public.block_type AS ENUM ('text', 'subtitle', 'image', 'video', 'steps', 'tip', 'button', 'list');

-- ========== TABLES ==========

CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  primary_color TEXT NOT NULL DEFAULT '#0F1E3D',
  secondary_color TEXT NOT NULL DEFAULT '#FFFFFF',
  logo_url TEXT,
  template public.tenant_template NOT NULL DEFAULT 'clean',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, tenant_id)
);

CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  external_id TEXT,
  address TEXT,
  description TEXT,
  booking_url TEXT,
  cover_image_url TEXT,
  status public.property_status NOT NULL DEFAULT 'inactive',
  public_slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_properties_tenant ON public.properties(tenant_id);
CREATE INDEX idx_properties_slug ON public.properties(public_slug);

CREATE TABLE public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_property_images_property ON public.property_images(property_id);

CREATE TABLE public.property_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  page_key TEXT NOT NULL,
  title TEXT NOT NULL,
  icon TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, page_key)
);

CREATE INDEX idx_property_pages_property ON public.property_pages(property_id);

CREATE TABLE public.content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.property_pages(id) ON DELETE CASCADE,
  type public.block_type NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_blocks_page ON public.content_blocks(page_id);

-- ========== HELPER FUNCTIONS (SECURITY DEFINER) ==========

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_property_active(_property_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.tenants t ON t.id = p.tenant_id
    WHERE p.id = _property_id AND p.status = 'active' AND t.is_active = true
  )
$$;

-- ========== TRIGGERS ==========

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_tenants_updated BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_properties_updated BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_pages_updated BEFORE UPDATE ON public.property_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_blocks_updated BEFORE UPDATE ON public.content_blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Signup trigger: create tenant, profile, role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_tenant_id UUID;
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
  display_name TEXT;
BEGIN
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

  INSERT INTO public.tenants (name, slug)
  VALUES (display_name || '''s workspace', final_slug)
  RETURNING id INTO new_tenant_id;

  INSERT INTO public.profiles (id, tenant_id, full_name)
  VALUES (NEW.id, new_tenant_id, display_name);

  INSERT INTO public.user_roles (user_id, role, tenant_id)
  VALUES (NEW.id, 'tenant_owner', new_tenant_id);

  RETURN NEW;
END;
$$;

-- Simple unaccent fallback (no extension dependency)
CREATE OR REPLACE FUNCTION public.unaccent_safe(input TEXT)
RETURNS TEXT LANGUAGE SQL IMMUTABLE AS $$
  SELECT translate(
    input,
    'áàâãäåÁÀÂÃÄÅéèêëÉÈÊËíìîïÍÌÎÏóòôõöÓÒÔÕÖúùûüÚÙÛÜçÇñÑ',
    'aaaaaaAAAAAAeeeeEEEEiiiiIIIIoooooOOOOOuuuuUUUUcCnN'
  )
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Property creation trigger: seed 19 default pages
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
    (NEW.id, 'review', 'Avaliação', 'Star', 18),
    (NEW.id, 'faq', 'FAQ', 'HelpCircle', 19);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_property_created
  AFTER INSERT ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.seed_property_pages();

-- ========== ENABLE RLS ==========
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

-- ========== RLS: tenants ==========
CREATE POLICY "Users view own tenant" ON public.tenants
  FOR SELECT TO authenticated
  USING (id = public.current_tenant_id() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Tenant owners update own tenant" ON public.tenants
  FOR UPDATE TO authenticated
  USING (id = public.current_tenant_id() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin all tenants" ON public.tenants
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Public read for active tenants (needed for public guide page branding)
CREATE POLICY "Public reads active tenants" ON public.tenants
  FOR SELECT TO anon
  USING (is_active = true);

-- ========== RLS: profiles ==========
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- ========== RLS: user_roles ==========
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin manages roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- ========== RLS: properties ==========
CREATE POLICY "Tenant members manage own properties" ON public.properties
  FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id() OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (tenant_id = public.current_tenant_id() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Public reads active properties" ON public.properties
  FOR SELECT TO anon
  USING (status = 'active');

-- ========== RLS: property_images ==========
CREATE POLICY "Tenant manages property images" ON public.property_images
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND (p.tenant_id = public.current_tenant_id() OR public.has_role(auth.uid(), 'super_admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND (p.tenant_id = public.current_tenant_id() OR public.has_role(auth.uid(), 'super_admin'))));

CREATE POLICY "Public reads images of active properties" ON public.property_images
  FOR SELECT TO anon
  USING (public.is_property_active(property_id));

-- ========== RLS: property_pages ==========
CREATE POLICY "Tenant manages property pages" ON public.property_pages
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND (p.tenant_id = public.current_tenant_id() OR public.has_role(auth.uid(), 'super_admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND (p.tenant_id = public.current_tenant_id() OR public.has_role(auth.uid(), 'super_admin'))));

CREATE POLICY "Public reads pages of active properties" ON public.property_pages
  FOR SELECT TO anon
  USING (is_enabled = true AND public.is_property_active(property_id));

-- ========== RLS: content_blocks ==========
CREATE POLICY "Tenant manages content blocks" ON public.content_blocks
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.property_pages pp JOIN public.properties p ON p.id = pp.property_id WHERE pp.id = page_id AND (p.tenant_id = public.current_tenant_id() OR public.has_role(auth.uid(), 'super_admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.property_pages pp JOIN public.properties p ON p.id = pp.property_id WHERE pp.id = page_id AND (p.tenant_id = public.current_tenant_id() OR public.has_role(auth.uid(), 'super_admin'))));

CREATE POLICY "Public reads blocks of active properties" ON public.content_blocks
  FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.property_pages pp WHERE pp.id = page_id AND pp.is_enabled = true AND public.is_property_active(pp.property_id)));

-- ========== STORAGE BUCKETS ==========
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('property-covers', 'property-covers', true),
  ('property-gallery', 'property-gallery', true),
  ('block-media', 'block-media', true),
  ('tenant-logos', 'tenant-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users can upload/manage; everyone can read
CREATE POLICY "Public read storage" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('property-covers', 'property-gallery', 'block-media', 'tenant-logos'));

CREATE POLICY "Authenticated upload storage" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('property-covers', 'property-gallery', 'block-media', 'tenant-logos'));

CREATE POLICY "Authenticated update own storage" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('property-covers', 'property-gallery', 'block-media', 'tenant-logos') AND owner = auth.uid());

CREATE POLICY "Authenticated delete own storage" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id IN ('property-covers', 'property-gallery', 'block-media', 'tenant-logos') AND owner = auth.uid());
