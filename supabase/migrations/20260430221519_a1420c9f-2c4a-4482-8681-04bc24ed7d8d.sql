ALTER TABLE public.tenant_integrations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_integrations;