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

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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

    // Find an active integration (stays or hostaway)
    const { data: integration } = await admin
      .from("tenant_integrations")
      .select("provider, system_url, credentials_encrypted, status")
      .eq("tenant_id", tenantId)
      .in("provider", ["stays", "hostaway"])
      .eq("status", "connected")
      .order("provider", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!integration) {
      return json({
        ok: false,
        error: "not_connected",
        message: "Conecte sua Stays ou Hostaway na página de Integrações antes de importar.",
      }, 400);
    }
    if (!integration.credentials_encrypted) {
      return json({ ok: false, error: "no_credentials" }, 400);
    }

    const provider = integration.provider;

    // Webhook for that provider
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

    // Rotate "Importação Catálogo" API key so n8n receives a usable plaintext key
    await admin
      .from("tenant_api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("tenant_id", tenantId)
      .is("revoked_at", null)
      .eq("name", "Importação Catálogo");

    const plainKey = genApiKey();
    const hash = await sha256(plainKey);
    await admin.from("tenant_api_keys").insert({
      tenant_id: tenantId,
      name: "Importação Catálogo",
      key_hash: hash,
      key_prefix: plainKey.slice(0, 16),
    });

    const webhookPayload = {
      event: "upload-listings-catalog",
      tenant_id: tenantId,
      provider,
      system_url: integration.system_url,
      authorization: `Basic ${integration.credentials_encrypted}`,
      callback: {
        base_url: `${SUPABASE_URL}/functions/v1`,
        api_key: plainKey,
        endpoints: {
          upsert_property: "/properties-api",
        },
      },
    };

    const hookRes = await fetch(hook.webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload),
    });

    if (!hookRes.ok) {
      const text = await hookRes.text();
      console.error("catalog-trigger-import webhook failed", hookRes.status, text);
      return json({ ok: false, error: "webhook_failed", status: hookRes.status }, 502);
    }

    return json({ ok: true, provider });
  } catch (e: any) {
    console.error("catalog-trigger-import error", e);
    return json({ error: e?.message ?? "internal" }, 500);
  }
});
