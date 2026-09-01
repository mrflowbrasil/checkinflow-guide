import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";
import { getLatestRecoverableTenantApiKey, unrecoverableApiKeyPayload } from "../_shared/tenant-api-keys.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

const INTELIGENCIA_WEBHOOK = "https://n8n.mrflow.com.br/webhook/inteligencia-welcomehub";

type SyncEvent = "upload-dash" | "dash-update";

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

// Splits the last `years` years into 1-year chunks, most recent first.
// Ex. years=3, today=2026-09-01 → [{2026-09-01/2025-09-01}, {2025-09-01/2024-09-01}, {2024-09-01/2023-09-01}]
function buildYearlyPeriods(years: number) {
  const periods: { start: string; end: string }[] = [];
  const end = new Date();
  for (let i = 0; i < years; i++) {
    const chunkEnd = new Date(end);
    chunkEnd.setFullYear(chunkEnd.getFullYear() - i);
    const chunkStart = new Date(end);
    chunkStart.setFullYear(chunkStart.getFullYear() - (i + 1));
    periods.push({ start: isoDay(chunkStart), end: isoDay(chunkEnd) });
  }
  return periods;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "missing_auth" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: profile } = await admin
      .from("profiles")
      .select("tenant_id")
      .eq("id", userData.user.id)
      .maybeSingle();
    if (!profile?.tenant_id) return json({ error: "no_tenant" }, 400);
    const tenantId = profile.tenant_id;

    const body = await req.json().catch(() => ({}));
    const event = body?.event as SyncEvent;
    if (event !== "upload-dash" && event !== "dash-update") {
      return json({ error: "invalid_event" }, 400);
    }
    const years = [1, 3, 5].includes(Number(body?.years)) ? Number(body.years) : 1;

    // Load connected integration (explicit provider or first connected of stays/hostaway)
    let query = admin
      .from("tenant_integrations")
      .select("provider, system_url, public_site_url, credentials_encrypted, status")
      .eq("tenant_id", tenantId)
      .in("provider", ["stays", "hostaway"])
      .eq("status", "connected");
    if (body?.provider === "stays" || body?.provider === "hostaway") {
      query = query.eq("provider", body.provider);
    }
    const { data: integrations } = await query.limit(1);
    const integration = integrations?.[0];

    if (!integration) {
      return json({ ok: false, error: "not_connected", message: "Integração não configurada." }, 400);
    }
    if (!integration.credentials_encrypted) {
      return json({ ok: false, error: "no_credentials" }, 400);
    }

    // Reuse the latest active recoverable API key (never rotate implicitly)
    const keyResult = await getLatestRecoverableTenantApiKey(admin, tenantId);
    if (!keyResult.apiKey) return json(unrecoverableApiKeyPayload(keyResult), 409);

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const payload: Record<string, unknown> = {
      event,
      action: "import",
      tenant_id: tenantId,
      provider: integration.provider,
      system_url: integration.system_url,
      public_site_url: integration.public_site_url ?? null,
      authorization: `Basic ${integration.credentials_encrypted}`,
      callback: {
        base_url: `${SUPABASE_URL}/functions/v1`,
        api_key: keyResult.apiKey,
        api_key_status: keyResult.apiKeyStatus,
        key_prefix: keyResult.keyPrefix,
        endpoints: {
          connection_done: "/integrations-mark-synced",
          import_done: "/integrations-mark-import-done",
          dash_import_done: "/inteligencia-mark-done",
        },
      },
    };

    if (event === "upload-dash") {
      payload.periods = buildYearlyPeriods(years);
      payload.years = years;
    } else {
      payload.start_date = isoDay(thirtyDaysAgo);
      payload.end_date = isoDay(today);
    }

    const hookRes = await fetch(INTELIGENCIA_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: payload }),
    });

    if (!hookRes.ok) {
      const text = await hookRes.text();
      console.error("inteligencia-sync webhook failed", hookRes.status, text.slice(0, 200));
      return json({ ok: false, error: "webhook_failed", status: hookRes.status }, 502);
    }

    return json({ ok: true, event, periods: payload.periods ?? null });
  } catch (e: any) {
    console.error("inteligencia-sync error", e);
    return json({ error: e.message ?? "internal" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
