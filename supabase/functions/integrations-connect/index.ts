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
    if (!authHeader) {
      return json({ error: "missing_auth" }, 401);
    }

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

    const { data: tenantRow } = await admin
      .from("tenants")
      .select("plan_code")
      .eq("id", tenantId)
      .maybeSingle();
    if (tenantRow?.plan_code !== "business") {
      return json({ error: "feature_not_available_in_plan", message: "Integrações com Stays/Hostaway estão disponíveis apenas no plano Business." }, 403);
    }

    const body = await req.json();
    const { provider, system_url, login, password } = body ?? {};

    if (provider !== "stays" && provider !== "hostaway") {
      return json({ error: "invalid_provider" }, 400);
    }
    if (!system_url || !login || !password) {
      return json({ error: "missing_fields" }, 400);
    }

    const credentials = btoa(`${login}:${password}`);

    // Upsert integration row
    const { error: upErr } = await admin
      .from("tenant_integrations")
      .upsert(
        {
          tenant_id: tenantId,
          provider,
          system_url,
          credentials_encrypted: credentials,
          status: "pending",
          last_error: null,
        },
        { onConflict: "tenant_id,provider" },
      );
    if (upErr) throw upErr;

    // Ensure tenant has an api key (return new key if just created)
    let plainKey: string | null = null;
    const { data: existingKey } = await admin
      .from("tenant_api_keys")
      .select("id")
      .eq("tenant_id", tenantId)
      .is("revoked_at", null)
      .limit(1)
      .maybeSingle();

    if (!existingKey) {
      plainKey = genApiKey();
      const hash = await sha256(plainKey);
      const { error: keyErr } = await admin.from("tenant_api_keys").insert({
        tenant_id: tenantId,
        name: "Integração",
        key_hash: hash,
        key_prefix: plainKey.slice(0, 16),
      });
      if (keyErr) throw keyErr;
    }

    // Fetch webhook url
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

    // Need an api key in plain to send to n8n. If we didn't just create one,
    // we can't recover the existing one (only hash stored). Generate a new one
    // alongside (don't revoke old until n8n confirms? — for v1 just rotate).
    if (!plainKey) {
      plainKey = genApiKey();
      const hash = await sha256(plainKey);
      // revoke old keys
      await admin
        .from("tenant_api_keys")
        .update({ revoked_at: new Date().toISOString() })
        .eq("tenant_id", tenantId)
        .is("revoked_at", null);
      await admin.from("tenant_api_keys").insert({
        tenant_id: tenantId,
        name: "Integração",
        key_hash: hash,
        key_prefix: plainKey.slice(0, 16),
      });
    }

    // Fire webhook
    const webhookPayload = {
      event: "connection",
      tenant_id: tenantId,
      provider,
      system_url,
      authorization: `Basic ${credentials}`,
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
        .update({ status: "error", last_error: `webhook_failed: ${hookRes.status} ${text.slice(0, 200)}` })
        .eq("tenant_id", tenantId)
        .eq("provider", provider);
      return json({ ok: false, error: "webhook_failed", status: hookRes.status }, 502);
    }

    return json({ ok: true, api_key: plainKey });
  } catch (e: any) {
    console.error("integrations-connect error", e);
    return json({ error: e.message ?? "internal" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
