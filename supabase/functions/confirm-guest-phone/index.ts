import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { forwardGuestPhone, validateGuestPhone } from "../_shared/guest-phone.ts";
import { resolveGuestPhoneWorkspace } from "../_shared/guest-phone-workspace.ts";

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
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key || !serviceKey) return json({ error: "Serviço indisponível. Tente novamente." }, 503);
    const client = createClient(url, key);
    const tenant = await resolveGuestPhoneWorkspace(parsed.data.slug, async (field, value) => {
      const { data, error } = await client.from("tenants").select("id, name, is_active")
        .eq(field, value).eq("is_active", true).maybeSingle();
      if (error) throw error;
      return data;
    }, async previous => {
      const { data, error } = await client.from("tenant_slug_history").select("tenant_id").eq("slug", previous).maybeSingle();
      if (error) throw error;
      return data?.tenant_id ?? null;
    });
    if (!tenant) return json({ error: "Hospedagem não encontrada." }, 404);
    // Privileged access is limited to Stays credentials for the resolved active workspace.
    // Neither credentials nor upstream response bodies are returned to the guest.
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: integration, error: integrationError } = await admin
      .from("tenant_integrations")
      .select("system_url, public_site_url, credentials_encrypted")
      .eq("tenant_id", tenant.id).eq("provider", "stays").maybeSingle();
    if (integrationError) throw integrationError;
    return json(await forwardGuestPhone(payload, {
      tenant_id: tenant.id,
      tenant_name: tenant.name,
      integration,
    }));
  } catch {
    return json({ error: "Não foi possível enviar agora. Tente novamente." }, 502);
  }
});