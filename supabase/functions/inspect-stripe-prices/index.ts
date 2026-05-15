import { createStripeClient } from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok");
  try {
    const url = new URL(req.url);
    const env = (url.searchParams.get("env") ?? "live") as "sandbox" | "live";
    const stripe = createStripeClient(env);
    const keys = [
      "free_monthly",
      "starter_monthly",
      "starter_yearly",
      "pro_monthly",
      "pro_yearly",
      "business_monthly",
      "business_yearly",
    ];
    const result: any = { env, prices: [] };
    for (const k of keys) {
      const list = await stripe.prices.list({ lookup_keys: [k], expand: ["data.product"] });
      result.prices.push(
        ...list.data.map((p: any) => ({
          lookup_key: p.lookup_key,
          price_id: p.id,
          unit_amount: p.unit_amount,
          currency: p.currency,
          recurring: p.recurring?.interval,
          product_id: typeof p.product === "string" ? p.product : p.product?.id,
          product_name: typeof p.product === "string" ? null : p.product?.name,
          product_metadata: typeof p.product === "string" ? null : p.product?.metadata,
        })),
      );
    }
    return new Response(JSON.stringify(result, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
