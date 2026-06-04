DROP POLICY IF EXISTS "Public reads active properties" ON public.properties;

CREATE POLICY "Public reads active properties"
  ON public.properties FOR SELECT TO anon
  USING (
    status = 'active'
    AND EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = properties.tenant_id AND t.is_active = true
    )
  );