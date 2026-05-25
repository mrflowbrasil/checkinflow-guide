import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "super_admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const userId = (body?.userId ?? "").toString().trim();
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const password = (body?.password ?? "").toString();
    const reason = (body?.reason ?? "").toString().trim();

    if (!userId) {
      return new Response(JSON.stringify({ error: "missing_user_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return new Response(JSON.stringify({ error: "weak_password", message: "A senha deve ter no mínimo 8 caracteres, com letras e números." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (reason.length < 10) {
      return new Response(JSON.stringify({ error: "reason_required", message: "Informe um motivo (mín. 10 caracteres) para auditoria." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updErr } = await admin.auth.admin.updateUserById(userId, { password });
    if (updErr) throw updErr;

    // Audit log
    await admin.from("admin_action_log").insert({
      admin_user_id: userData.user.id,
      action: "password_set",
      target_user_id: userId,
      target_email: email || null,
      reason,
      metadata: {
        ip: req.headers.get("x-forwarded-for") ?? null,
        user_agent: req.headers.get("user-agent") ?? null,
      },
    });

    // Best-effort notification to the user that their password was changed by an admin.
    // Uses the transactional email queue if available; ignore errors silently.
    if (email) {
      try {
        await admin.rpc("enqueue_email", {
          queue_name: "transactional_emails",
          payload: {
            template: "admin_password_change_notice",
            to: email,
            subject: "Sua senha foi alterada pelo suporte",
            html: `<p>Olá,</p>
<p>Informamos que a senha da sua conta no <strong>Mr Flow Welcome Hub</strong> foi alterada por um administrador do suporte em ${new Date().toLocaleString("pt-BR")}.</p>
<p>Se você solicitou essa alteração, pode ignorar este e-mail. Caso contrário, entre em contato com nosso suporte imediatamente.</p>
<p>— Equipe Mr Flow</p>`,
          },
        });
      } catch (_) { /* notification is best-effort */ }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message ?? "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
