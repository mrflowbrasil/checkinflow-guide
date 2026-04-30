import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

function genApiKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const b64 = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `mrf_live_${b64}`;
}

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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

    const { provider } = await req.json();
    if (provider !== "stays" && provider !== "hostaway") {
      return json({ error: "invalid_provider" }, 400);
    }

    // Load integration
    const { data: integration } = await admin
      .from("tenant_integrations")
      .select("system_url, credentials_encrypted, status")
      .eq("tenant_id", tenantId)
      .eq("provider", provider)
      .maybeSingle();

    if (!integration) {
      return json({ ok: false, error: "not_connected", message: "Integração não configurada." }, 400);
    }
    if (integration.status !== "connected") {
      return json({
        ok: false,
        error: "not_ready",
        message: "Aguarde a conexão ser concluída antes de importar.",
      }, 400);
    }
    if (!integration.credentials_encrypted) {
      return json({ ok: false, error: "no_credentials" }, 400);
    }

    // Load webhook
    const { data: hook } = await admin
      .from("integration_webhooks")
      .select("webhook_url, is_active")
      .eq("provider", provider)
      .maybeSingle();
    if (!hook?.webhook_url || !hook.is_active) {
      return json({
        ok: false,
        error: "webhook_not_configured",
        message: "Webhook do provedor não está configurado. Contate o suporte.",
      }, 503);
    }

    // Rotate API key (we only stored hash, can't recover plain)
    const plainKey = genApiKey();
    const hash = await sha256(plainKey);
    await admin
      .from("tenant_api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("tenant_id", tenantId)
      .is("revoked_at", null);
    await admin.from("tenant_api_keys").insert({
      tenant_id: tenantId,
      name: "Importação",
      key_hash: hash,
      key_prefix: plainKey.slice(0, 16),
    });

    // Mark as syncing
    await admin
      .from("tenant_integrations")
      .update({ status: "syncing", last_error: null })
      .eq("tenant_id", tenantId)
      .eq("provider", provider);

    // Fire webhook (fire-and-forget; n8n will POST to properties-api per unit
    // and then call integrations-mark-synced when done)
    const webhookPayload = {
      event: "upload_listings",
      action: "import",
      tenant_id: tenantId,
      provider,
      system_url: integration.system_url,
      authorization: `Basic ${integration.credentials_encrypted}`,
      callback: {
        base_url: `${SUPABASE_URL}/functions/v1`,
        api_key: plainKey,
      },
    };

    const hookRes = await fetch(hook.webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload),
    });

    if (!hookRes.ok) {
      const text = await hookRes.text();
      await admin
        .from("tenant_integrations")
        .update({
          status: "error",
          last_error: `webhook_failed: ${hookRes.status} ${text.slice(0, 200)}`,
        })
        .eq("tenant_id", tenantId)
        .eq("provider", provider);
      return json({ ok: false, error: "webhook_failed", status: hookRes.status }, 502);
    }

    return json({ ok: true });
  } catch (e: any) {
    console.error("integrations-trigger-import error", e);
    return json({ error: e.message ?? "internal" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
