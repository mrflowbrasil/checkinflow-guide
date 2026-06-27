
CREATE OR REPLACE VIEW public.v_reservations_dashboard AS
SELECT
  ri.id,
  ri.tenant_id,
  ri.provider,
  ri.external_id,
  ri.synced_at,
  COALESCE((payload->'reservation')->>'status', payload->>'status', payload->>'reservationStatus') AS status,
  COALESCE((payload->'reservation')->>'source_channel', (payload->'reservation')->>'partner_name_original', payload->>'channel', payload->>'source') AS channel,
  NULLIF(COALESCE((payload->'reservation')->>'check_in_date', payload->>'checkInDate', payload->>'arrivalDate', payload->>'checkIn'), '')::date AS check_in,
  NULLIF(COALESCE((payload->'reservation')->>'check_out_date', payload->>'checkOutDate', payload->>'departureDate', payload->>'checkOut'), '')::date AS check_out,
  COALESCE(
    NULLIF((payload->'reservation')->>'night_count','')::int,
    NULLIF(payload->>'nights','')::int,
    (NULLIF(COALESCE((payload->'reservation')->>'check_out_date', payload->>'checkOutDate'),'')::date
     - NULLIF(COALESCE((payload->'reservation')->>'check_in_date', payload->>'checkInDate'),'')::date)
  ) AS nights,
  COALESCE(
    NULLIF((payload->'reservation')->>'reserve_total','')::numeric,
    NULLIF((payload->'reservation')->>'sell_price_corrected','')::numeric,
    NULLIF(payload->>'totalPrice','')::numeric,
    NULLIF((payload->'price')->>'total','')::numeric,
    NULLIF(payload->>'amount','')::numeric
  ) AS total_amount,
  COALESCE((payload->'reservation')->>'currency', (payload->'property')->>'currency', payload->>'currency') AS currency,
  COALESCE((payload->'property')->>'external_id', (payload->'reservation')->>'property_external_id', payload->>'listingMapId', payload->>'propertyId', payload->>'listingId') AS property_external_id,
  COALESCE((payload->'property')->>'public_name', (payload->'property')->>'internal_name', (payload->'reservation')->>'property_internal_name') AS property_name,
  COALESCE((payload->'guest')->>'full_name', payload->>'guestName', (payload->'guest')->>'name') AS guest_name,
  COALESCE(NULLIF((payload->'reservation')->>'guest_count','')::int, NULLIF(payload->>'guestCount','')::int) AS guest_count,

  -- NEW additive columns
  NULLIF((payload->'reservation')->>'booking_created_at','')::timestamptz AS booked_at,
  NULLIF((payload->'reservation')->>'lead_time_days','')::int AS lead_time_days,
  NULLIF((payload->'reservation')->>'sell_price_corrected','')::numeric AS sell_price_corrected,
  NULLIF((payload->'reservation')->>'buy_price','')::numeric AS buy_price,
  NULLIF((payload->'reservation')->>'company_commission','')::numeric AS company_commission,
  NULLIF((payload->'reservation')->>'total_forward_fee','')::numeric AS total_forward_fee,
  NULLIF((payload->'reservation')->>'total_forward_fee_all','')::numeric AS total_forward_fee_all,
  -- Derived for dashboard use (see tooltip in UI)
  NULLIF((payload->'reservation')->>'sell_price_corrected','')::numeric AS net_amount,
  COALESCE(
    NULLIF((payload->'reservation')->>'total_forward_fee_all','')::numeric,
    NULLIF((payload->'reservation')->>'total_forward_fee','')::numeric,
    0
  ) AS fees_amount
FROM public.reservations_import ri;
