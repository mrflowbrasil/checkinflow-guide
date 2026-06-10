import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const tenantSlug = url.searchParams.get("tenant_slug");
    if (!tenantSlug) {
      return new Response(JSON.stringify({ error: "missing_tenant_slug" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: tenant, error: tErr } = await admin
      .from("tenants")
      .select("id, name, slug, logo_url, primary_color, instagram_url, facebook_url, catalog_bio, is_active")
      .eq("slug", tenantSlug)
      .maybeSingle();

    if (tErr || !tenant || !tenant.is_active) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: properties } = await admin
      .from("properties")
      .select("id, name, city, max_guests, base_price, cover_image_url, public_slug, booking_url, source")
      .eq("tenant_id", tenant.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    return new Response(
      JSON.stringify({
        tenant: {
          name: tenant.name,
          slug: tenant.slug,
          logo_url: tenant.logo_url,
          primary_color: tenant.primary_color,
          instagram_url: tenant.instagram_url,
          facebook_url: tenant.facebook_url,
          bio: tenant.catalog_bio,
        },
        properties: properties ?? [],
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60, s-maxage=120",
        },
      },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
