
DROP VIEW IF EXISTS public.v_dashboard_property_metrics;
DROP VIEW IF EXISTS public.v_dashboard_monthly_metrics;
DROP VIEW IF EXISTS public.v_reservations_dashboard;

CREATE VIEW public.v_reservations_dashboard
WITH (security_invoker = true) AS
SELECT
  ri.id,
  ri.tenant_id,
  ri.provider,
  ri.external_id,
  ri.synced_at,
  COALESCE(
    ri.payload->'reservation'->>'status',
    ri.payload->>'status',
    ri.payload->>'reservationStatus'
  ) AS status,
  COALESCE(
    ri.payload->'reservation'->>'source_channel',
    ri.payload->'reservation'->>'partner_name_original',
    ri.payload->>'channel',
    ri.payload->>'source'
  ) AS channel,
  NULLIF(COALESCE(
    ri.payload->'reservation'->>'check_in_date',
    ri.payload->>'checkInDate',
    ri.payload->>'arrivalDate',
    ri.payload->>'checkIn'
  ), '')::date AS check_in,
  NULLIF(COALESCE(
    ri.payload->'reservation'->>'check_out_date',
    ri.payload->>'checkOutDate',
    ri.payload->>'departureDate',
    ri.payload->>'checkOut'
  ), '')::date AS check_out,
  COALESCE(
    NULLIF(ri.payload->'reservation'->>'night_count','')::int,
    NULLIF(ri.payload->>'nights','')::int,
    (NULLIF(COALESCE(ri.payload->'reservation'->>'check_out_date', ri.payload->>'checkOutDate'),'')::date
     - NULLIF(COALESCE(ri.payload->'reservation'->>'check_in_date', ri.payload->>'checkInDate'),'')::date)
  ) AS nights,
  COALESCE(
    NULLIF(ri.payload->'reservation'->>'reserve_total','')::numeric,
    NULLIF(ri.payload->'reservation'->>'sell_price_corrected','')::numeric,
    NULLIF(ri.payload->>'totalPrice','')::numeric,
    NULLIF(ri.payload->'price'->>'total','')::numeric,
    NULLIF(ri.payload->>'amount','')::numeric
  ) AS total_amount,
  COALESCE(
    ri.payload->'reservation'->>'currency',
    ri.payload->'property'->>'currency',
    ri.payload->>'currency'
  ) AS currency,
  COALESCE(
    ri.payload->'property'->>'external_id',
    ri.payload->'reservation'->>'property_external_id',
    ri.payload->>'listingMapId',
    ri.payload->>'propertyId',
    ri.payload->>'listingId'
  ) AS property_external_id,
  COALESCE(
    ri.payload->'property'->>'public_name',
    ri.payload->'property'->>'internal_name',
    ri.payload->'reservation'->>'property_internal_name'
  ) AS property_name,
  COALESCE(
    ri.payload->'guest'->>'full_name',
    ri.payload->>'guestName',
    ri.payload->'guest'->>'name'
  ) AS guest_name,
  COALESCE(
    NULLIF(ri.payload->'reservation'->>'guest_count','')::int,
    NULLIF(ri.payload->>'guestCount','')::int
  ) AS guest_count
FROM public.reservations_import ri;

GRANT SELECT ON public.v_reservations_dashboard TO authenticated;

CREATE VIEW public.v_dashboard_monthly_metrics
WITH (security_invoker = true) AS
SELECT
  tenant_id,
  date_trunc('month', check_in)::date AS month,
  SUM(CASE WHEN lower(coalesce(status,'')) NOT IN ('canceled','cancelled','canceled_by_guest','canceled_by_host') THEN total_amount ELSE 0 END) AS revenue,
  SUM(CASE WHEN lower(coalesce(status,'')) NOT IN ('canceled','cancelled','canceled_by_guest','canceled_by_host') THEN nights ELSE 0 END) AS nights,
  COUNT(*) FILTER (WHERE lower(coalesce(status,'')) NOT IN ('canceled','cancelled','canceled_by_guest','canceled_by_host')) AS confirmed_count,
  COUNT(*) FILTER (WHERE lower(coalesce(status,'')) IN ('canceled','cancelled','canceled_by_guest','canceled_by_host')) AS canceled_count,
  CASE WHEN COUNT(*) FILTER (WHERE lower(coalesce(status,'')) NOT IN ('canceled','cancelled','canceled_by_guest','canceled_by_host')) > 0
       THEN SUM(CASE WHEN lower(coalesce(status,'')) NOT IN ('canceled','cancelled','canceled_by_guest','canceled_by_host') THEN total_amount ELSE 0 END)
            / NULLIF(COUNT(*) FILTER (WHERE lower(coalesce(status,'')) NOT IN ('canceled','cancelled','canceled_by_guest','canceled_by_host')),0)
       ELSE 0 END AS avg_ticket
FROM public.v_reservations_dashboard
WHERE check_in IS NOT NULL
GROUP BY tenant_id, date_trunc('month', check_in);

GRANT SELECT ON public.v_dashboard_monthly_metrics TO authenticated;

CREATE VIEW public.v_dashboard_property_metrics
WITH (security_invoker = true) AS
SELECT
  r.tenant_id,
  r.property_external_id,
  COALESCE(r.property_name, p.name) AS property_name,
  SUM(CASE WHEN lower(coalesce(r.status,'')) NOT IN ('canceled','cancelled','canceled_by_guest','canceled_by_host') THEN r.total_amount ELSE 0 END) AS revenue,
  SUM(CASE WHEN lower(coalesce(r.status,'')) NOT IN ('canceled','cancelled','canceled_by_guest','canceled_by_host') THEN r.nights ELSE 0 END) AS nights,
  COUNT(*) FILTER (WHERE lower(coalesce(r.status,'')) NOT IN ('canceled','cancelled','canceled_by_guest','canceled_by_host')) AS confirmed_count,
  COUNT(*) FILTER (WHERE lower(coalesce(r.status,'')) IN ('canceled','cancelled','canceled_by_guest','canceled_by_host')) AS canceled_count,
  MAX(r.check_in) AS last_check_in
FROM public.v_reservations_dashboard r
LEFT JOIN public.properties p
  ON p.tenant_id = r.tenant_id
 AND p.external_id = r.property_external_id
WHERE r.property_external_id IS NOT NULL
GROUP BY r.tenant_id, r.property_external_id, COALESCE(r.property_name, p.name);

GRANT SELECT ON public.v_dashboard_property_metrics TO authenticated;
