import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, CalendarDays, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { openLaunchCheckout } from "@/components/lp/LaunchOffer";
import { Reveal } from "@/hooks/useReveal";

const CYAN = "hsl(186 100% 32%)";

const ctaPrimary =
  "h-14 px-7 rounded-2xl bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white font-semibold shadow-[0_10px_30px_-10px_hsl(186_100%_32%/0.5)] text-base";

const supportCards = [
  {
    icon: CalendarDays,
    title: "7 dias de teste",
    text: "Tempo suficiente para criar seu guia, testar com hóspedes reais e sentir a diferença na rotina.",
    bg: "bg-[hsl(186_100%_96%)]",
    ring: "ring-[hsl(186_100%_32%)]/15",
    iconColor: "text-[hsl(186_100%_28%)]",
  },
  {
    icon: CheckCircle2,
    title: "Cancelamento simples",
    text: "Não gostou? Basta solicitar o reembolso diretamente pela plataforma. Sem burocracia.",
    bg: "bg-[#F3EBDD]/70",
    ring: "ring-[#C9A56A]/25",
    iconColor: "text-[#8a6a35]",
  },
  {
    icon: Lock,
    title: "Risco zero",
    text: "Você testa durante os 7 dias, se não fizer sentido pra você, basta solicitar o reembolso.",
    bg: "bg-[#D8EBD9]/70",
    ring: "ring-[#7BA17F]/25",
    iconColor: "text-[#3f7a48]",
  },
];

export default function GarantiaSection() {
  return (
    <section className="py-20 lg:py-28 bg-white border-y border-slate-200/70">
      <div className="container max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <Reveal as="header" className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(186_100%_94%)] border border-[hsl(186_100%_32%)]/20 text-xs font-semibold tracking-wide uppercase text-[hsl(186_100%_24%)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            GARANTIA DE 7 DIAS
          </span>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight leading-[1.1] text-slate-900">
            Teste por 7 dias. Se não fizer sentido para você,{" "}
            <span style={{ color: CYAN }}>não paga nada.</span>
          </h2>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed">
            O Welcome Hub foi criado para simplificar a rotina de quem recebe hóspedes.
            Por isso, você pode experimentar com tranquilidade, criar seus guias digitais e
            decidir depois se faz sentido para o seu negócio.
          </p>
        </Reveal>

        {/* Card principal */}
        <Reveal delay={80}>
          <Card className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white to-[hsl(186_100%_96%)]/60 border border-slate-200/80 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)] p-8 lg:p-12 mb-10">
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[hsl(186_100%_85%)]/30 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#F3EBDD]/50 blur-3xl pointer-events-none" />

            <div className="relative grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center">
              {/* Texto */}
              <div className="order-2 lg:order-1">
                <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-4">
                  Garantia de Satisfação Incondicional
                </h3>
                <p className="text-slate-600 leading-relaxed mb-5">
                  Durante os primeiros 7 dias, você pode cadastrar seus imóveis, montar seus guias
                  digitais, compartilhar com hóspedes e testar o Welcome Hub na prática.
                </p>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Se perceber que a solução não é para você, basta cancelar antes do fim do período
                  gratuito.
                </p>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 text-sm text-slate-700 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(186_100%_94%)]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(186_100%_32%)]" />
                    </span>
                    Sem burocracia.
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(186_100%_94%)]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(186_100%_32%)]" />
                    </span>
                    
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(186_100%_94%)]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(186_100%_32%)]" />
                    </span>
                    Sem compromisso.
                  </span>
                </div>
              </div>

              {/* Selo */}
              <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                <div className="relative flex flex-col items-center justify-center text-center rounded-[2rem] bg-white border-2 border-[hsl(186_100%_32%)]/20 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.2)] px-10 py-10 lg:px-12 lg:py-12">
                  <div className="absolute -inset-1 rounded-[2.2rem] bg-gradient-to-br from-[hsl(186_100%_70%)]/20 to-transparent blur-lg pointer-events-none" />
                  <div className="relative">
                    <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(186_100%_94%)] border border-[hsl(186_100%_32%)]/15">
                      <ShieldCheck className="h-8 w-8 text-[hsl(186_100%_32%)]" />
                    </div>
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">
                      GARANTIA
                    </p>
                    <p className="mt-1 text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
                      7 DIAS
                    </p>
                    <p className="mt-1 text-sm font-semibold tracking-widest uppercase text-[hsl(186_100%_32%)]">
                      RISCO ZERO
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Reveal>

        {/* Cards de apoio */}
        <div className="grid sm:grid-cols-3 gap-5 mb-14 lg:mb-16">
          {supportCards.map((c, i) => (
            <Reveal key={c.title} delay={Math.min(i, 3) * 80}>
              <Card
                className={`p-6 rounded-3xl bg-white border-slate-200 ring-1 ${c.ring} shadow-[0_10px_30px_-20px_rgba(15,23,42,0.15)]`}
              >
                <div className={`h-12 w-12 rounded-2xl ${c.bg} grid place-items-center mb-4`}>
                  <c.icon className={`h-6 w-6 ${c.iconColor}`} />
                </div>
                <h4 className="text-base font-semibold text-slate-900 mb-1.5">{c.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{c.text}</p>
              </Card>
            </Reveal>
          ))}
        </div>

        {/* Chamada final */}
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="text-slate-600 leading-relaxed mb-8">
            Você só continua se o Welcome Hub realmente ajudar você a economizar tempo e melhorar
            a experiência dos seus hóspedes.
          </p>
          <Button type="button" onClick={openLaunchCheckout} className={ctaPrimary}>
            Garantir minha vaga <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
