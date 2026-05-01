ALTER TYPE public.block_type ADD VALUE IF NOT EXISTS 'password';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'property_details_property_id_unique'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'property_details'
      AND c.contype IN ('u','p')
      AND EXISTS (
        SELECT 1 FROM unnest(c.conkey) k
        JOIN pg_attribute a ON a.attnum = k AND a.attrelid = c.conrelid
        WHERE a.attname = 'property_id'
      )
  ) THEN
    ALTER TABLE public.property_details
      ADD CONSTRAINT property_details_property_id_unique UNIQUE (property_id);
  END IF;
END $$;