CREATE TABLE public.first_property_reminders (
  user_id uuid PRIMARY KEY,
  sent_at timestamptz NOT NULL DEFAULT now(),
  email_status text,
  webhook_status text
);

GRANT ALL ON public.first_property_reminders TO service_role;

ALTER TABLE public.first_property_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages reminders"
  ON public.first_property_reminders
  FOR ALL
  TO public
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);