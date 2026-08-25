CREATE TABLE public.property_lock_code_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  lock_code text NOT NULL,
  apply_at timestamptz NOT NULL,
  remove_at timestamptz,
  status text NOT NULL DEFAULT 'scheduled',
  applied_at timestamptz,
  removed_at timestamptz,
  last_error text,
  source text NOT NULL DEFAULT 'api',
  reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lock_code_schedule_status_chk CHECK (status IN ('scheduled','applied','removed','canceled','failed')),
  CONSTRAINT lock_code_schedule_window_chk CHECK (remove_at IS NULL OR remove_at > apply_at),
  CONSTRAINT lock_code_schedule_code_len_chk CHECK (char_length(lock_code) BETWEEN 1 AND 32)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_lock_code_schedules TO authenticated;
GRANT ALL ON public.property_lock_code_schedules TO service_role;

ALTER TABLE public.property_lock_code_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members manage own lock code schedules"
ON public.property_lock_code_schedules
FOR ALL
TO authenticated
USING (tenant_id = public.current_tenant_id() OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (tenant_id = public.current_tenant_id() OR public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE INDEX idx_lock_code_schedules_due ON public.property_lock_code_schedules (status, apply_at);
CREATE INDEX idx_lock_code_schedules_remove ON public.property_lock_code_schedules (status, remove_at);
CREATE INDEX idx_lock_code_schedules_property ON public.property_lock_code_schedules (property_id, created_at DESC);

CREATE TRIGGER trg_lock_code_schedules_updated
BEFORE UPDATE ON public.property_lock_code_schedules
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();