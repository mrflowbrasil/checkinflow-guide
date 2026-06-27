import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const INGEST_SECRET = Deno.env.get("MRFLOW_RESERVATION_INGEST_SECRET") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-mrflow-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const BATCH_SIZE = 500;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

type IncomingItem = {
  tenant_id?: unknown;
  provider?: unknown;
  external_id?: unknown;
  payload?: unknown;
  synced_at?: unknown;
};

function normalizeItem(
  raw: IncomingItem,
  fallback: { tenant_id?: string; provider?: string; synced_at?: string },
): { ok: true; row: Record<string, unknown> } | { ok: false; error: string } {
  const tenant_id = (raw.tenant_id ?? fallback.tenant_id) as unknown;
  const provider = (raw.provider ?? fallback.provider) as unknown;
  const external_id = raw.external_id;
  const payload = raw.payload;
  const synced_at = raw.synced_at ?? fallback.synced_at;

  if (typeof tenant_id !== "string" || !UUID_RE.test(tenant_id)) {
    return { ok: false, error: "invalid_tenant_id" };
  }
  if (typeof provider !== "string" || provider.trim() === "") {
    return { ok: false, error: "invalid_provider" };
  }
  if (typeof external_id !== "string" || external_id.trim() === "") {
    return { ok: false, error: "invalid_external_id" };
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "invalid_payload" };
  }

  let syncedAtIso: string;
  if (synced_at === undefined || synced_at === null) {
    syncedAtIso = new Date().toISOString();
  } else if (typeof synced_at === "string") {
    const d = new Date(synced_at);
    if (Number.isNaN(d.getTime())) return { ok: false, error: "invalid_synced_at" };
    syncedAtIso = d.toISOString();
  } else {
    return { ok: false, error: "invalid_synced_at" };
  }

  return {
    ok: true,
    row: {
      tenant_id,
      provider: provider.trim(),
      external_id: external_id.trim(),
      payload,
      synced_at: syncedAtIso,
    },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const provided = req.headers.get("x-mrflow-secret") ?? "";
  if (!INGEST_SECRET || !provided || !constantTimeEqual(provided, INGEST_SECRET)) {
    return json({ error: "unauthorized" }, 401);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  // Accept three shapes:
  //  - single object: { tenant_id, provider, external_id, payload, synced_at }
  //  - { items: [...] } batch with optional top-level defaults for tenant_id/provider/synced_at
  //  - bare array: [ {...}, {...} ]
  let rawItems: IncomingItem[];
  let fallback: { tenant_id?: string; provider?: string; synced_at?: string } = {};

  if (Array.isArray(body)) {
    rawItems = body as IncomingItem[];
  } else if (body && Array.isArray(body.items)) {
    rawItems = body.items as IncomingItem[];
    fallback = {
      tenant_id: typeof body.tenant_id === "string" ? body.tenant_id : undefined,
      provider: typeof body.provider === "string" ? body.provider : undefined,
      synced_at: typeof body.synced_at === "string" ? body.synced_at : undefined,
    };
  } else if (body && typeof body === "object") {
    rawItems = [body as IncomingItem];
  } else {
    return json({ error: "invalid_body" }, 400);
  }

  if (rawItems.length === 0) return json({ error: "empty_items" }, 400);

  const rows: Record<string, unknown>[] = [];
  const errors: { index: number; error: string }[] = [];
  for (let i = 0; i < rawItems.length; i++) {
    const result = normalizeItem(rawItems[i] ?? {}, fallback);
    if (result.ok) rows.push(result.row);
    else errors.push({ index: i, error: result.error });
  }

  if (rows.length === 0) {
    return json({ error: "no_valid_items", errors }, 400);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  let upserted = 0;
  const batchErrors: { batch: number; error: string }[] = [];

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const { error } = await admin
      .from("reservations_import")
      .upsert(chunk, { onConflict: "tenant_id,provider,external_id" });

    if (error) {
      console.error("[ingest-reservations] batch upsert error", {
        batch: i / BATCH_SIZE,
        message: error.message,
      });
      batchErrors.push({ batch: i / BATCH_SIZE, error: error.message });
      continue;
    }
    upserted += chunk.length;
  }

  return json({
    success: batchErrors.length === 0,
    received: rawItems.length,
    upserted,
    invalid: errors.length,
    item_errors: errors.slice(0, 20),
    batch_errors: batchErrors,
  });
});
