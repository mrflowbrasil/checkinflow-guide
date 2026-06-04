import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// Runs every 15 min via pg_cron. Finds users created 24h-7d ago whose tenant
// has zero properties, sends the reminder email, and fires the onboarding
// webhook with tipo="primeiro-imovel". Idempotent via first_property_reminders.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey);

  const now = Date.now();
  const lowerBound = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const upperBound = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  const result = { scanned: 0, processed: 0, skipped: 0, errors: [] as string[] };

  try {
    // List users page-by-page (max ~50/run)
    const { data: usersPage, error: usersErr } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (usersErr) throw usersErr;

    const candidates = (usersPage.users ?? []).filter((u) => {
      if (!u.email || !u.created_at) return false;
      const created = new Date(u.created_at).getTime();
      return created >= new Date(lowerBound).getTime() &&
             created <= new Date(upperBound).getTime();
    });
    result.scanned = candidates.length;

    // Filter out already-reminded users
    const userIds = candidates.map((u) => u.id);
    let alreadyReminded = new Set<string>();
    if (userIds.length) {
      const { data: existing } = await admin
        .from("first_property_reminders")
        .select("user_id")
        .in("user_id", userIds);
      alreadyReminded = new Set((existing ?? []).map((r: any) => r.user_id));
    }

    // Fetch webhook URL once
    const { data: hook } = await admin
      .from("integration_webhooks")
      .select("webhook_url, is_active")
      .eq("provider", "onboarding")
      .maybeSingle();

    let processedCount = 0;
    for (const user of candidates) {
      if (processedCount >= 50) break;
      if (alreadyReminded.has(user.id)) {
        result.skipped++;
        continue;
      }

      // Skip super admins
      const { data: roleRow } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .maybeSingle();
      if (roleRow) {
        result.skipped++;
        continue;
      }

      // Get tenant
      const { data: profile } = await admin
        .from("profiles")
        .select("tenant_id, full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (!profile?.tenant_id) {
        result.skipped++;
        continue;
      }

      // Count properties
      const { count } = await admin
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", profile.tenant_id);
      if ((count ?? 0) > 0) {
        result.skipped++;
        continue;
      }

      const firstName = (profile.full_name ?? "").split(" ")[0] || null;
      let emailStatus = "skipped";
      let webhookStatus = "skipped";

      // Send email
      try {
        const { error: emailErr } = await admin.functions.invoke("send-transactional-email", {
          body: {
            templateName: "first-property-reminder",
            recipientEmail: user.email,
            idempotencyKey: `first-prop-${user.id}`,
            templateData: { firstName },
          },
        });
        emailStatus = emailErr ? `error: ${emailErr.message}` : "queued";
      } catch (e) {
        emailStatus = `error: ${String(e)}`;
      }

      // Fire webhook
      if (hook?.is_active && hook.webhook_url) {
        try {
          const resp = await fetch(hook.webhook_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tipo: "primeiro-imovel",
              user_id: user.id,
              tenant_id: profile.tenant_id,
              email: user.email,
              full_name: profile.full_name,
              created_at: user.created_at,
            }),
          });
          webhookStatus = `http_${resp.status}`;
        } catch (e) {
          webhookStatus = `error: ${String(e)}`;
        }
      }

      // Record
      const { error: insertErr } = await admin.from("first_property_reminders").insert({
        user_id: user.id,
        email_status: emailStatus,
        webhook_status: webhookStatus,
      });
      if (insertErr) result.errors.push(`insert ${user.id}: ${insertErr.message}`);

      processedCount++;
      result.processed++;
    }
  } catch (e) {
    console.error("first-property-reminder error", e);
    result.errors.push(String(e));
  }

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
