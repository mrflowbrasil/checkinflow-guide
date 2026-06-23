import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getStripeEnvironment } from "@/lib/stripe";

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

export default function LaunchSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<any>(null);

  useEffect(() => {
    let attempts = 0;
    let cancelled = false;
    const poll = async () => {
      if (!user) return;
      attempts++;
      const { data: profile } = await supabase
        .from("profiles").select("tenant_id").eq("id", user.id).maybeSingle();
      if (!profile?.tenant_id) { schedule(); return; }
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .eq("plan_code", "launch")
        .eq("environment", getStripeEnvironment())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (data && ["active", "trialing"].includes(data.status)) {
        setSub(data); setLoading(false);
      } else schedule();
    };
    const schedule = () => {
      if (cancelled) return;
      if (attempts > 20) { setLoading(false); return; }
      setTimeout(poll, 2000);
    };
    poll();
    return () => { cancelled = true; };
  }, [user]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] grid place-items-center px-5 py-12">
      <Card className="w-full max-w-xl p-8 sm:p-10 rounded-3xl border-[hsl(186_100%_32%)]/20 shadow-[0_30px_80px_-40px_hsl(186_100%_32%/0.4)]">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(186_100%_94%)] mb-4">
            {loading ? (
              <Loader2 className="h-8 w-8 text-[hsl(186_100%_28%)] animate-spin" />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-[hsl(186_100%_28%)]" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {loading ? "Confirmando seu pagamento…" : "Seu acesso foi liberado!"}
          </h1>
          <p className="mt-2 text-slate-600">
            {loading
              ? "Estamos aguardando a confirmação do Stripe. Isso leva alguns segundos."
              : "Você agora possui 1 ano de acesso ao GuestFlow Hub com todos os recursos do plano Pro."}
          </p>
        </div>

        {!loading && sub && (
          <dl className="mt-7 grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl bg-slate-50 p-5 text-sm">
            <dt className="text-slate-500">Plano</dt>
            <dd className="font-semibold text-slate-900 inline-flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-[hsl(186_100%_28%)]" /> Lançamento
            </dd>
            <dt className="text-slate-500">Valor</dt>
            <dd className="font-semibold text-slate-900">R$ 89,90</dd>
            <dt className="text-slate-500">Status</dt>
            <dd className="font-semibold text-green-700">Ativo</dd>
            <dt className="text-slate-500">Início</dt>
            <dd className="text-slate-800">{formatDate(sub.current_period_start)}</dd>
            <dt className="text-slate-500">Expira em</dt>
            <dd className="text-slate-800">{formatDate(sub.current_period_end)}</dd>
          </dl>
        )}

        <Button asChild className="w-full mt-7 h-12 rounded-xl bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white font-semibold">
          <Link to="/app">ACESSAR MEU GUESTFLOW HUB</Link>
        </Button>
        {sessionId && (
          <p className="mt-3 text-[11px] text-slate-400 text-center break-all">Sessão: {sessionId}</p>
        )}
      </Card>
    </div>
  );
}
