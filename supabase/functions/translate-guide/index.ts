import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const SUPPORTED_LOCALES = ["en", "es"] as const;
type Locale = typeof SUPPORTED_LOCALES[number];

const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Spanish",
};

// Strings da própria UI da página pública (fixas)
const STATIC_UI_STRINGS = [
  "Hub de Boas Vindas",
  "Reservar Novamente",
  "Instalar App",
  "Sem conteúdo ainda.",
  "Senha",
  "Copiado!",
  "Senha copiada!",
  "Não foi possível copiar",
];

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function collectStrings(property: any): string[] {
  const set = new Set<string>();
  for (const s of STATIC_UI_STRINGS) set.add(s);

  if (property.address) set.add(property.address);

  for (const page of property.property_pages ?? []) {
    if (page.title) set.add(page.title);
    for (const block of page.content_blocks ?? []) {
      const d = block.data ?? {};
      switch (block.type) {
        case "text":
        case "subtitle":
        case "tip":
          if (d.content) set.add(d.content);
          break;
        case "image":
          if (d.caption) set.add(d.caption);
          break;
        case "steps":
          for (const it of d.items ?? []) {
            if (it?.title) set.add(it.title);
            if (it?.detail) set.add(it.detail);
          }
          break;
        case "list":
          for (const it of d.items ?? []) {
            if (it?.text) set.add(it.text);
          }
          break;
        case "button":
          if (d.label) set.add(d.label);
          break;
        case "password":
          if (d.label) set.add(d.label);
          break;
      }
    }
  }
  return [...set].filter((s) => typeof s === "string" && s.trim().length > 0);
}

async function translateBatch(
  strings: string[],
  locale: Locale,
): Promise<Record<string, string>> {
  if (strings.length === 0) return {};

  const targetLang = LOCALE_NAMES[locale];
  const prompt = `Translate the following JSON object's VALUES from Brazilian Portuguese to ${targetLang}. Rules:
- Return a JSON object with the EXACT same keys.
- Translate only the values; keep keys identical.
- Preserve URLs, numbers, emoji, line breaks, and any markdown-like formatting (**bold**, *italic*, __underline__).
- Use natural, friendly language appropriate for a vacation rental guest guide.
- Do NOT add explanations.

Input:
${JSON.stringify(Object.fromEntries(strings.map((s) => [s, s])), null, 2)}`;

  const resp = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content:
              "You are a professional translator for short-stay rental guest guides. Output only valid JSON.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    },
  );

  if (!resp.ok) {
    const text = await resp.text();
    if (resp.status === 429) {
      throw new Error("rate_limited");
    }
    if (resp.status === 402) {
      throw new Error("payment_required");
    }
    throw new Error(`AI gateway ${resp.status}: ${text}`);
  }

  const json = await resp.json();
  const content = json?.choices?.[0]?.message?.content ?? "{}";
  let parsed: Record<string, string>;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("invalid_json_from_model");
  }

  // Garantir todas as chaves presentes (fallback ao original)
  const result: Record<string, string> = {};
  for (const s of strings) {
    const v = parsed[s];
    result[s] = typeof v === "string" && v.length > 0 ? v : s;
  }
  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";
    const locale = body.locale as Locale;

    if (!slug || !SUPPORTED_LOCALES.includes(locale)) {
      return new Response(
        JSON.stringify({ error: "invalid_input" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Carregar property + pages + blocks
    const { data: property, error: propErr } = await supabase
      .from("properties")
      .select(`
        id, address, status,
        property_pages(id, title, is_enabled,
          content_blocks(id, type, data, position)
        )
      `)
      .eq("public_slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (propErr) throw propErr;
    if (!property) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const strings = collectStrings(property);
    const hash = await sha256(JSON.stringify(strings) + ":" + locale);

    // Buscar cache
    const { data: cached } = await supabase
      .from("guide_translations")
      .select("content_hash, payload")
      .eq("property_id", property.id)
      .eq("locale", locale)
      .maybeSingle();

    if (cached && cached.content_hash === hash) {
      return new Response(
        JSON.stringify({ translations: cached.payload, cached: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Traduzir
    const translations = await translateBatch(strings, locale);

    // Upsert no cache
    const { error: upsertErr } = await supabase
      .from("guide_translations")
      .upsert(
        {
          property_id: property.id,
          locale,
          content_hash: hash,
          payload: translations,
        },
        { onConflict: "property_id,locale" },
      );

    if (upsertErr) {
      console.error("upsert cache error", upsertErr);
    }

    return new Response(
      JSON.stringify({ translations, cached: false }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e: any) {
    console.error("translate-guide error:", e);
    const msg = e?.message ?? "unknown_error";
    const status = msg === "rate_limited"
      ? 429
      : msg === "payment_required"
      ? 402
      : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
