import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || `imovel-${Math.random().toString(36).slice(2, 8)}`;
}

function txt(s: any): string | null {
  if (s === null || s === undefined) return null;
  const v = String(s).trim();
  return v.length ? v : null;
}

type BlockSeed = { type: string; data: any };

// Mirror of seed_property_pages() — keep in sync with the DB function.
const PAGES_CATALOG = [
  { page_key: "checkin",         title: "Check-in",          icon: "Clock",            default_position: 1 },
  { page_key: "lock_code",       title: "Senha Fechadura",   icon: "KeyRound",         default_position: 2 },
  { page_key: "checkout",        title: "Check-out",         icon: "LogOut",           default_position: 3 },
  { page_key: "wifi",            title: "Wi-Fi",             icon: "Wifi",             default_position: 4 },
  { page_key: "location",        title: "Localização",       icon: "MapPin",           default_position: 5 },
  { page_key: "rules",           title: "Regras",            icon: "BookOpen",         default_position: 6 },
  { page_key: "equipment",       title: "Equipamentos",      icon: "Wrench",           default_position: 7 },
  { page_key: "furniture",       title: "Mobília",           icon: "Sofa",             default_position: 8 },
  { page_key: "condo",           title: "Condomínio",        icon: "Building2",        default_position: 9 },
  { page_key: "parking",         title: "Estacionamento",    icon: "Car",              default_position: 10 },
  { page_key: "trash",           title: "Lixo",              icon: "Trash2",           default_position: 11 },
  { page_key: "economy",         title: "Economia",          icon: "Zap",              default_position: 12 },
  { page_key: "before_leaving",  title: "Antes de Sair",     icon: "DoorOpen",         default_position: 13 },
  { page_key: "tips",            title: "Dicas",             icon: "Lightbulb",        default_position: 14 },
  { page_key: "contacts",        title: "Contatos",          icon: "Phone",            default_position: 15 },
  { page_key: "emergency",       title: "Emergência",        icon: "Siren",            default_position: 16 },
  { page_key: "how_to_arrive",   title: "Como Chegar",       icon: "Navigation",       default_position: 17 },
  { page_key: "transport",       title: "Transportes",       icon: "Bus",              default_position: 18 },
  { page_key: "restaurants",     title: "Onde Comer",        icon: "UtensilsCrossed",  default_position: 19 },
  { page_key: "attractions",     title: "Pontos Turísticos", icon: "Landmark",         default_position: 20 },
  { page_key: "maintenance",     title: "Manutenção",        icon: "Hammer",           default_position: 21 },
  { page_key: "review",          title: "Avaliação",         icon: "Star",             default_position: 22 },
  { page_key: "faq",             title: "FAQ",               icon: "HelpCircle",       default_position: 23 },
];

function buildPageBlocks(pageKey: string, details: any, address: string | null): BlockSeed[] {
  const blocks: BlockSeed[] = [];
  const d = details ?? {};
  const extras = d.extras ?? {};

  switch (pageKey) {
    case "checkin": {
      const time = txt(d.checkin_time);
      const instr = txt(d.checkin_instructions);
      if (time) blocks.push({ type: "text", data: { content: `**Horário de check-in:** ${time}` } });
      if (instr) blocks.push({ type: "text", data: { content: instr } });
      break;
    }
    case "checkout": {
      const time = txt(d.checkout_time);
      const instr = txt(d.checkout_instructions);
      if (time) blocks.push({ type: "text", data: { content: `**Horário de check-out:** ${time}` } });
      if (instr) blocks.push({ type: "text", data: { content: instr } });
      break;
    }
    case "wifi": {
      const ssid = txt(d.wifi_ssid);
      const pass = txt(d.wifi_password);
      if (ssid) blocks.push({ type: "text", data: { content: `**Rede:** ${ssid}` } });
      if (pass) blocks.push({ type: "password", data: { label: "Senha do Wi-Fi", value: pass } });
      break;
    }
    case "lock_code": {
      const code = txt(d.lock_code);
      if (code) blocks.push({ type: "password", data: { label: "Senha da fechadura", value: code } });
      break;
    }
    case "rules": {
      const rules = txt(d.rules);
      if (rules) blocks.push({ type: "text", data: { content: rules } });
      break;
    }
    case "parking": {
      const parking = txt(d.parking);
      if (parking) blocks.push({ type: "text", data: { content: parking } });
      break;
    }
    case "trash": {
      const trash = txt(d.trash);
      if (trash) blocks.push({ type: "text", data: { content: trash } });
      break;
    }
    case "emergency": {
      const contacts = Array.isArray(d.emergency_contacts) ? d.emergency_contacts : [];
      for (const c of contacts) {
        const name = txt(c?.name);
        const phone = txt(c?.phone);
        if (!name || !phone) continue;
        blocks.push({
          type: "button",
          data: { label: `${name}: ${phone}`, action: "link", value: `tel:${phone.replace(/\s+/g, "")}` },
        });
      }
      break;
    }
    case "location":
    case "how_to_arrive": {
      const addr = txt(address);
      const lat = d.latitude;
      const lng = d.longitude;
      const locUrl = txt(extras?.location_url) ?? (lat && lng ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : null);
      if (addr) blocks.push({ type: "text", data: { content: `**Endereço:** ${addr}` } });
      if (locUrl) blocks.push({ type: "button", data: { label: "Abrir no Google Maps", action: "link", value: locUrl } });
      break;
    }
    case "contacts": {
      const intercom = txt(extras?.intercom);
      if (intercom) blocks.push({ type: "text", data: { content: `**Interfone da portaria:** ${intercom}` } });
      break;
    }
  }
  return blocks;
}

async function generateAutoBlocks(
  admin: any,
  propertyId: string,
  details: any,
  address: string | null,
  overrides: Map<string, BlockSeed[]>,
) {
  const { data: pages } = await admin
    .from("property_pages")
    .select("id, page_key")
    .eq("property_id", propertyId);
  if (!pages?.length) return 0;

  const pageIds = pages.map((p: any) => p.id);
  // Remove only previously auto-generated blocks (preserves manual edits)
  await admin.from("content_blocks").delete().in("page_id", pageIds).eq("source", "auto");

  let overridesApplied = 0;

  // Insert per-page so a single bad row doesn't abort all pages
  for (const page of pages) {
    // Override from payload `pages[]` takes precedence over details-derived blocks
    const override = overrides.get(page.page_key);
    const blocks = override ?? buildPageBlocks(page.page_key, details, address);
    if (!blocks.length) continue;

    // Read remaining manual blocks on this page to avoid overlapping positions
    // and to skip auto blocks whose `type` was already manually authored.
    const { data: manualBlocks } = await admin
      .from("content_blocks")
      .select("type, position")
      .eq("page_id", page.id)
      .eq("source", "manual");

    const manualTypes = new Set((manualBlocks ?? []).map((b: any) => b.type));
    const startPos = (manualBlocks ?? []).reduce(
      (m: number, b: any) => Math.max(m, (b.position ?? 0) + 1),
      0,
    );

    const filtered = blocks.filter((b) => !manualTypes.has(b.type));
    if (!filtered.length) continue;

    const rows = filtered.map((b, i) => ({
      page_id: page.id,
      type: b.type,
      data: b.data,
      position: startPos + i,
      source: "auto",
    }));
    const { error } = await admin.from("content_blocks").insert(rows);
    if (error) {
      console.error(`auto-blocks insert failed for page ${page.page_key}`, error);
    } else if (override) {
      overridesApplied++;
    }
  }
  return overridesApplied;
}

function buildPagesOverrides(pages: any): Map<string, BlockSeed[]> {
  const map = new Map<string, BlockSeed[]>();
  if (!Array.isArray(pages)) return map;
  const validKeys = new Set(PAGES_CATALOG.map((p) => p.page_key));
  for (const p of pages) {
    const pageKey = txt(p?.page_key);
    if (!pageKey || !validKeys.has(pageKey)) continue;
    const content = txt(p?.content);
    if (!content) continue;
    map.set(pageKey, [{ type: "text", data: { content } }]);
  }
  return map;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = req.headers.get("X-API-Key") ?? req.headers.get("x-api-key");
    if (!apiKey) return json({ error: "missing_api_key" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const hash = await sha256(apiKey);

    const { data: keyRow } = await admin
      .from("tenant_api_keys")
      .select("tenant_id, id, revoked_at")
      .eq("key_hash", hash)
      .maybeSingle();

    if (!keyRow || keyRow.revoked_at) return json({ error: "invalid_api_key" }, 401);
    const tenantId = keyRow.tenant_id;

    // touch last_used
    admin.from("tenant_api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyRow.id).then();

    if (req.method === "GET") {
      const url = new URL(req.url);
      const qp = url.searchParams;

      // Sub-route: catalog of all default page_keys (no DB)
      if (/\/pages-catalog\/?$/.test(url.pathname)) {
        return json({ count: PAGES_CATALOG.length, items: PAGES_CATALOG });
      }

      // Sub-route: pages of a specific property by external_id
      if (/\/pages\/?$/.test(url.pathname)) {
        const extId = qp.get("external_id");
        const extProv = qp.get("external_provider") ?? "stays";
        if (!extId) return json({ error: "external_id_required" }, 400);

        const { data: prop } = await admin
          .from("properties")
          .select("id")
          .eq("tenant_id", tenantId)
          .eq("external_provider", extProv)
          .eq("external_id", String(extId))
          .maybeSingle();

        if (!prop) return json({ error: "property_not_found" }, 404);

        const { data: pages, error: pErr } = await admin
          .from("property_pages")
          .select("id, page_key, title, icon, position, is_enabled")
          .eq("property_id", prop.id)
          .order("position");
        if (pErr) throw pErr;

        return json({
          property_id: prop.id,
          external_id: String(extId),
          external_provider: extProv,
          count: pages?.length ?? 0,
          items: pages ?? [],
        });
      }

      const externalId = qp.get("external_id");
      const externalProvider = qp.get("external_provider");
      const status = qp.get("status");
      const createdFrom = qp.get("created_from");
      const createdTo = qp.get("created_to");
      const search = qp.get("search");
      const limit = Math.min(Math.max(parseInt(qp.get("limit") ?? "100", 10) || 100, 1), 500);
      const offset = Math.max(parseInt(qp.get("offset") ?? "0", 10) || 0, 0);

      let q = admin
        .from("properties")
        .select(
          "id, tenant_id, name, external_id, external_provider, status, address, booking_url, cover_image_url, public_slug, created_at, updated_at",
          { count: "exact" },
        )
        .eq("tenant_id", tenantId);

      if (externalId) q = q.eq("external_id", externalId);
      if (externalProvider) q = q.eq("external_provider", externalProvider);
      if (status === "active" || status === "inactive") q = q.eq("status", status);
      if (createdFrom) q = q.gte("created_at", createdFrom);
      if (createdTo) q = q.lte("created_at", createdTo);
      if (search) q = q.ilike("name", `%${search}%`);

      const { data, error, count } = await q
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;

      const publicBase = "https://hub.mrflow.com.br/g/";
      const items = (data ?? []).map((r: any) => ({
        ...r,
        public_url: r.public_slug ? `${publicBase}${r.public_slug}` : null,
      }));

      return json({ total: count ?? 0, count: items.length, limit, offset, items });
    }

    if (req.method !== "POST" && req.method !== "PUT") {
      return json({ error: "method_not_allowed" }, 405);
    }

    const body = await req.json();
    const {
      external_id,
      external_provider = "stays",
      name,
      description,
      status,
      address,
      latitude,
      longitude,
      booking_url,
      cover_image_url,
      images,
      details,
      pages,
      raw,
    } = body ?? {};

    if (!name) return json({ error: "name_required" }, 400);
    if (!external_id && req.method === "PUT") {
      return json({ error: "external_id_required_for_put" }, 400);
    }

    // Find existing
    let existing: any = null;
    if (external_id) {
      const { data } = await admin
        .from("properties")
        .select("id, public_slug")
        .eq("tenant_id", tenantId)
        .eq("external_provider", external_provider)
        .eq("external_id", String(external_id))
        .maybeSingle();
      existing = data;
    }

    const slug = existing?.public_slug ?? `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;

    const propertyPayload: any = {
      tenant_id: tenantId,
      name,
      description: description ?? null,
      address: address ?? null,
      booking_url: booking_url ?? null,
      cover_image_url: cover_image_url ?? null,
      external_id: external_id ? String(external_id) : null,
      external_provider,
      external_data: raw ?? null,
      status: status === "active" || status === "inactive" ? status : "active",
      public_slug: slug,
    };

    let propertyId: string;
    let created = false;

    if (existing) {
      const { error } = await admin.from("properties").update(propertyPayload).eq("id", existing.id);
      if (error) throw error;
      propertyId = existing.id;
    } else {
      const { data, error } = await admin.from("properties").insert(propertyPayload).select("id").single();
      if (error) throw error;
      propertyId = data.id;
      created = true;
    }

    // Upsert details
    if (details && typeof details === "object") {
      const detailsPayload: any = {
        property_id: propertyId,
        checkin_time: details.checkin_time ?? null,
        checkin_instructions: details.checkin_instructions ?? null,
        checkout_time: details.checkout_time ?? null,
        checkout_instructions: details.checkout_instructions ?? null,
        lock_code: details.lock_code ?? null,
        wifi_ssid: details.wifi_ssid ?? null,
        wifi_password: details.wifi_password ?? null,
        latitude: details.latitude ?? null,
        longitude: details.longitude ?? null,
        rules: details.rules ?? null,
        parking: details.parking ?? null,
        trash: details.trash ?? null,
        emergency_contacts: details.emergency_contacts ?? [],
        extras: details.extras ?? {},
      };
      await admin.from("property_details").upsert(detailsPayload, { onConflict: "property_id" });
    }

    // Auto-generate content blocks: from details + overrides from payload pages[]
    const overrides = buildPagesOverrides(pages);
    let pagesUpdated = 0;
    if ((details && typeof details === "object") || overrides.size > 0) {
      pagesUpdated = await generateAutoBlocks(admin, propertyId, details ?? {}, address, overrides);
    }

    // Replace images
    if (Array.isArray(images)) {
      await admin.from("property_images").delete().eq("property_id", propertyId);
      if (images.length) {
        const rows = images.map((url: string, i: number) => ({
          property_id: propertyId,
          url,
          position: i,
        }));
        await admin.from("property_images").insert(rows);
      }
    }

    return json({ id: propertyId, public_slug: slug, created, updated: !created, pages_updated: pagesUpdated });
  } catch (e: any) {
    console.error("properties-api error", e);
    return json({ error: e.message ?? "internal" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
