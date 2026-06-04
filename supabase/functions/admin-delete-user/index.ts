import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "super_admin",
    });
    if (!isAdmin) return json({ error: "forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const userId = (body?.user_id ?? "").toString().trim();
    const deleteWorkspace = !!body?.delete_workspace;
    if (!userId) return json({ error: "missing_user_id" }, 400);
    if (userId === userData.user.id) {
      return json({ error: "cannot_delete_self", message: "Você não pode excluir a própria conta." }, 400);
    }

    // Read target info (profile + auth user email)
    const { data: profile } = await admin
      .from("profiles")
      .select("tenant_id, full_name")
      .eq("id", userId)
      .maybeSingle();
    const tenantId: string | null = profile?.tenant_id ?? null;

    const { data: targetAuth } = await admin.auth.admin.getUserById(userId);
    const targetEmail = targetAuth?.user?.email ?? null;

    // Delete the auth user — cascades profiles, user_roles, onboarding_profiles
    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) throw delErr;

    let tenantDeleted = false;
    let tenantKeptReason: string | null = null;

    if (tenantId) {
      if (deleteWorkspace) {
        // Wipe everything tied to the tenant in dependency order
        const { data: props } = await admin
          .from("properties")
          .select("id")
          .eq("tenant_id", tenantId);
        const propIds = (props ?? []).map((p: any) => p.id);

        if (propIds.length > 0) {
          // Pages of these properties
          const { data: pages } = await admin
            .from("property_pages")
            .select("id")
            .in("property_id", propIds);
          const pageIds = (pages ?? []).map((p: any) => p.id);
          if (pageIds.length > 0) {
            await admin.from("content_blocks").delete().in("page_id", pageIds);
          }
          await admin.from("property_pages").delete().in("property_id", propIds);
          await admin.from("property_details").delete().in("property_id", propIds);
          await admin.from("property_images").delete().in("property_id", propIds);
          await admin.from("guide_translations").delete().in("property_id", propIds);
          await admin.from("property_slug_history").delete().in("property_id", propIds);
          await admin.from("properties").delete().in("id", propIds);
        }

        await admin.from("tenant_api_keys").delete().eq("tenant_id", tenantId);
        await admin.from("tenant_integrations").delete().eq("tenant_id", tenantId);
        await admin.from("subscriptions").delete().eq("tenant_id", tenantId);
        if (targetEmail) {
          await admin.from("invitations").delete().ilike("email", targetEmail);
        }
        // Any remaining profiles for this tenant become detached; remove them too
        await admin.from("profiles").delete().eq("tenant_id", tenantId);

        const { error: tErr } = await admin.from("tenants").delete().eq("id", tenantId);
        if (tErr) throw tErr;
        tenantDeleted = true;
      } else {
        // Only delete the tenant if it is now orphaned
        const { count: profCount } = await admin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenantId);
        const { count: propCount } = await admin
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenantId);
        if ((profCount ?? 0) === 0 && (propCount ?? 0) === 0) {
          await admin.from("tenant_api_keys").delete().eq("tenant_id", tenantId);
          await admin.from("tenant_integrations").delete().eq("tenant_id", tenantId);
          await admin.from("subscriptions").delete().eq("tenant_id", tenantId);
          await admin.from("tenants").delete().eq("id", tenantId);
          tenantDeleted = true;
        } else {
          tenantKeptReason = (propCount ?? 0) > 0 ? "has_properties" : "has_other_members";
        }
      }
    }

    // Audit log
    await admin.from("admin_action_log").insert({
      admin_user_id: userData.user.id,
      action: "delete_user",
      target_user_id: userId,
      target_email: targetEmail,
      metadata: {
        tenant_id: tenantId,
        delete_workspace: deleteWorkspace,
        tenant_deleted: tenantDeleted,
        tenant_kept_reason: tenantKeptReason,
        ip: req.headers.get("x-forwarded-for") ?? null,
        user_agent: req.headers.get("user-agent") ?? null,
      },
    });

    return json({ ok: true, tenant_deleted: tenantDeleted, tenant_kept_reason: tenantKeptReason });
  } catch (e: any) {
    console.error("admin-delete-user error", e);
    return json({ error: e.message ?? "error" }, 500);
  }
});
