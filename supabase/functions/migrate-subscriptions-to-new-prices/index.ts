// Admin one-shot: migrate all active subscriptions from old prices to the
// current price for the same lookup_key. Stripe automatically transferred
// the lookup_key to the newly created price; the old price was archived.
// We update each subscription item to point at the new price.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const LOOKUP_KEYS = [
  "free_monthly",
  "starter_monthly",
  "starter_yearly",
  "pro_monthly",
  "pro_yearly",
  "business_monthly",
  "business_yearly",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const env = (url.searchParams.get("env") ?? "sandbox") as StripeEnv;
    const dryRun = url.searchParams.get("dry_run") === "true";
    const prorationBehavior =
      (url.searchParams.get("proration_behavior") as
        | "none"
        | "create_prorations"
        | "always_invoice"
        | null) ?? "none";

    // Verify caller is super_admin
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return json({ error: "Unauthorized" }, 401);
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    if (!roles?.some((r) => r.role === "super_admin")) {
      return json({ error: "Forbidden" }, 403);
    }

    const stripe = createStripeClient(env);

    // Build map: lookup_key -> current active price id
    const currentPrices = await stripe.prices.list({
      lookup_keys: LOOKUP_KEYS,
      active: true,
      limit: 100,
    });
    const lookupToPriceId = new Map<string, string>();
    for (const p of currentPrices.data) {
      if (p.lookup_key) lookupToPriceId.set(p.lookup_key, p.id);
    }

    const results: any[] = [];

    // Iterate active subscriptions
    let startingAfter: string | undefined;
    while (true) {
      const page = await stripe.subscriptions.list({
        status: "active",
        limit: 100,
        ...(startingAfter && { starting_after: startingAfter }),
      });
      for (const sub of page.data) {
        for (const item of sub.items.data) {
          const currentPriceId = item.price.id;
          const currentLookup = item.price.lookup_key;
          if (!currentLookup) continue;
          const targetPriceId = lookupToPriceId.get(currentLookup);
          if (!targetPriceId || targetPriceId === currentPriceId) continue;

          const action = {
            subscription_id: sub.id,
            item_id: item.id,
            customer: sub.customer,
            lookup_key: currentLookup,
            from_price: currentPriceId,
            from_amount: item.price.unit_amount,
            to_price: targetPriceId,
            migrated: false,
          };

          if (!dryRun) {
            await stripe.subscriptions.update(sub.id, {
              items: [{ id: item.id, price: targetPriceId }],
              proration_behavior: prorationBehavior,
            });
            action.migrated = true;
          }
          results.push(action);
        }
      }
      if (!page.has_more) break;
      startingAfter = page.data[page.data.length - 1].id;
    }

    return json({
      env,
      dry_run: dryRun,
      proration_behavior: prorationBehavior,
      total: results.length,
      results,
    });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
