import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BodySchema = z.object({
  state: z.string().trim().length(2),
  whatsapp: z.string().trim().min(8).max(30),
  properties_count: z.enum(["1", "2-5", "6-10", "11-20", "21-50", "50+"]),
  pms: z.enum(["Stays", "Hostaway", "Hospedin", "Omnibees", "Cloudbeds", "Hsystem", "Outros", "Nenhum"]),
  pms_other: z.string().trim().max(80).optional().nullable(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userData.user;

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const body = parsed.data;
    if (body.pms === "Outros" && !body.pms_other) {
      return new Response(JSON.stringify({ error: "pms_other required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: profile } = await admin
      .from("profiles")
      .select("tenant_id, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.tenant_id) {
      return new Response(JSON.stringify({ error: "tenant_not_found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date().toISOString();
    const { error: upsertErr } = await admin.from("onboarding_profiles").upsert({
      user_id: user.id,
      tenant_id: profile.tenant_id,
      state: body.state.toUpperCase(),
      whatsapp: body.whatsapp,
      properties_count: body.properties_count,
      pms: body.pms,
      pms_other: body.pms === "Outros" ? body.pms_other : null,
      completed_at: now,
      updated_at: now,
    });

    if (upsertErr) {
      return new Response(JSON.stringify({ error: upsertErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fire webhook (best-effort, do not fail the request)
    try {
      const { data: hook } = await admin
        .from("integration_webhooks")
        .select("webhook_url, is_active")
        .eq("provider", "onboarding")
        .maybeSingle();

      if (hook?.is_active && hook.webhook_url) {
        const payload = {
          tipo: "onboarding",
          user_id: user.id,
          tenant_id: profile.tenant_id,
          email: user.email,
          full_name: profile.full_name,
          state: body.state.toUpperCase(),
          whatsapp: body.whatsapp,
          properties_count: body.properties_count,
          pms: body.pms,
          pms_other: body.pms === "Outros" ? body.pms_other : null,
          completed_at: now,
        };
        // Don't await long — just fire
        fetch(hook.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch((e) => console.error("webhook error", e));
      }
    } catch (e) {
      console.error("webhook lookup error", e);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
