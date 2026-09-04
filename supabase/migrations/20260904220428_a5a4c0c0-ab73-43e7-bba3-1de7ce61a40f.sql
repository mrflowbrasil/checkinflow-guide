DROP POLICY IF EXISTS "Public reads active properties" ON public.properties;
CREATE POLICY "Public reads active properties"
ON public.properties
FOR SELECT
TO anon, authenticated
USING (
  status = 'active'::public.property_status
  AND EXISTS (
    SELECT 1 FROM public.tenants t
    WHERE t.id = properties.tenant_id
      AND t.is_active = true
  )
);

DROP POLICY IF EXISTS "Public reads active tenants" ON public.tenants;
CREATE POLICY "Public reads active tenants"
ON public.tenants
FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Public reads pages of active properties" ON public.property_pages;
CREATE POLICY "Public reads pages of active properties"
ON public.property_pages
FOR SELECT
TO anon, authenticated
USING (is_enabled = true AND public.is_property_active(property_id));

DROP POLICY IF EXISTS "Public reads blocks of active properties" ON public.content_blocks;
CREATE POLICY "Public reads blocks of active properties"
ON public.content_blocks
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.property_pages pp
    WHERE pp.id = content_blocks.page_id
      AND pp.is_enabled = true
      AND public.is_property_active(pp.property_id)
  )
);