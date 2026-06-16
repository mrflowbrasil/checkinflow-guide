import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";
import { createTenantApiKey } from "../_shared/tenant-api-keys.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "missing_auth" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData.user) return json({ error: "unauthorized" }, 401);
    const userId = userData.user.id;
    const { data: profile } = await admin
      .from("profiles")
      .select("tenant_id")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.tenant_id) return json({ error: "no_tenant" }, 400);
    const tenantId = profile.tenant_id;

    // Authorization: tenant_owner of this tenant OR super_admin
    const { data: roles } = await admin
      .from("user_roles")
      .select("role, tenant_id")
      .eq("user_id", userId);
    const allowed = (roles ?? []).some(
      (r: any) =>
        r.role === "super_admin" ||
        (r.role === "tenant_owner" && r.tenant_id === tenantId),
    );
    if (!allowed) return json({ error: "forbidden" }, 403);

    if (req.method === "GET") {
      const { data, error } = await admin
        .from("tenant_api_keys")
        .select("id, name, key_prefix, created_at, last_used_at")
        .eq("tenant_id", tenantId)
        .is("revoked_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return json({ items: data ?? [] });
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const name = (body?.name ?? "").toString().trim().slice(0, 60) || "API Key";
      const created = await createTenantApiKey(admin, tenantId, name);
      return json({ id: created.keyId, name: created.keyName, key_prefix: created.keyPrefix, api_key: created.apiKey });
    }

    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");
      if (!id) return json({ error: "missing_id" }, 400);
      const { error } = await admin
        .from("tenant_api_keys")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .is("revoked_at", null);
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: "method_not_allowed" }, 405);
  } catch (e: any) {
    console.error("tenant-api-keys error", e);
    return json({ error: e.message ?? "internal" }, 500);
  }
});
