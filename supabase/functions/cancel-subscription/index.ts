const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { environment, reactivate } = (await req.json()) as {
      environment: StripeEnv;
      reactivate?: boolean;
    };
    if (environment !== "sandbox" && environment !== "live") throw new Error("Invalid environment");

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Unauthorized");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", userData.user.id)
      .maybeSingle();
    if (!profile?.tenant_id) throw new Error("No tenant");

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id, stripe_subscription_id")
      .eq("tenant_id", profile.tenant_id)
      .eq("environment", environment)
      .in("status", ["active", "trialing", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!sub?.stripe_subscription_id) throw new Error("No active subscription found");

    const stripe = createStripeClient(environment);
    const updated = await stripe.subscriptions.update(sub.stripe_subscription_id as string, {
      cancel_at_period_end: !reactivate,
    });

    const item = (updated as any).items?.data?.[0];
    const periodEnd = item?.current_period_end ?? (updated as any).current_period_end;
    const endsAt = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;

    await supabase
      .from("subscriptions")
      .update({
        cancel_at_period_end: !reactivate,
        current_period_end: endsAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sub.id);

    return new Response(JSON.stringify({ ok: true, cancel_at_period_end: !reactivate, ends_at: endsAt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    console.error("cancel-subscription error:", e);
    return new Response(JSON.stringify({ error: e.message ?? "Internal error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
