CREATE POLICY "Block direct inserts from clients"
  ON public.tenant_api_keys FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "Block direct updates from clients"
  ON public.tenant_api_keys FOR UPDATE TO authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "Block direct deletes from clients"
  ON public.tenant_api_keys FOR DELETE TO authenticated
  USING (false);