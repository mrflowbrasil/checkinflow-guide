import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BodySchema = z.object({
  tenant_slug: z.string().min(1),
  checkin: z.string().optional().nullable(),
  checkout: z.string().optional().nullable(),
  guests: z.number().int().min(1).max(20).optional().nullable(),
  max_price: z.number().nonnegative().optional().nullable(),
  integration_url: z.string().optional().nullable(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const body = parsed.data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: tenant } = await admin
      .from("tenants")
      .select("id, name, slug, is_active")
      .eq("slug", body.tenant_slug)
      .maybeSingle();

    if (!tenant || !tenant.is_active) {
      return new Response(JSON.stringify({ error: "tenant_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build local candidates
    let q = admin
      .from("properties")
      .select("id, name, city, max_guests, base_price, cover_image_url, public_slug, booking_url, external_id, source")
      .eq("tenant_id", tenant.id)
      .eq("status", "active");

    if (body.guests) q = q.gte("max_guests", body.guests);
    if (body.max_price) q = q.lte("base_price", body.max_price);

    const { data: candidates } = await q;

    // Check active integration
    const { data: activeIntegration } = await admin
      .from("tenant_integrations")
      .select("provider, system_url")
      .eq("tenant_id", tenant.id)
      .in("provider", ["stays", "hostaway"])
      .eq("status", "connected")
      .order("provider", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!activeIntegration) {
      // No active integration → return locally filtered results, no webhook
      return new Response(
        JSON.stringify({ properties: candidates ?? [], mocked: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Lookup webhook
    const { data: hook } = await admin
      .from("integration_webhooks")
      .select("webhook_url, is_active")
      .eq("provider", "catalog_search")
      .maybeSingle();

    if (!hook?.is_active || !hook.webhook_url) {
      return new Response(
        JSON.stringify({
          properties: candidates ?? [],
          mocked: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    try {
      const res = await fetch(hook.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tenant.id,
          tenant_slug: tenant.slug,
          checkin: body.checkin,
          checkout: body.checkout,
          guests: body.guests,
          max_price: body.max_price,
          integration_provider: activeIntegration.provider,
          integration_url: body.integration_url ?? activeIntegration.system_url,
          properties: (candidates ?? []).map((p) => ({
            id: p.id,
            external_id: p.external_id,
            source: p.source,
          })),
        }),
      });
      if (!res.ok) {
        console.error("catalog_search webhook non-2xx", res.status);
        return new Response(
          JSON.stringify({ properties: candidates ?? [], mocked: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const remote = await res.json();
      const map = new Map<string, { booking_url?: string; available?: boolean }>();
      for (const item of remote?.properties ?? []) {
        if (item?.id) map.set(item.id, { booking_url: item.booking_url, available: item.available });
      }
      const merged = (candidates ?? [])
        .map((p) => {
          const m = map.get(p.id);
          return {
            ...p,
            booking_url: m?.booking_url || p.booking_url,
            available: m?.available ?? true,
          };
        })
        .filter((p) => p.available !== false);
      return new Response(JSON.stringify({ properties: merged, mocked: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error("catalog_search webhook error", e);
      return new Response(
        JSON.stringify({ properties: candidates ?? [], mocked: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
