import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PURCHASE_PIXEL_ID = "1511762026462042";
const STORAGE_KEY = "launch_purchase_tracked";

export default function LaunchSuccess() {
  useEffect(() => {
    // Inicializa o pixel dedicado de Purchase e dispara o evento (uma única vez por sessão).
    try {
      const w = window as any;
      if (typeof w.fbq !== "function") return;

      w.fbq("init", PURCHASE_PIXEL_ID);

      if (!sessionStorage.getItem(STORAGE_KEY)) {
        w.fbq("track", "Purchase", {
          value: 89.9,
          currency: "BRL",
          content_name: "Welcome Hub - Launch",
          content_ids: ["launch_yearly"],
          content_type: "product",
        });
        sessionStorage.setItem(STORAGE_KEY, "1");
      }

      // dataLayer (GA4/GTM) opcional
      w.dataLayer?.push({
        event: "purchase",
        value: 89.9,
        currency: "BRL",
        plan: "launch",
      });
    } catch {
      /* noop */
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF7] grid place-items-center px-5 py-12">
      <Card className="w-full max-w-xl p-8 sm:p-10 rounded-3xl border-[hsl(186_100%_32%)]/20 shadow-[0_30px_80px_-40px_hsl(186_100%_32%/0.4)]">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(186_100%_94%)] mb-4">
            <CheckCircle2 className="h-8 w-8 text-[hsl(186_100%_28%)]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Pagamento confirmado! 🎉
          </h1>
          <p className="mt-3 text-slate-600">
            Obrigado pela sua compra! Seu plano <strong>Lançamento</strong> está ativo
            com 1 ano completo de acesso ao Welcome Hub.
          </p>
        </div>

        <div className="mt-7 rounded-2xl bg-[hsl(186_100%_96%)] border border-[hsl(186_100%_32%)]/20 p-5 text-sm text-slate-700">
          <p className="font-semibold text-slate-900 mb-1">Próximo passo</p>
          <p>
            Crie sua conta usando o <strong>mesmo e-mail</strong> do pagamento para
            liberar o acesso ao seu painel e cadastrar seu primeiro imóvel.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            asChild
            className="w-full h-12 rounded-xl bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white font-semibold"
          >
            <Link to="/signup?plan=launch">
              CRIAR MEU PRIMEIRO IMÓVEL
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full h-12 rounded-xl font-semibold"
          >
            <Link to="/auth">
              <LogIn className="mr-2 h-5 w-5" />
              Já tenho conta — Entrar
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-slate-500 text-center">
          Você receberá o recibo da Stripe no e-mail informado durante o pagamento.
        </p>
      </Card>
    </div>
  );
}
