import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "missing_auth" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) return json({ error: "unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: profile } = await admin
      .from("profiles")
      .select("tenant_id")
      .eq("id", userData.user.id)
      .maybeSingle();
    if (!profile?.tenant_id) return json({ error: "no_tenant" }, 400);

    const { provider } = await req.json();
    if (provider !== "stays" && provider !== "hostaway") {
      return json({ error: "invalid_provider" }, 400);
    }

    const { error: delErr, count } = await admin
      .from("tenant_integrations")
      .delete({ count: "exact" })
      .eq("tenant_id", profile.tenant_id)
      .eq("provider", provider);

    if (delErr) {
      console.error("disconnect delete error", delErr);
      return json({ error: delErr.message }, 500);
    }
    console.log("disconnect deleted rows:", count, "tenant:", profile.tenant_id, "provider:", provider);

    return json({ ok: true, deleted: count ?? 0 });
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
