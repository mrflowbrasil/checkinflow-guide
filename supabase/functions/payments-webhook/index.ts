import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook, createStripeClient } from "../_shared/stripe.ts";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }
  return _supabase;
}

// Map Stripe lookup_key -> plan_code in our DB
function planCodeFromPriceId(priceId: string): string {
  if (priceId.startsWith("launch")) return "launch";
  if (priceId.startsWith("free")) return "free";
  if (priceId.startsWith("starter")) return "starter";
  if (priceId.startsWith("pro")) return "pro";
  if (priceId.startsWith("business")) return "business";
  return "free";
}

function intervalFromPriceId(priceId: string): string {
  return priceId.endsWith("_yearly") ? "year" : "month";
}

async function resolvePriceLookupKey(stripe: any, stripePriceId: string): Promise<string | null> {
  try {
    const price = await stripe.prices.retrieve(stripePriceId);
    return price?.lookup_key ?? null;
  } catch {
    return null;
  }
}

async function getCustomerEmail(stripe: any, customerId: string): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return (customer && !customer.deleted && customer.email) || null;
  } catch {
    return null;
  }
}

async function storePendingPurchase(subscription: any, env: StripeEnv) {
  const stripe = createStripeClient(env);
  const email = await getCustomerEmail(stripe, subscription.customer);
  if (!email) {
    console.error("Cannot store pending purchase: no customer email", subscription.id);
    return;
  }

  const item = subscription.items?.data?.[0];
  const stripePriceId = item?.price?.id;
  const productId = item?.price?.product;
  let priceLookup: string | null = item?.price?.lookup_key ?? null;
  if (!priceLookup && stripePriceId) {
    priceLookup = await resolvePriceLookupKey(stripe, stripePriceId);
  }
  const priceId = priceLookup ?? stripePriceId;
  const planCode = planCodeFromPriceId(priceId);
  const billingInterval = item?.price?.recurring?.interval ?? intervalFromPriceId(priceId);
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  // Try to claim immediately if a user with this email already exists
  const { data: existingUser } = await getSupabase().auth.admin.listUsers();
  const match = existingUser?.users?.find((u: any) => (u.email || "").toLowerCase() === email.toLowerCase());

  if (match) {
    const { data: profile } = await getSupabase()
      .from("profiles").select("tenant_id").eq("id", match.id).maybeSingle();
    if (profile?.tenant_id) {
      await getSupabase().from("subscriptions").upsert({
        tenant_id: profile.tenant_id,
        user_id: match.id,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        product_id: productId,
        price_id: priceId,
        plan_code: planCode,
        billing_interval: billingInterval,
        status: subscription.status,
        current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        environment: env,
        updated_at: new Date().toISOString(),
      }, { onConflict: "stripe_subscription_id" });

      const isActive = ["active","trialing","past_due"].includes(subscription.status);
      if (isActive) {
        await getSupabase().from("tenants").update({
          plan_code: planCode,
          plan_status: subscription.status,
          plan_expires_at: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
        }).eq("id", profile.tenant_id);
      }
      return;
    }
  }

  await getSupabase().from("pending_purchases").upsert({
    email,
    stripe_customer_id: subscription.customer,
    stripe_subscription_id: subscription.id,
    product_id: productId,
    price_id: priceId,
    plan_code: planCode,
    billing_interval: billingInterval,
    status: subscription.status,
    current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    environment: env,
    updated_at: new Date().toISOString(),
  }, { onConflict: "stripe_subscription_id" });

  console.log("Stored pending purchase for", email, subscription.id);
}

async function upsertSubscription(subscription: any, env: StripeEnv) {
  const tenantId = subscription.metadata?.tenantId;
  const userId = subscription.metadata?.userId;
  if (!tenantId || !userId) {
    // Payment Link / anonymous checkout: store as pending and link on signup
    await storePendingPurchase(subscription, env);
    return;
  }

  const item = subscription.items?.data?.[0];
  const stripePriceId = item?.price?.id;
  const productId = item?.price?.product;

  // Resolve human-readable price id (lookup_key)
  let priceLookup: string | null = item?.price?.lookup_key ?? null;
  if (!priceLookup && stripePriceId) {
    const stripe = createStripeClient(env);
    priceLookup = await resolvePriceLookupKey(stripe, stripePriceId);
  }
  const priceId = priceLookup ?? subscription.metadata?.priceId ?? stripePriceId;
  const planCode = planCodeFromPriceId(priceId);
  const billingInterval = item?.price?.recurring?.interval ?? intervalFromPriceId(priceId);

  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  await getSupabase().from("subscriptions").upsert(
    {
      tenant_id: tenantId,
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      product_id: productId,
      price_id: priceId,
      plan_code: planCode,
      billing_interval: billingInterval,
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  // Sync tenant plan_code for active/trialing/past_due
  const isActive = ["active", "trialing", "past_due"].includes(subscription.status);
  if (isActive) {
    await getSupabase()
      .from("tenants")
      .update({
        plan_code: planCode,
        plan_status: subscription.status,
        plan_expires_at: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        stripe_customer_id: subscription.customer,
        stripe_subscription_id: subscription.id,
      })
      .eq("id", tenantId);
  }
}

async function handleSubscriptionDeleted(subscription: any, env: StripeEnv) {
  const tenantId = subscription.metadata?.tenantId;
  await getSupabase()
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);

  if (tenantId) {
    await getSupabase()
      .from("tenants")
      .update({ plan_code: "free", plan_status: "canceled" })
      .eq("id", tenantId);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    console.error("Webhook invalid env:", rawEnv);
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const env: StripeEnv = rawEnv;

  try {
    const event = await verifyWebhook(req, env);
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await upsertSubscription(event.data.object, env);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object, env);
        break;
      default:
        console.log("Unhandled event:", event.type);
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});
