
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS button_shape TEXT NOT NULL DEFAULT 'rounded'
    CHECK (button_shape IN ('square','rounded','pill')),
  ADD COLUMN IF NOT EXISTS button_border TEXT NOT NULL DEFAULT 'none'
    CHECK (button_border IN ('none','outline')),
  ADD COLUMN IF NOT EXISTS cover_transition TEXT NOT NULL DEFAULT 'line'
    CHECK (cover_transition IN ('line','gradient'));
