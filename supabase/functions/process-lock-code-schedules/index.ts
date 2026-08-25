import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";
import { writeLockCode } from "../_shared/lock-code.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const now = new Date().toISOString();
  let applied = 0;
  let removed = 0;
  let failed = 0;

  try {
    // 1) Publish due schedules
    const { data: toApply, error: applyErr } = await admin
      .from("property_lock_code_schedules")
      .select("id, property_id, lock_code, remove_at")
      .eq("status", "scheduled")
      .lte("apply_at", now)
      .order("apply_at")
      .limit(200);
    if (applyErr) throw applyErr;

    for (const row of toApply ?? []) {
      try {
        await writeLockCode(admin, row.property_id, row.lock_code);
        await admin
          .from("property_lock_code_schedules")
          .update({ status: "applied", applied_at: new Date().toISOString(), last_error: null })
          .eq("id", row.id);
        applied++;
      } catch (e: any) {
        failed++;
        console.error("lock-code apply failed", row.id, e?.message ?? e);
        await admin
          .from("property_lock_code_schedules")
          .update({ status: "failed", last_error: String(e?.message ?? e).slice(0, 500) })
          .eq("id", row.id);
      }
    }

    // 2) Expire schedules whose remove_at has passed
    const { data: toRemove, error: remErr } = await admin
      .from("property_lock_code_schedules")
      .select("id, property_id, lock_code")
      .eq("status", "applied")
      .not("remove_at", "is", null)
      .lte("remove_at", now)
      .order("remove_at")
      .limit(200);
    if (remErr) throw remErr;

    for (const row of toRemove ?? []) {
      try {
        // Only clear when the current code still belongs to this schedule,
        // so a newer manual/scheduled code is never wiped out.
        const { data: det } = await admin
          .from("property_details")
          .select("lock_code")
          .eq("property_id", row.property_id)
          .maybeSingle();

        if (det?.lock_code === row.lock_code) {
          await writeLockCode(admin, row.property_id, null);
        }

        await admin
          .from("property_lock_code_schedules")
          .update({ status: "removed", removed_at: new Date().toISOString(), last_error: null })
          .eq("id", row.id);
        removed++;
      } catch (e: any) {
        failed++;
        console.error("lock-code removal failed", row.id, e?.message ?? e);
        await admin
          .from("property_lock_code_schedules")
          .update({ last_error: String(e?.message ?? e).slice(0, 500) })
          .eq("id", row.id);
      }
    }

    return json({ ok: true, applied, removed, failed, at: now });
  } catch (e: any) {
    console.error("process-lock-code-schedules error", e);
    return json({ error: e?.message ?? "internal" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
