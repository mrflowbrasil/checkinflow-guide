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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const apiKey = req.headers.get("X-API-Key") ?? req.headers.get("x-api-key");
    if (!apiKey) return json({ error: "missing_api_key" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const hash = await sha256(apiKey);

    const { data: keyRow } = await admin
      .from("tenant_api_keys")
      .select("tenant_id, revoked_at")
      .eq("key_hash", hash)
      .maybeSingle();
    if (!keyRow || keyRow.revoked_at) return json({ error: "invalid_api_key" }, 401);

    const { provider, status, error } = await req.json();
    if (provider !== "stays" && provider !== "hostaway") {
      return json({ error: "invalid_provider" }, 400);
    }
    const safeStatus = ["connected", "error", "pending"].includes(status) ? status : "connected";

    await admin
      .from("tenant_integrations")
      .update({
        status: safeStatus,
        last_sync_at: new Date().toISOString(),
        last_error: error ?? null,
      })
      .eq("tenant_id", keyRow.tenant_id)
      .eq("provider", provider);

    return json({ ok: true });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
