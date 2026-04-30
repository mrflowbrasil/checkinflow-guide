import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || `imovel-${Math.random().toString(36).slice(2, 8)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = req.headers.get("X-API-Key") ?? req.headers.get("x-api-key");
    if (!apiKey) return json({ error: "missing_api_key" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const hash = await sha256(apiKey);

    const { data: keyRow } = await admin
      .from("tenant_api_keys")
      .select("tenant_id, id, revoked_at")
      .eq("key_hash", hash)
      .maybeSingle();

    if (!keyRow || keyRow.revoked_at) return json({ error: "invalid_api_key" }, 401);
    const tenantId = keyRow.tenant_id;

    // touch last_used
    admin.from("tenant_api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyRow.id).then();

    if (req.method !== "POST" && req.method !== "PUT") {
      return json({ error: "method_not_allowed" }, 405);
    }

    const body = await req.json();
    const {
      external_id,
      external_provider = "stays",
      name,
      description,
      status,
      address,
      latitude,
      longitude,
      booking_url,
      cover_image_url,
      images,
      details,
      raw,
    } = body ?? {};

    if (!name) return json({ error: "name_required" }, 400);
    if (!external_id && req.method === "PUT") {
      return json({ error: "external_id_required_for_put" }, 400);
    }

    // Find existing
    let existing: any = null;
    if (external_id) {
      const { data } = await admin
        .from("properties")
        .select("id, public_slug")
        .eq("tenant_id", tenantId)
        .eq("external_provider", external_provider)
        .eq("external_id", String(external_id))
        .maybeSingle();
      existing = data;
    }

    const slug = existing?.public_slug ?? `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;

    const propertyPayload: any = {
      tenant_id: tenantId,
      name,
      description: description ?? null,
      address: address ?? null,
      booking_url: booking_url ?? null,
      cover_image_url: cover_image_url ?? null,
      external_id: external_id ? String(external_id) : null,
      external_provider,
      external_data: raw ?? null,
      status: status === "active" || status === "inactive" ? status : "active",
      public_slug: slug,
    };

    let propertyId: string;
    let created = false;

    if (existing) {
      const { error } = await admin.from("properties").update(propertyPayload).eq("id", existing.id);
      if (error) throw error;
      propertyId = existing.id;
    } else {
      const { data, error } = await admin.from("properties").insert(propertyPayload).select("id").single();
      if (error) throw error;
      propertyId = data.id;
      created = true;
    }

    // Upsert details
    if (details && typeof details === "object") {
      const detailsPayload: any = {
        property_id: propertyId,
        checkin_time: details.checkin_time ?? null,
        checkin_instructions: details.checkin_instructions ?? null,
        checkout_time: details.checkout_time ?? null,
        checkout_instructions: details.checkout_instructions ?? null,
        lock_code: details.lock_code ?? null,
        wifi_ssid: details.wifi_ssid ?? null,
        wifi_password: details.wifi_password ?? null,
        latitude: details.latitude ?? null,
        longitude: details.longitude ?? null,
        rules: details.rules ?? null,
        parking: details.parking ?? null,
        trash: details.trash ?? null,
        emergency_contacts: details.emergency_contacts ?? [],
        extras: details.extras ?? {},
      };
      await admin.from("property_details").upsert(detailsPayload, { onConflict: "property_id" });
    }

    // Replace images
    if (Array.isArray(images)) {
      await admin.from("property_images").delete().eq("property_id", propertyId);
      if (images.length) {
        const rows = images.map((url: string, i: number) => ({
          property_id: propertyId,
          url,
          position: i,
        }));
        await admin.from("property_images").insert(rows);
      }
    }

    return json({ id: propertyId, public_slug: slug, created, updated: !created });
  } catch (e: any) {
    console.error("properties-api error", e);
    return json({ error: e.message ?? "internal" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
