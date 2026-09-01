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

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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
      .select("id, tenant_id, revoked_at")
      .eq("key_hash", hash)
      .maybeSingle();
    if (!keyRow || keyRow.revoked_at) return json({ error: "invalid_api_key" }, 401);

    const body = await req.json().catch(() => ({}));
    const event = body?.event ?? "upload-dash";
    const status = body?.status;
    const provider = body?.provider;
    const importedCount = Number.isFinite(Number(body?.imported_count))
      ? Number(body.imported_count)
      : null;

    if (event !== "upload-dash" && event !== "dash-update") {
      return json({ error: "invalid_event", message: "event must be 'upload-dash' or 'dash-update'" }, 400);
    }
    if (status !== "completed" && status !== "error") {
      return json({ error: "invalid_status", message: "status must be 'completed' or 'error'" }, 400);
    }

    const isOk = status === "completed";

    // Reflect the outcome on the tenant integration used by the dashboard sync
    let update = admin
      .from("tenant_integrations")
      .update({
        status: isOk ? "connected" : "error",
        last_error: isOk ? null : (body?.error ?? "dash_import_failed"),
        ...(isOk ? { last_sync_at: new Date().toISOString() } : {}),
      })
      .eq("tenant_id", keyRow.tenant_id);

    if (provider === "stays" || provider === "hostaway") {
      update = update.eq("provider", provider);
    } else {
      update = update.in("provider", ["stays", "hostaway"]);
    }
    await update;

    await admin
      .from("tenant_api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", keyRow.id);

    const { count } = await admin
      .from("reservations_import")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", keyRow.tenant_id);

    console.log(
      `[inteligencia-mark-done] tenant=${keyRow.tenant_id} event=${event} status=${status} imported=${importedCount ?? "n/a"} total=${count ?? "n/a"}`,
    );

    return json({
      ok: true,
      event,
      status,
      imported_count: importedCount,
      total_reservations: count ?? null,
    });
  } catch (e: any) {
    console.error("inteligencia-mark-done error", e);
    return json({ error: e.message ?? "internal" }, 500);
  }
});
