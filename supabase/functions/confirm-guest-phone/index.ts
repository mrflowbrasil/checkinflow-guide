import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { forwardGuestPhone, validateGuestPhone } from "../_shared/guest-phone.ts";

const schema = z.object({
  slug: z.string().regex(/^[a-zA-Z0-9_-]{1,150}$/),
  id_reserva: z.string().min(1).max(100),
  telefone: z.string().min(1).max(40),
}).strict();
// Bound per-instance throttling; never store phone numbers or reservation IDs.
const attempts = new Map<string, { count: number; until: number }>();
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);
  try {
    const text = await req.text();
    if (text.length > 2048) return json({ error: "Dados inválidos." }, 400);
    const parsed = schema.safeParse(JSON.parse(text));
    if (!parsed.success) return json({ error: "Verifique o ID da reserva e o celular." }, 400);
    let payload;
    try { payload = validateGuestPhone(parsed.data); }
    catch (error) { return json({ error: error instanceof Error ? error.message : "Dados inválidos." }, 400); }
    const now = Date.now();
    for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const entry = attempts.get(ip);
    if (entry && entry.count >= 5) return json({ error: "Aguarde um minuto antes de tentar novamente." }, 429);
    if (!entry && attempts.size >= 10_000) return json({ error: "Tente novamente em instantes." }, 429);
    attempts.set(ip, { count: (entry?.count ?? 0) + 1, until: entry?.until ?? now + 60_000 });
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_ANON_KEY");
    if (!url || !key) return json({ error: "Serviço indisponível. Tente novamente." }, 503);
    const client = createClient(url, key);
    const { data, error } = await client.from("properties")
      .select("id, tenants(is_active)").eq("public_slug", parsed.data.slug)
      .eq("status", "active").maybeSingle();
    const tenant = Array.isArray(data?.tenants) ? data.tenants[0] : data?.tenants;
    if (error) return json({ error: "Não foi possível verificar a hospedagem." }, 503);
    if (!data || !tenant?.is_active) return json({ error: "Hospedagem não encontrada." }, 404);
    return json(await forwardGuestPhone(payload));
  } catch {
    return json({ error: "Não foi possível enviar agora. Tente novamente." }, 502);
  }
});