import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTenant, usePlanUsage } from "@/hooks/useTenant";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Check, Sparkles, ExternalLink, Crown } from "lucide-react";
import { useState } from "react";
import { StripeEmbeddedCheckout } from "@/components/billing/StripeEmbeddedCheckout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getStripeEnvironment } from "@/lib/stripe";

type Interval = "month" | "year";

type Plan = {
  code: string;
  name: string;
  property_limit: number;
  price_cents: number;
  price_yearly_cents: number;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  description: string | null;
};

const formatBRL = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

const PLAN_FEATURES: Record<string, string[]> = {
  free: ["1 imóvel", "Guias personalizáveis", "3 templates", "QR codes ilimitados"],
  starter: ["5 imóveis", "Guias personalizáveis", "3 templates", "QR codes ilimitados"],
  pro: [
    "20 imóveis",
    "Guias personalizáveis",
    "15 templates premium",
    "Logo personalizada no guia",
    "URL rotativa (revoga acesso de hóspedes anteriores)",
  ],
  business: [
    "20 imóveis",
    "Guias personalizáveis",
    "15 templates premium",
    "Logo personalizada no guia",
    "URL rotativa",
    "Integração nativa Stays e Hostaway",
  ],
};

export default function Billing() {
  const { data: tenant } = useTenant();
  const { data: usage } = usePlanUsage();
  const [interval, setInterval] = useState<Interval>("month");
  const [checkoutPriceId, setCheckoutPriceId] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["billing_plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("position");
      if (error) throw error;
      return data as Plan[];
    },
  });

  const { data: subscription } = useQuery({
    queryKey: ["tenant_subscription", tenant?.id],
    enabled: !!tenant,
    queryFn: async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("tenant_id", tenant!.id)
        .eq("environment", getStripeEnvironment())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const openPortal = async () => {
    setOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: {
          returnUrl: `${window.location.origin}/app/billing`,
          environment: getStripeEnvironment(),
        },
      });
      if (error || !data?.url) throw new Error(error?.message ?? data?.error ?? "Erro");
      window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e.message ?? "Não foi possível abrir o portal");
    } finally {
      setOpeningPortal(false);
    }
  };

  if (isLoading || !plans) {
    return (
      <div className="container py-12 grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const currentPlanCode = tenant?.plan_code ?? "free";
  const yearlyDiscount = (monthly: number, yearly: number) =>
    monthly > 0 ? Math.round((1 - yearly / (monthly * 12)) * 100) : 0;

  return (
    <div className="container py-8 max-w-6xl space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-semibold">Planos e cobrança</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Escolha o plano ideal para o seu volume de imóveis.
        </p>
      </header>

      {/* Current plan summary */}
      <Card className="p-5 shadow-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-accent/10 grid place-items-center">
            <Crown className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Plano atual</div>
            <div className="font-semibold capitalize">
              {plans.find((p) => p.code === currentPlanCode)?.name ?? currentPlanCode}
              {usage && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  · {usage.used}/{usage.unlimited ? "∞" : usage.limit} imóveis
                </span>
              )}
            </div>
          </div>
        </div>
        {subscription?.stripe_customer_id && (
          <Button variant="outline" size="sm" onClick={openPortal} disabled={openingPortal}>
            {openingPortal ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
            Gerenciar assinatura
          </Button>
        )}
      </Card>

      {/* Interval toggle */}
      <div className="flex justify-center">
        <Tabs value={interval} onValueChange={(v) => setInterval(v as Interval)}>
          <TabsList>
            <TabsTrigger value="month">Mensal</TabsTrigger>
            <TabsTrigger value="year">
              Anual <Badge variant="secondary" className="ml-2">−17%</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Plans grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.code === currentPlanCode;
          const cents = interval === "month" ? plan.price_cents : plan.price_yearly_cents;
          const priceId = interval === "month" ? plan.stripe_price_id_monthly : plan.stripe_price_id_yearly;
          const discount = yearlyDiscount(plan.price_cents, plan.price_yearly_cents);
          const isFree = plan.code === "free";
          const isHighlighted = plan.code === "pro";

          return (
            <Card
              key={plan.code}
              className={`p-6 shadow-card flex flex-col relative ${
                isHighlighted ? "border-accent ring-2 ring-accent/20" : ""
              }`}
            >
              {isHighlighted && (
                <Badge className="absolute -top-2 right-4 bg-accent text-accent-foreground">
                  <Sparkles className="h-3 w-3 mr-1" /> Popular
                </Badge>
              )}
              <div className="space-y-1 mb-4">
                <h3 className="font-semibold text-lg">{plan.name}</h3>
                <p className="text-xs text-muted-foreground min-h-[2.5em]">{plan.description}</p>
              </div>

              <div className="mb-5">
                {isFree ? (
                  <div className="text-3xl font-bold">Grátis</div>
                ) : (
                  <>
                    <div className="text-3xl font-bold">
                      {formatBRL(cents)}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{interval === "month" ? "mês" : "ano"}
                      </span>
                    </div>
                    {interval === "year" && discount > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Economize {discount}% no anual
                      </div>
                    )}
                  </>
                )}
              </div>

              <ul className="space-y-2 text-sm mb-6 flex-1">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
                  <span>
                    {plan.property_limit >= 999 ? "Imóveis ilimitados" : `${plan.property_limit} ${plan.property_limit === 1 ? "imóvel" : "imóveis"}`}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
                  <span>Guias personalizáveis</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
                  <span>QR codes ilimitados</span>
                </li>
              </ul>

              <Button
                className="w-full"
                variant={isCurrent ? "outline" : isHighlighted ? "default" : "secondary"}
                disabled={isCurrent || isFree || !priceId}
                onClick={() => priceId && setCheckoutPriceId(priceId)}
              >
                {isCurrent ? "Plano atual" : isFree ? "Plano gratuito" : "Assinar"}
              </Button>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Pagamentos processados com segurança via Stripe. Cancele a qualquer momento — você
        mantém acesso até o fim do período pago. Notas fiscais são emitidas pela sua empresa.
      </p>

      <Dialog open={!!checkoutPriceId} onOpenChange={(o) => !o && setCheckoutPriceId(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Finalizar assinatura</DialogTitle>
          </DialogHeader>
          {checkoutPriceId && (
            <div className="max-h-[80vh] overflow-y-auto">
              <StripeEmbeddedCheckout
                priceId={checkoutPriceId}
                returnUrl={`${window.location.origin}/app/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
