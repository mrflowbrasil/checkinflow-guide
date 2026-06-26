ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS access_password_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS access_password text;