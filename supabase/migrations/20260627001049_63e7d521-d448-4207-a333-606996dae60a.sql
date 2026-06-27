
-- 1. Tabela bruta de reservas
CREATE TABLE IF NOT EXISTS public.reservations_import (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  provider text NOT NULL,
  external_id text NOT NULL,
  payload jsonb NOT NULL,
  synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT reservations_import_unique UNIQUE (tenant_id, provider, external_id)
);

CREATE INDEX IF NOT EXISTS idx_reservations_import_tenant_provider
  ON public.reservations_import (tenant_id, provider);
CREATE INDEX IF NOT EXISTS idx_reservations_import_tenant_synced
  ON public.reservations_import (tenant_id, synced_at DESC);

GRANT SELECT ON public.reservations_import TO authenticated;
GRANT ALL    ON public.reservations_import TO service_role;

ALTER TABLE public.reservations_import ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can read reservations"
  ON public.reservations_import
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = public.current_tenant_id()
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- 2. Views

DROP VIEW IF EXISTS public.v_dashboard_property_metrics;
DROP VIEW IF EXISTS public.v_dashboard_monthly_metrics;
DROP VIEW IF EXISTS public.v_reservations_dashboard;

CREATE VIEW public.v_reservations_dashboard AS
WITH base AS (
  SELECT
    ri.id,
    ri.tenant_id,
    ri.provider,
    ri.external_id,
    ri.synced_at,
    ri.created_at,
    COALESCE(ri.payload->>'status', ri.payload->>'reservationStatus', ri.payload->>'state') AS status_raw,
    NULLIF(COALESCE(ri.payload->>'checkInDate', ri.payload->>'arrivalDate', ri.payload->>'checkIn', ri.payload->>'startDate'), '') AS check_in_raw,
    NULLIF(COALESCE(ri.payload->>'checkOutDate', ri.payload->>'departureDate', ri.payload->>'checkOut', ri.payload->>'endDate'), '') AS check_out_raw,
    NULLIF(COALESCE(ri.payload->>'totalPrice', ri.payload->'price'->>'total', ri.payload->>'totalAmount', ri.payload->>'amount'), '') AS total_raw,
    COALESCE(ri.payload->>'currency', ri.payload->'price'->>'currency') AS currency,
    COALESCE(ri.payload->>'listingMapId', ri.payload->>'propertyId', ri.payload->>'listingId', ri.payload->>'apartmentId') AS property_external_id,
    COALESCE(
      ri.payload->>'guestName',
      ri.payload->'guest'->>'name',
      trim(concat_ws(' ', ri.payload->'guest'->>'firstName', ri.payload->'guest'->>'lastName'))
    ) AS guest_name,
    COALESCE(ri.payload->>'channel', ri.payload->>'source', ri.payload->>'channelName') AS channel,
    NULLIF(ri.payload->>'nights', '') AS nights_raw
  FROM public.reservations_import ri
)
SELECT
  id,
  tenant_id,
  provider,
  external_id,
  status_raw AS status,
  CASE WHEN check_in_raw  ~ '^\d{4}-\d{2}-\d{2}' THEN check_in_raw::date  END AS check_in,
  CASE WHEN check_out_raw ~ '^\d{4}-\d{2}-\d{2}' THEN check_out_raw::date END AS check_out,
  COALESCE(
    NULLIF(nights_raw, '')::int,
    CASE WHEN check_in_raw  ~ '^\d{4}-\d{2}-\d{2}'
          AND check_out_raw ~ '^\d{4}-\d{2}-\d{2}'
         THEN (check_out_raw::date - check_in_raw::date) END
  ) AS nights,
  CASE WHEN total_raw ~ '^-?\d+(\.\d+)?$' THEN total_raw::numeric END AS total_amount,
  currency,
  property_external_id,
  guest_name,
  channel,
  synced_at,
  created_at,
  lower(coalesce(status_raw, '')) IN ('canceled','cancelled','cancel') AS is_canceled
FROM base;

GRANT SELECT ON public.v_reservations_dashboard TO authenticated;

CREATE VIEW public.v_dashboard_monthly_metrics AS
SELECT
  tenant_id,
  date_trunc('month', check_in)::date AS month,
  COUNT(*) FILTER (WHERE NOT is_canceled)                AS confirmed_count,
  COUNT(*) FILTER (WHERE is_canceled)                    AS canceled_count,
  COALESCE(SUM(nights)        FILTER (WHERE NOT is_canceled), 0) AS nights,
  COALESCE(SUM(total_amount)  FILTER (WHERE NOT is_canceled), 0) AS revenue,
  CASE
    WHEN COUNT(*) FILTER (WHERE NOT is_canceled) > 0
      THEN COALESCE(SUM(total_amount) FILTER (WHERE NOT is_canceled), 0)
           / NULLIF(COUNT(*) FILTER (WHERE NOT is_canceled), 0)
  END AS avg_ticket
FROM public.v_reservations_dashboard
WHERE check_in IS NOT NULL
GROUP BY tenant_id, date_trunc('month', check_in);

GRANT SELECT ON public.v_dashboard_monthly_metrics TO authenticated;

CREATE VIEW public.v_dashboard_property_metrics AS
SELECT
  r.tenant_id,
  r.property_external_id,
  p.id   AS property_id,
  p.name AS property_name,
  COUNT(*) FILTER (WHERE NOT r.is_canceled)                AS confirmed_count,
  COUNT(*) FILTER (WHERE r.is_canceled)                    AS canceled_count,
  COALESCE(SUM(r.nights)       FILTER (WHERE NOT r.is_canceled), 0) AS nights,
  COALESCE(SUM(r.total_amount) FILTER (WHERE NOT r.is_canceled), 0) AS revenue,
  MAX(r.check_in)  AS last_check_in,
  MAX(r.synced_at) AS last_synced_at
FROM public.v_reservations_dashboard r
LEFT JOIN public.properties p
  ON p.tenant_id = r.tenant_id
 AND p.external_id = r.property_external_id
WHERE r.property_external_id IS NOT NULL
GROUP BY r.tenant_id, r.property_external_id, p.id, p.name;

GRANT SELECT ON public.v_dashboard_property_metrics TO authenticated;
