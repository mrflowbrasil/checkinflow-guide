import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, Check, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Reveal } from "@/hooks/useReveal";
import { supabase } from "@/integrations/supabase/client";
import { StripeEmbeddedCheckout } from "@/components/billing/StripeEmbeddedCheckout";
import { openQuickSignup } from "@/components/lp/QuickSignupDialog";
import { toast } from "sonner";

const LAUNCH_CHECKOUT_EVENT = "lp:open-launch-checkout";

export function openLaunchCheckout() {
  window.dispatchEvent(new Event(LAUNCH_CHECKOUT_EVENT));
}

const LAUNCH_FEATURES = [
  "Até 20 imóveis cadastrados",
  "Guia digital personalizado para hóspedes",
  "Compartilhamento por link e QR Code",
  "Páginas de Wi-Fi, check-in e checkout",
  "Regras da casa, localização e instruções de chegada",
  "Personalização visual completa do guia",
  "15 templates premium + logo personalizada",
  "URL rotativa (revoga acesso de hóspedes anteriores)",
  "Atualização em tempo real do conteúdo",
  "Suporte equivalente ao plano Pro",
];

type Slots = { limit: number; sold: number; remaining: number; available: boolean };

function track(event: string, payload: Record<string, unknown> = {}) {
  try {
    (window as any).dataLayer?.push({ event, plan: "launch", price: 89.9, currency: "BRL", ...payload });
  } catch { /* noop */ }
}

export default function LaunchOffer() {
  const [slots, setSlots] = useState<Slots | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const navigate = useNavigate();
  const viewedRef = useMemo(() => ({ done: false }), []);

  useEffect(() => {
    let mounted = true;
    supabase.rpc("get_launch_slots").then(({ data }) => {
      if (mounted && data) setSlots(data as unknown as Slots);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!viewedRef.done && slots) {
      track("view_launch_offer", { remaining_slots: slots.remaining });
      viewedRef.done = true;
    }
  }, [slots, viewedRef]);

  const remaining = slots?.remaining ?? null;
  const soldOut = slots ? !slots.available : false;

  async function handleCta() {
    track("click_launch_checkout", { remaining_slots: remaining });
    if (soldOut) return;
    setStarting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setStarting(false);
        toast.message("Crie sua conta para garantir o plano de lançamento.");
        openQuickSignup();
        return;
      }
      setCheckoutOpen(true);
      track("launch_checkout_created");
    } finally {
      setStarting(false);
    }
  }

  return (
    <section id="lancamento" className="relative py-20 lg:py-28 bg-gradient-to-b from-white via-[#FAFAF7] to-white border-y border-slate-200/60">
      <div className="container max-w-3xl mx-auto px-5 sm:px-8">
        {/* Alerta superior */}
        <Reveal>
          <div className="relative rounded-3xl border border-orange-200/80 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50/60 p-6 sm:p-7 text-center shadow-[0_20px_60px_-30px_rgba(234,88,12,0.35)]">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 ring-1 ring-orange-200">
                <Flame className="h-5 w-5 text-orange-600" />
              </span>
              <h2 className="text-base sm:text-lg font-bold tracking-[0.18em] uppercase text-orange-700">
                Plano exclusivo de lançamento
              </h2>
            </div>
            <p className="text-sm sm:text-base text-orange-800/90 font-medium">
              Condição especial disponível apenas para os 100 primeiros clientes
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Garanta 1 ano completo de acesso antes do encerramento do lote promocional.
            </p>
          </div>
        </Reveal>

        {/* Card principal */}
        <Reveal delay={120}>
          <Card className="relative mt-8 rounded-3xl border-2 border-[hsl(186_100%_32%)]/30 bg-white p-7 sm:p-10 shadow-[0_30px_80px_-40px_hsl(186_100%_32%/0.45)] overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -top-20 h-40 bg-[radial-gradient(ellipse_at_top,hsl(186_100%_88%/0.55),transparent_70%)]"
            />

            {/* Selo */}
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-200 px-4 py-1.5 text-[11px] sm:text-xs font-bold tracking-wider uppercase text-orange-700">
                <Flame className="h-3.5 w-3.5" />
                Lote promocional — apenas 100 acessos
              </span>
            </div>

            {/* Headline */}
            <div className="text-center mt-6 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[hsl(186_100%_24%)]">
                Plano Lançamento
              </p>
              <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                1 ano completo de Welcome Hub
              </h3>
            </div>

            {/* Preço */}
            <div className="mt-7 flex flex-col items-center">
              <div className="flex items-end gap-3">
                <span className="text-sm font-semibold text-slate-500 line-through pb-2 bg-rose-50 px-2 py-0.5 rounded-md">
                  R$ 199,90
                </span>
                <span className="text-6xl sm:text-7xl font-extrabold text-[hsl(186_100%_28%)] leading-none tracking-tight">
                  R$ 89,90
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-700">Pagamento anual</p>
              <p className="text-sm text-[hsl(186_100%_24%)] font-medium">
                Equivale a apenas R$ 7,49 por mês
              </p>
              <p className="mt-1 text-xs text-slate-500 max-w-xs text-center">
                Cobrança anual recorrente. Cancele quando quiser pelo painel.
              </p>
            </div>

            {/* Texto de apoio */}
            <p className="mt-6 text-center text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
              Garanta 1 ano de acesso com todos os recursos do plano Pro do Welcome Hub.
            </p>

            {/* Features */}
            <ul className="mt-7 grid sm:grid-cols-2 gap-x-6 gap-y-3 border-t border-slate-200/70 pt-6">
              {LAUNCH_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(186_100%_94%)] ring-1 ring-[hsl(186_100%_32%)]/25">
                    <Check className="h-3 w-3 text-[hsl(186_100%_28%)]" strokeWidth={3} />
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-8 flex flex-col items-center">
              <Button
                type="button"
                onClick={handleCta}
                disabled={starting || soldOut}
                className="w-full sm:w-auto h-14 px-8 rounded-2xl text-base font-bold bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white shadow-[0_15px_40px_-15px_hsl(186_100%_32%/0.6)] transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {starting ? (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Abrindo checkout…</>
                ) : soldOut ? (
                  "LOTE PROMOCIONAL ENCERRADO"
                ) : (
                  <>GARANTIR 1 ANO POR R$ 89,90 <ArrowRight className="ml-2 h-5 w-5" /></>
                )}
              </Button>

              {!soldOut && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-[hsl(186_100%_32%)]" />
                  Pagamento seguro pelo Stripe • Acesso imediato após confirmação
                </p>
              )}

              {soldOut && (
                <div className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <p className="text-sm text-slate-700 font-medium">
                    Os 100 acessos promocionais já foram adquiridos. Confira os demais planos disponíveis.
                  </p>
                  <Button asChild variant="outline" className="mt-3">
                    <Link to="/app/billing">Ver planos disponíveis</Link>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </Reveal>
      </div>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Finalizar plano Lançamento</DialogTitle>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto">
            <StripeEmbeddedCheckout
              priceId="launch_yearly"
              returnUrl={`${window.location.origin}/lancamento/sucesso?session_id={CHECKOUT_SESSION_ID}`}
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
