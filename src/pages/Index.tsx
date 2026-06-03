import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  QrCode,
  Smartphone,
  ArrowRight,
  Check,
  Building2,
  Gift,
  MessageCircle,
  Headphones,
  Rocket,
  Settings as SettingsIcon,
  TrendingUp,
} from "lucide-react";
import mrFlowLogoWhite from "@/assets/mrflow-logo-white.png";
import mockupHome from "@/assets/mockup-home-light.webp";
import ShaderBackground from "@/components/ui/shader-background";
import { Seo } from "@/components/Seo";

const HERO_BG = {
  background:
    "radial-gradient(1200px 600px at 20% 10%, rgba(0,255,255,0.15), transparent 60%), radial-gradient(900px 500px at 80% 90%, rgba(0,140,142,0.25), transparent 60%), linear-gradient(135deg, #020617 0%, #0a1f2e 50%, #062a33 100%)",
};

const CYAN = "hsl(186 100% 32%)";
const ENTERPRISE_WHATSAPP = "5521996507509";

type LpPlan = {
  code: "free" | "starter" | "pro" | "business" | "enterprise";
  name: string;
  description: string;
  property_limit: number;
  price_cents: number;
  price_yearly_cents: number;
};

const LP_PLANS: LpPlan[] = [
  { code: "free", name: "Single", description: "Para quem está começando com 1 imóvel.", property_limit: 1, price_cents: 890, price_yearly_cents: 8900 },
  { code: "starter", name: "Starter", description: "Para anfitriões com até 5 imóveis.", property_limit: 5, price_cents: 2990, price_yearly_cents: 29900 },
  { code: "pro", name: "Pro", description: "Para operações que querem escalar com identidade.", property_limit: 20, price_cents: 8990, price_yearly_cents: 89900 },
  { code: "business", name: "Business", description: "Para administradoras e portfólios maiores.", property_limit: 50, price_cents: 19990, price_yearly_cents: 199000 },
  { code: "enterprise", name: "Enterprise", description: "Para grandes operações com necessidades específicas.", property_limit: 999999, price_cents: 0, price_yearly_cents: 0 },
];

const LP_PLAN_FEATURES: Record<LpPlan["code"], string[]> = {
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
    "Até 50 imóveis",
    "Guias personalizáveis",
    "15 templates premium",
    "Logo personalizada no guia",
    "URL rotativa",
    "Integração nativa Stays e Hostaway",
  ],
  enterprise: [],
};

const ENTERPRISE_BENEFITS = [
  { icon: Headphones, label: "Suporte prioritário dedicado" },
  { icon: Rocket, label: "Onboarding assistido" },
  { icon: SettingsIcon, label: "Condições e SLA personalizados" },
  { icon: TrendingUp, label: "Escalabilidade ilimitada" },
];

const formatBRL = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col text-white relative" style={HERO_BG}>
      <Seo
        title="Mr Flow • Welcome Hub — Guia digital para anfitriões"
        description="Crie um Hub de Boas Vindas digital para o seu imóvel de temporada. Encante hóspedes com check-in, regras, dicas locais e QR Code próprio."
        path="/welcome-hub"
      />
      <ShaderBackground className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-75" />
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#020617]/40 border-b border-white/10">
        <div className="container px-6 sm:px-10 lg:px-20 xl:px-32 flex items-center justify-between h-16">
          <Link to="/" className="flex flex-col items-start gap-0.5">
            <img src={mrFlowLogoWhite} alt="Mr Flow" className="h-8 w-auto" />
            <span className="text-[9px] tracking-[0.25em] text-white/70 uppercase">Welcome Hub</span>
          </Link>
          <Button
            asChild
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl backdrop-blur"
          >
            <Link to="/auth">Entrar</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 container px-6 sm:px-10 lg:px-20 xl:px-32 py-16 lg:py-24">
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs font-medium">
            <Sparkles className="h-3 w-3" style={{ color: "#00FFFF" }} /> Guias digitais para temporada
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="text-center lg:text-left max-w-xl mx-auto lg:mx-0">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.05] text-white">
              Hub de Boas Vindas{" "}
              <span style={{ color: "#00FFFF" }}>Inteligente</span>
            </h1>
            <p
              className="text-lg leading-relaxed mb-3"
              style={{ color: "#00FF00" }}
            >
              Transforme a estadia do seu hóspede em uma experiência incrível!
            </p>
            <p className="text-sm mb-8" style={{ color: "#ffffff" }}>
              Encante desde o primeiro momento com um guia digital completo
            </p>
            <div className="flex justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg"
              >
                <Link to="/auth">
                  Começar grátis <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <img
              src={mockupHome}
              alt="Mockup do Hub de Boas Vindas em smartphones"
              className="w-full max-w-md h-auto will-change-transform transition-transform duration-500 ease-out hover:scale-105"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-24 grid gap-6 md:grid-cols-3 mx-auto">
        {[
          { icon: Smartphone, title: "Mobile-first", desc: "Pensado para o hóspede acessar do celular, com botões grandes e navegação simples." },
          { icon: Sparkles, title: "Editor por blocos", desc: "Texto, vídeo, imagem, passo-a-passo, dicas. Reordene tudo arrastando." },
          { icon: QrCode, title: "QR Code automático", desc: "Cada imóvel ganha um link e um QR Code para imprimir e deixar no apartamento." },
        ].map((f) => (
          <div
            key={f.title}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/[0.07] transition-colors"
          >
            <div
              className="h-10 w-10 rounded-lg grid place-items-center mb-4"
              style={{ backgroundColor: "rgba(0,255,255,0.12)", color: "#00FFFF" }}
            >
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold mb-2 text-white">{f.title}</h3>
            <p className="text-sm text-white/70">{f.desc}</p>
          </div>
        ))}
      </section>

      <PlanosSection />

      <footer className="mt-auto border-t border-white/10 py-8 text-center text-xs text-white/50 px-4">
        © 2026 –{" "}
        <a
          href="http://mrflow.com.br"
          target="_blank"
          rel="noreferrer noopener"
          className="underline hover:text-white/80"
        >
          Mr. Flow Automações e Serviços Digitais LTDA
        </a>{" "}
        – CNPJ 57.466.519/0001-87 – Todos os direitos reservados.
      </footer>
    </div>
  );
};

/* ----------------------------- PLANOS ----------------------------- */
type Interval = "month" | "year";

function PlanosSection() {
  const [interval, setInterval] = useState<Interval>("month");

  const yearlyDiscount = (monthly: number, yearly: number) =>
    monthly > 0 ? Math.round((1 - yearly / (monthly * 12)) * 100) : 0;

  return (
    <section
      id="planos"
      className="relative z-10 bg-[#FAFAF7] text-slate-900 border-y border-white/10"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(900px 500px at 85% 10%, hsl(186 100% 88% / 0.45), transparent 60%), radial-gradient(700px 400px at 5% 90%, #F3EBDD80, transparent 60%)",
        }}
      />
      <div className="relative container max-w-6xl mx-auto px-5 sm:px-8 py-20 lg:py-28">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge className="mb-5 bg-white border border-[hsl(186_100%_32%)]/30 text-[hsl(186_100%_24%)] rounded-full px-3 py-1 hover:bg-white">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Planos
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold tracking-tight leading-[1.1] text-slate-900">
            Mais paz para você. Mais clareza para o hóspede.{" "}
            <span style={{ color: CYAN }}>Por menos que um cafezinho por imóvel.</span>
          </h2>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed">
            Comece com 30 dias grátis, sem cartão de crédito. Teste sem
            compromisso e continue apenas se fizer sentido para sua operação.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-10">
          <Tabs value={interval} onValueChange={(v) => setInterval(v as Interval)}>
            <TabsList className="bg-white border border-slate-200 rounded-full p-1 h-auto">
              <TabsTrigger
                value="month"
                className="rounded-full px-5 py-2 data-[state=active]:bg-[hsl(186_100%_32%)] data-[state=active]:text-white text-slate-700"
              >
                Mensal
              </TabsTrigger>
              <TabsTrigger
                value="year"
                className="rounded-full px-5 py-2 data-[state=active]:bg-[hsl(186_100%_32%)] data-[state=active]:text-white text-slate-700"
              >
                Anual
                <Badge className="ml-2 bg-[hsl(186_100%_94%)] text-[hsl(186_100%_24%)] border-0 hover:bg-[hsl(186_100%_94%)]">
                  −17%
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {LP_PLANS.map((plan) => {
            const isEnterprise = plan.code === "enterprise";
            const isSingle = plan.code === "free";
            const isHighlighted = plan.code === "pro";

            const cents = interval === "month" ? plan.price_cents : plan.price_yearly_cents;
            const discount = yearlyDiscount(plan.price_cents, plan.price_yearly_cents);
            const monthlyEquivalent =
              interval === "year" && plan.price_yearly_cents > 0
                ? plan.price_yearly_cents / 12
                : null;

            const perPropertyCents = (() => {
              if (isEnterprise || isSingle) return null;
              if (!plan.property_limit || plan.property_limit < 1) return null;
              const baseCents =
                interval === "year" && plan.price_yearly_cents > 0
                  ? plan.price_yearly_cents / 12
                  : plan.price_cents;
              return Math.round(baseCents / plan.property_limit);
            })();

            if (isEnterprise) {
              return (
                <Card
                  key={plan.code}
                  className="p-6 flex flex-col relative rounded-2xl bg-gradient-to-br from-white via-white to-[hsl(186_100%_94%)]/40 border border-[hsl(186_100%_32%)]/30 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)] overflow-hidden"
                >
                  <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[hsl(186_100%_32%)]/10 blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-9 w-9 rounded-lg bg-[hsl(186_100%_94%)] grid place-items-center">
                      <Building2 className="h-5 w-5 text-[hsl(186_100%_32%)]" />
                    </div>
                    <h3 className="font-semibold text-lg text-slate-900">{plan.name}</h3>
                  </div>
                  <p className="text-xs text-slate-600 min-h-[2.5em] mb-4">{plan.description}</p>

                  <div className="mb-5 space-y-1">
                    <div className="text-3xl font-bold tracking-tight text-slate-900">Sob consulta</div>
                    <div className="text-xs text-slate-500">
                      Planos personalizados para grandes operações
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-sm mb-6 flex-1">
                    {ENTERPRISE_BENEFITS.map(({ icon: Icon, label }) => (
                      <li key={label} className="flex items-start gap-2 text-slate-700">
                        <Icon className="h-4 w-4 text-[hsl(186_100%_32%)] mt-0.5 shrink-0" />
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className="w-full h-12 rounded-xl bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white font-semibold"
                  >
                    <a
                      href={`https://wa.me/${ENTERPRISE_WHATSAPP}?text=${encodeURIComponent(
                        "Olá! Tenho interesse no plano Enterprise do MrFlow."
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Falar com comercial
                    </a>
                  </Button>
                </Card>
              );
            }

            return (
              <Card
                key={plan.code}
                className={`p-6 flex flex-col relative rounded-2xl bg-white border ${
                  isHighlighted
                    ? "border-[hsl(186_100%_32%)] ring-2 ring-[hsl(186_100%_32%)]/20 shadow-[0_25px_70px_-25px_hsl(186_100%_32%/0.45)]"
                    : "border-slate-200 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)]"
                }`}
              >
                {isHighlighted && (
                  <Badge className="absolute -top-2 right-4 bg-[hsl(186_100%_32%)] text-white hover:bg-[hsl(186_100%_32%)]">
                    <Sparkles className="h-3 w-3 mr-1" /> Mais popular
                  </Badge>
                )}
                {isSingle && (
                  <Badge className="absolute -top-2 right-4 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-100">
                    <Gift className="h-3 w-3 mr-1" /> 30 dias grátis
                  </Badge>
                )}

                <div className="space-y-1 mb-4">
                  <h3 className="font-semibold text-lg text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-600 min-h-[2.5em]">{plan.description}</p>
                </div>

                <div className="mb-5 space-y-1">
                  <div className="text-3xl font-bold tracking-tight text-slate-900">
                    {formatBRL(cents)}
                    <span className="text-sm font-normal text-slate-500">
                      /{interval === "month" ? "mês" : "ano"}
                    </span>
                  </div>
                  {monthlyEquivalent !== null && (
                    <div className="text-xs text-slate-500">
                      Equivalente a {formatBRL(monthlyEquivalent)}/mês
                    </div>
                  )}
                  {interval === "year" && discount > 0 && (
                    <div className="text-xs text-[hsl(186_100%_24%)] font-medium">
                      Economize {discount}% no anual
                    </div>
                  )}
                  {perPropertyCents !== null && (
                    <div className="text-xs text-slate-500 pt-1">
                      {formatBRL(perPropertyCents)} por imóvel
                    </div>
                  )}
                  {isSingle && (
                    <div className="text-xs text-slate-500 pt-1">Após o período de teste</div>
                  )}
                </div>

                <ul className="space-y-2 text-sm mb-6 flex-1">
                  {LP_PLAN_FEATURES[plan.code].map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-slate-700">
                      <Check className="h-4 w-4 text-[hsl(186_100%_32%)] mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`w-full h-12 rounded-xl font-semibold ${
                    isHighlighted
                      ? "bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white"
                      : "bg-white border-2 border-[hsl(186_100%_32%)]/30 text-[hsl(186_100%_24%)] hover:bg-[hsl(186_100%_32%)]/5"
                  }`}
                >
                  <Link to="/auth">{isSingle ? "Começar grátis" : "Assinar"}</Link>
                </Button>
              </Card>
            );
          })}
        </div>

        <p className="text-xs text-slate-500 text-center mt-10 max-w-2xl mx-auto">
          Pagamentos processados com segurança via Stripe. Cancele a qualquer
          momento — você mantém acesso até o fim do período pago. Notas fiscais
          são emitidas após o processamento do pagamento.
        </p>
      </div>
    </section>
  );
}

export default Index;
