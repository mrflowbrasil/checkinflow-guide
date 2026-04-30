// Public edge function: returns a dynamic Web App Manifest for a given property slug.
// Usage: GET /functions/v1/property-manifest?slug=<public_slug>
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const FALLBACK_ICON_192 = "/icon-192.png";
const FALLBACK_ICON_512 = "/icon-512.png";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug")?.trim();
    const origin = url.searchParams.get("origin")?.trim() || "https://hub.mrflow.com.br";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let name = "Mr Flow • Welcome Hub";
    let shortName = "Mr Flow";
    let description =
      "Hub de Boas Vindas Inteligente da Mr Flow. Encante seu hóspede desde o primeiro momento com um guia digital completo da sua hospedagem.";
    let themeColor = "#1e3a8a";
    let startUrl = "/";
    let scope = "/";
    let iconUrl: string | null = null;

    if (slug) {
      const { data } = await supabase
        .from("properties")
        .select(`
          name, public_slug, status, cover_image_url,
          tenants!inner ( name, primary_color, logo_url, is_active )
        `)
        .eq("public_slug", slug)
        .eq("status", "active")
        .maybeSingle();

      if (data && (data as any).tenants?.is_active) {
        const tenant = (data as any).tenants;
        name = `${data.name} — ${tenant.name}`;
        shortName = (data.name as string).slice(0, 24) || tenant.name;
        description = `Guia digital do hóspede para ${data.name}.`;
        themeColor = tenant.primary_color || themeColor;
        startUrl = `/g/${data.public_slug}`;
        scope = `/g/${data.public_slug}`;
        iconUrl = tenant.logo_url || data.cover_image_url || null;
      }
    }

    const icons = iconUrl
      ? [
          { src: iconUrl, sizes: "192x192", type: "image/png", purpose: "any" },
          { src: iconUrl, sizes: "512x512", type: "image/png", purpose: "any" },
          { src: `${origin}${FALLBACK_ICON_192}`, sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: `${origin}${FALLBACK_ICON_512}`, sizes: "512x512", type: "image/png", purpose: "maskable" },
        ]
      : [
          { src: `${origin}${FALLBACK_ICON_192}`, sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: `${origin}${FALLBACK_ICON_512}`, sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ];

    const manifest = {
      name,
      short_name: shortName,
      description,
      start_url: startUrl,
      scope,
      display: "standalone",
      orientation: "portrait",
      background_color: "#ffffff",
      theme_color: themeColor,
      lang: "pt-BR",
      icons,
    };

    return new Response(JSON.stringify(manifest), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/manifest+json; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
