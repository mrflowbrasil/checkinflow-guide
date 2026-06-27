import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const INGEST_SECRET = Deno.env.get("MRFLOW_RESERVATION_INGEST_SECRET") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-mrflow-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const provided = req.headers.get("x-mrflow-secret") ?? "";
  if (!INGEST_SECRET || !provided || !constantTimeEqual(provided, INGEST_SECRET)) {
    return json({ error: "unauthorized" }, 401);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const { tenant_id, provider, external_id, payload, synced_at } = body ?? {};

  if (typeof tenant_id !== "string" || !UUID_RE.test(tenant_id)) {
    return json({ error: "invalid_tenant_id" }, 400);
  }
  if (typeof provider !== "string" || provider.trim() === "") {
    return json({ error: "invalid_provider" }, 400);
  }
  if (typeof external_id !== "string" || external_id.trim() === "") {
    return json({ error: "invalid_external_id" }, 400);
  }
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    return json({ error: "invalid_payload" }, 400);
  }

  let syncedAtIso: string;
  if (synced_at === undefined || synced_at === null) {
    syncedAtIso = new Date().toISOString();
  } else if (typeof synced_at === "string") {
    const d = new Date(synced_at);
    if (Number.isNaN(d.getTime())) return json({ error: "invalid_synced_at" }, 400);
    syncedAtIso = d.toISOString();
  } else {
    return json({ error: "invalid_synced_at" }, 400);
  }

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: tenantRow, error: tenantErr } = await admin
      .from("tenants")
      .select("id")
      .eq("id", tenant_id)
      .maybeSingle();

    if (tenantErr) {
      console.error("[ingest-reservations] tenant lookup error", tenantErr);
      return json({ error: "internal_error" }, 500);
    }
    if (!tenantRow) return json({ error: "tenant_not_found" }, 404);

    const { error: upsertErr } = await admin
      .from("reservations_import")
      .upsert(
        {
          tenant_id,
          provider: provider.trim(),
          external_id: external_id.trim(),
          payload,
          synced_at: syncedAtIso,
        },
        { onConflict: "tenant_id,provider,external_id" },
      );

    if (upsertErr) {
      console.error("[ingest-reservations] upsert error", upsertErr);
      return json({ error: "internal_error" }, 500);
    }

    return json({
      success: true,
      external_id: external_id.trim(),
      action: "upserted",
    });
  } catch (e) {
    console.error("[ingest-reservations] unhandled", e);
    return json({ error: "internal_error" }, 500);
  }
});
