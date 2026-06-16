ALTER TABLE public.tenant_api_keys
ADD COLUMN IF NOT EXISTS key_ciphertext TEXT;

COMMENT ON COLUMN public.tenant_api_keys.key_ciphertext IS 'Encrypted recoverable copy of the API key for backend-only webhook callbacks. Never selected by client-facing endpoints.';