CREATE TABLE public.admin_action_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id uuid NOT NULL,
  action text NOT NULL,
  target_user_id uuid,
  target_email text,
  reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_action_log_created_at ON public.admin_action_log(created_at DESC);
CREATE INDEX idx_admin_action_log_target_user ON public.admin_action_log(target_user_id);

ALTER TABLE public.admin_action_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin reads action log"
  ON public.admin_action_log FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admin inserts action log"
  ON public.admin_action_log FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) AND admin_user_id = auth.uid());