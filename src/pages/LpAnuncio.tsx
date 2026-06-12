import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  Building2,
  Check,
  ExternalLink,
  Gift,
  Headphones,
  KeyRound,
  Link2,
  Lock,
  MessageCircle,
  MessageCircleQuestion,
  MessageSquare,
  QrCode,
  RefreshCw,
  Rocket,
  Settings as SettingsIcon,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { Seo } from "@/components/Seo";
import mrFlowLogo from "@/assets/mrflow-logo.png";
import denizeAvatar from "@/assets/lp/avatars/denize.webp.asset.json";
import pabloAvatar from "@/assets/lp/avatars/pablo.webp.asset.json";
import julianaAvatar from "@/assets/lp/avatars/juliana.webp.asset.json";
import heroImgAsset from "@/assets/lp/home4.webp.asset.json";
const heroImg = heroImgAsset.url;
import guideMockup from "@/assets/lp/guide-panel-mockup.webp";
import qrFrame from "@/assets/lp/qrcode-frame.webp";
import VideoCriacao from "@/components/lp/VideoCriacao";
import WhatsAppGuideDialog from "@/components/lp/WhatsAppGuideDialog";

const DEMO_URL = "https://hub.mrflow.com.br/g/suite-premium-vila-serena-23515a";
const CYAN = "hsl(186 100% 32%)"; // ciano Mr Flow acessível em fundo claro

const ctaPrimary =
  "h-14 px-7 rounded-2xl bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white font-semibold shadow-[0_10px_30px_-10px_hsl(186_100%_32%/0.5)] text-base";
const ctaSecondary =
  "h-14 px-7 rounded-2xl bg-white border-2 border-[hsl(186_100%_32%)]/30 text-[hsl(186_100%_24%)] hover:bg-[hsl(186_100%_32%)]/5 font-semibold text-base";

function scrollToDemo(e: React.MouseEvent) {
  e.preventDefault();
  document.getElementById("demo")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function LpAnuncio() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Mr Flow Welcome Hub — guia digital para hóspedes",
      url: "https://hub.mrflow.com.br/lp",
      description:
        "Envie Wi-Fi, check-in, regras da casa e dicas locais em um único link bonito para o celular do hóspede.",
      inLanguage: "pt-BR",
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Mr Flow Welcome Hub",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, iOS, Android",
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-slate-900">
      <Seo
        title="Encante seu hóspede com um guia digital em minutos — Mr Flow"
        description="Pare de repetir as mesmas instruções no WhatsApp. Envie Wi-Fi, check-in, regras e dicas em um único link bonito. Crie grátis em menos de 5 minutos."
        path="/lp"
        image="https://hub.mrflow.com.br/og-lp.jpg"
        jsonLd={jsonLd}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FAFAF7]/90 backdrop-blur-md border-b border-slate-200/70">
        <div className="container max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex flex-col items-start gap-0.5">
            <img src={mrFlowLogo} alt="Mr Flow Welcome Hub" className="h-8 w-auto" />
            <span className="text-[9px] tracking-[0.25em] text-slate-500 uppercase">Welcome Hub</span>
          </Link>
          <Button asChild size="sm" variant="ghost" className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl">
            <Link to="/auth">Entrar</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <HeroLp />
        <TrustLogos />
        <RealDemoLight />
        <AntesDepois />
        <Depoimentos />
        <BulletsPro />
        <Beneficios />
        <VideoCriacao />
        <QuemSomos />
        <PlanosSection />
        <Gatilhos />
        <CtaFinal />
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500 px-4">
        © 2026 –{" "}
        <a
          href="http://mrflow.com.br"
          target="_blank"
          rel="noreferrer noopener"
          className="underline hover:text-slate-700"
        >
          Mr. Flow Automações e Serviços Digitais LTDA
        </a>{" "}
        – CNPJ 57.466.519/0001-87
      </footer>
    </div>
  );
}

/* ----------------------------- HERO ----------------------------- */
function HeroLp() {
  const [waOpen, setWaOpen] = useState(false);
  return (

    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(900px 500px at 85% 10%, hsl(186 100% 88% / 0.55), transparent 60%), radial-gradient(700px 400px at 5% 90%, #F3EBDD80, transparent 60%)",
        }}
      />
      <div className="container relative max-w-6xl mx-auto px-5 sm:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
          <div>
            <Badge className="mb-5 bg-white border border-[hsl(186_100%_32%)]/30 text-[hsl(186_100%_24%)] rounded-full px-3 py-1 hover:bg-white">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Para anfitriões Superhost e gestores de temporada
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.08] text-slate-900">
              Pare de responder as mesmas dúvidas no WhatsApp.<br />
              Envie um <span style={{ color: CYAN }}>guia digital completo</span> pro seu hóspede.
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl">
              Wi-Fi, check-in, senha da fechadura, regras da casa, localização e dicas locais em um único link. O hóspede acessa no celular em segundos. Você para de receber mensagem às 23h.
            </p>

            {/* Botões mobile (dentro da coluna). No desktop ficam abaixo do grid. */}
            <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3 lg:hidden">
              <Button asChild className={ctaPrimary}>
                <Link to="/auth">
                  Criar meu guia grátis <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                type="button"
                onClick={() => setWaOpen(true)}
                className="h-14 px-7 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold text-base shadow-[0_10px_30px_-10px_rgba(37,211,102,0.55)]"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Receber Guia no WhatsApp
              </Button>
            </div>
            <p className="mt-4 text-sm text-slate-500 lg:hidden">
              Leva menos de 5 minutos. Não precisa de cartão de crédito.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 lg:hidden">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[hsl(186_100%_32%)]" /> Sem app para o hóspede baixar
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[hsl(186_100%_32%)]" /> Link, QR Code e celular
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[hsl(186_100%_32%)]" /> Atualização em tempo real
              </span>
            </div>
          </div>

          <div className="relative w-full">
            <img
              src={heroImg}
              alt="Hóspede sorrindo olhando o guia digital no celular em apartamento moderno"
              width={1280}
              height={920}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="w-full h-auto object-contain"
            />


            <div className="hidden sm:flex absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-lg ring-1 ring-slate-200 px-4 py-3 items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[hsl(186_100%_94%)] grid place-items-center">
                <Star className="h-5 w-5 text-[hsl(186_100%_32%)]" fill="currentColor" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">+ avaliações 5 estrelas!</div>
                <div className="text-xs text-slate-500">Mais tempo livre e mais tranquilidade</div>
              </div>
            </div>

          </div>
        </div>


        {/* Botões desktop (full-width abaixo do grid hero) */}
        <div className="hidden lg:block mt-12">
          <div className="flex flex-row flex-nowrap gap-3 justify-start">
            <Button asChild className={ctaPrimary}>
              <Link to="/auth">
                Criar meu guia grátis <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              type="button"
              onClick={() => setWaOpen(true)}
              className="h-14 px-7 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold text-base shadow-[0_10px_30px_-10px_rgba(37,211,102,0.55)]"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Receber Guia no WhatsApp
            </Button>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Leva menos de 5 minutos. Não precisa de cartão de crédito.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-[hsl(186_100%_32%)]" /> Sem app para o hóspede baixar
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-[hsl(186_100%_32%)]" /> Link, QR Code e celular
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-[hsl(186_100%_32%)]" /> Atualização em tempo real
            </span>
          </div>
        </div>
      </div>
      <WhatsAppGuideDialog open={waOpen} onOpenChange={setWaOpen} />
    </section>
  );
}

/* ---------------------- ANTES X DEPOIS ---------------------- */
const antes = [
  "Hóspede te acordando às 23h para perguntar a senha do Wi-Fi.",
  "Mensagens perdidas e hóspede esperando do lado de fora do imóvel.",
  "Hóspede ligando estressado e trancando a rua porque não entendeu onde parar o carro.",
  "Responder às mesmas 15 perguntas todos os dias, em vez de focar em crescer o seu negócio.",
  "Perder a nota 5 estrelas no Airbnb por pequenos erros de comunicação na chegada.",
];
const depois = [
  "Wi-Fi disponível no guia 24h por dia — hóspede acessa sozinho sem te incomodar.",
  "Instruções de check-in claras, com fotos e passo a passo, sempre à mão no celular.",
  "Localização, vagas e orientações de estacionamento explicadas com mapa e imagens.",
  "Todas as respostas centralizadas no guia — você ganha tempo pra focar no seu negócio.",
  "Experiência profissional do início ao fim, mais chance de avaliação 5 estrelas.",
];

function AntesDepois() {
  return (
    <section className="py-16 lg:py-24 bg-white border-y border-slate-200/70">
      <div className="container max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
            Seu hóspede não quer procurar informação.{" "}
            <span style={{ color: CYAN }}>Ele quer chegar tranquilo.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Antes */}
          <Card className="p-7 lg:p-8 rounded-3xl bg-[#FAFAF7] border-slate-200 shadow-none">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">Antes</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            <ul className="space-y-3">
              {antes.map((q) => (
                <li
                  key={q}
                  className="flex items-start gap-3 bg-white rounded-2xl px-4 py-3 border border-slate-200/80"
                >
                  <span className="shrink-0 mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100">
                    <X className="h-3.5 w-3.5 text-red-600" strokeWidth={3} />
                  </span>
                  <span className="text-slate-700">"{q}"</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-slate-500">
              Mensagens repetidas todos os dias, em todos os horários.
            </p>
          </Card>

          {/* Depois */}
          <Card className="p-7 lg:p-8 rounded-3xl bg-gradient-to-br from-[hsl(186_100%_96%)] to-[#F3EBDD]/40 border-[hsl(186_100%_32%)]/20">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs font-semibold tracking-wider uppercase text-[hsl(186_100%_24%)]">
                Depois
              </span>
              <span className="h-px flex-1 bg-[hsl(186_100%_32%)]/20" />
            </div>
            <ul className="space-y-3">
              {depois.map((d) => (
                <li
                  key={d}
                  className="flex items-start gap-3 bg-white rounded-2xl px-4 py-3 border border-[hsl(186_100%_32%)]/15 shadow-sm"
                >
                  <span className="shrink-0 mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-3.5 w-3.5 text-green-600" strokeWidth={3} />
                  </span>
                  <span className="text-slate-800 font-medium">{d}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-[hsl(186_100%_24%)]">
              O hóspede acessa tudo em um link, no próprio celular.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- BENEFICIOS ------------------------- */
const beneficios = [
  {
    icon: Link2,
    t: "Um único link para toda a estadia",
    d: "Envie pelo WhatsApp antes do check-in e deixe o hóspede acessar Wi-Fi, regras, localização, senha da fechadura e dicas locais sempre que precisar.",
    bg: "bg-[hsl(186_100%_96%)]",
    ring: "ring-[hsl(186_100%_32%)]/15",
  },
  {
    icon: KeyRound,
    t: "Check-in mais tranquilo",
    d: "Organize horários, instruções de chegada, acesso à fechadura, garagem e regras importantes em uma experiência simples.",
    bg: "bg-[#F3EBDD]/55",
    ring: "ring-[#C9A56A]/25",
  },
  {
    icon: QrCode,
    t: "QR Code pronto para impressão",
    d: "Deixe o guia visível dentro do imóvel para o hóspede acessar durante toda a hospedagem.",
    bg: "bg-[#D8EBD9]/55",
    ring: "ring-[#7BA17F]/25",
  },
  {
    icon: RefreshCw,
    t: "Atualização em tempo real",
    d: "Mudou a senha do Wi-Fi ou alguma regra da casa? Atualize no painel e o guia muda na hora.",
    bg: "bg-[#E2F1F8]/70",
    ring: "ring-[#5DA9D6]/25",
  },
];

function Beneficios() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
            Menos mensagens repetidas. Mais autonomia para o hóspede.{" "}
            <span style={{ color: CYAN }}>Mais chance de avaliação 5 estrelas.</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {beneficios.map((b) => (
            <Card
              key={b.t}
              className={`p-7 rounded-3xl bg-white border-slate-200 ring-1 ${b.ring} shadow-[0_10px_30px_-20px_rgba(15,23,42,0.15)]`}
            >
              <div className={`h-12 w-12 rounded-2xl ${b.bg} grid place-items-center mb-5`}>
                <b.icon className="h-6 w-6 text-[hsl(186_100%_28%)]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{b.t}</h3>
              <p className="text-slate-600 leading-relaxed">{b.d}</p>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className={ctaPrimary}>
            <Link to="/auth">
              Criar meu guia grátis <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild className={ctaSecondary}>
            <a href="#demo" onClick={scrollToDemo}>
              Ver guia demo como hóspede
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ----------------------- DEMO REAL (LIGHT) ----------------------- */
function RealDemoLight() {
  const [ctaOpen, setCtaOpen] = useState(false);
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e?.data && typeof e.data === "object" && (e.data as any).type === "wh_demo_page_closed") {
        setCtaOpen(true);
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);
  return (

    <section
      id="demo"
      className="py-12 lg:py-16 bg-gradient-to-b from-[hsl(186_100%_97%)] via-white to-[#FAF8F2] border-y border-[hsl(186_100%_32%)]/15 scroll-mt-20"
    >
      <div className="container max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[hsl(186_100%_32%)]/10 text-[hsl(186_100%_24%)] border-[hsl(186_100%_32%)]/30 rounded-full hover:bg-[hsl(186_100%_32%)]/10">
            Demo real
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
            Ofereça uma experiência de hotel 5 estrelas no celular do seu hóspede
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Veja abaixo como o seu hóspede recebe todas as informações da sua hospedagem de um jeito lindo, prático e
            interativo.&nbsp;Toque nos botões para testar a demonstração real
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">
              Feito para facilitar sua rotina
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Wi-Fi, check-in, checkout, regras da casa, localização, dicas locais e contatos úteis em uma página
              simples, bonita e sempre atualizada.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Crie o seu em menos de 5 minutos (Zero complicações técnicas).",
                "Seu hóspede acessa por link ou QR Code (sem precisar baixar nenhum aplicativo).",
                "Altere o Wi-Fi ou as regras da casa e atualize no celular do hóspede em tempo real.",
                "Design profissional e totalmente planejado para telas de celular.",
                "Ideal para enviar automaticamente no WhatsApp assim que a reserva for confirmada",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[hsl(186_100%_32%)] shrink-0 mt-0.5" />
                  <span className="text-slate-800">{b}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className={ctaPrimary}>
                <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                  Abrir demo completa <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild className={ctaSecondary}>
                <Link to="/auth">Criar meu guia grátis</Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-tr from-[hsl(186_100%_85%)]/40 via-transparent to-[#F3EBDD]/60 blur-3xl rounded-full pointer-events-none" />
              <div className="relative w-[300px] sm:w-[340px] rounded-[3rem] bg-[#0a0f1c] border-[10px] border-[#1a2236] shadow-[0_30px_80px_-20px_rgba(15,23,42,0.3)] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#0a0f1c] rounded-b-2xl z-10" />
                <div className="relative h-[620px] sm:h-[700px] bg-[#0F172A] overflow-hidden rounded-[2rem]">
                  <iframe
                    src={DEMO_URL}
                    title="Demo Mr Flow Welcome Hub"
                    className="absolute inset-0 w-full h-full"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            <div
              role="status"
              aria-live="polite"
              className={`w-full max-w-[420px] transition-all duration-300 ${
                ctaOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            >
              <div className="relative rounded-2xl bg-white shadow-xl ring-1 ring-[hsl(186_100%_32%)]/25 px-4 py-3 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="h-9 w-9 shrink-0 rounded-xl bg-[hsl(186_100%_94%)] grid place-items-center">
                    <Sparkles className="h-5 w-5 text-[hsl(186_100%_32%)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-semibold text-slate-900">
                      Gostou da facilidade?
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600">
                      Crie um guia igual a este para o seu imóvel.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0">
                  <Button
                    asChild
                    className="h-11 px-5 rounded-xl bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white font-semibold text-sm shadow-[0_10px_25px_-10px_hsl(186_100%_32%/0.6)]"
                  >
                    <Link to="/auth">
                      Criar Meu Guia Grátis <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                  <button
                    type="button"
                    onClick={() => setCtaOpen(false)}
                    aria-label="Fechar"
                    className="h-9 w-9 grid place-items-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* --------------------- BULLETS PROFISSIONAL --------------------- */
const bulletsPro = [
  "Evite mensagens repetidas sobre Wi-Fi, check-in e regras",
  "Entregue uma experiência mais organizada desde antes da chegada",
  "Compartilhe por link, QR Code ou mensagem automática",
  "Atualize informações sem reenviar PDF ou manual",
  "Mostre profissionalismo mesmo tendo poucos imóveis",
];

function BulletsPro() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
              Seu imóvel com aparência de operação profissional —{" "}
              <span style={{ color: CYAN }}>sem depender de suporte técnico</span>
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Crie um guia digital com a identidade da sua hospedagem, publique em poucos minutos e atualize qualquer
              informação em tempo real.
            </p>
            <ul className="mt-7 space-y-3">
              {bulletsPro.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[hsl(186_100%_32%)] shrink-0 mt-1" />
                  <span className="text-slate-800">{b}</span>
                </li>
              ))}
            </ul>
            <p className="mt-7 text-lg font-semibold text-slate-900">
              O hóspede sente organização. Você ganha tempo. A estadia começa melhor.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Button asChild className={ctaPrimary}>
                <Link to="/auth">
                  Criar meu guia grátis <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild className={ctaSecondary}>
                <a href="#demo" onClick={scrollToDemo}>
                  Ver guia demo como hóspede
                </a>
              </Button>
            </div>
          </div>

          <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
            <img
              src={guideMockup}
              alt="Celular sobre mesa de madeira exibindo o guia digital do hóspede"
              width={1280}
              height={960}
              loading="lazy"
              className="rounded-3xl shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] ring-1 ring-slate-200 col-span-2 w-full h-auto object-cover"
            />
            <img
              src={qrFrame}
              alt="QR Code emoldurado na parede de uma casa de temporada"
              width={1024}
              height={1024}
              loading="lazy"
              className="rounded-3xl shadow-[0_20px_50px_-25px_rgba(15,23,42,0.25)] ring-1 ring-slate-200 col-span-2 sm:col-span-1 w-full h-auto object-cover"
            />
            <Card className="col-span-2 sm:col-span-1 rounded-3xl bg-gradient-to-br from-[hsl(186_100%_96%)] to-white border-[hsl(186_100%_32%)]/20 p-6 flex flex-col justify-between">
              <div>
                <div className="h-11 w-11 rounded-2xl bg-white grid place-items-center ring-1 ring-[hsl(186_100%_32%)]/25 mb-3">
                  <Smartphone className="h-5 w-5 text-[hsl(186_100%_28%)]" />
                </div>
                <h4 className="font-semibold text-slate-900">100% mobile-first</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Pensado para o celular do hóspede, sem download de aplicativo.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-2 text-sm text-[hsl(186_100%_24%)] font-medium">
                <ShieldCheck className="h-4 w-4" /> Funciona em qualquer navegador
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- GATILHOS ------------------------- */
const gatilhos = [
  "Não precisa de cartão para começar",
  "Crie seu primeiro hub grátis",
  "Ideal para Airbnb, pousadas e casas de temporada",
  "Funciona por link, QR Code e celular",
  "Sem aplicativo para o hóspede baixar",
];

function Gatilhos() {
  return (
    <section className="py-10 bg-white border-y border-slate-200/70">
      <div className="container max-w-6xl mx-auto px-5 sm:px-8">
        <ul className="flex flex-wrap gap-3 justify-center">
          {gatilhos.map((g) => (
            <li
              key={g}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAFAF7] border border-slate-200 text-sm text-slate-700"
            >
              <Check className="h-4 w-4 text-[hsl(186_100%_32%)]" /> {g}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------- CTA FINAL ------------------------- */
function CtaFinal() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container max-w-5xl mx-auto px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12 lg:p-16 text-center bg-gradient-to-br from-[hsl(186_100%_94%)] via-white to-[#F3EBDD]/70 border border-[hsl(186_100%_32%)]/20 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)]">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[hsl(186_100%_70%)]/25 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#F4C9B8]/40 blur-3xl pointer-events-none" />
          <h2 className="relative text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
            Comece grátis e crie seu primeiro guia em <span style={{ color: CYAN }}>menos de 5 minutos</span>.
          </h2>
          <p className="relative mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Sem cartão. Sem app para o hóspede. Sem complicação. Você cria, compartilha e atualiza quando quiser.
          </p>
          <div className="relative mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className={ctaPrimary}>
              <Link to="/auth">
                Criar meu guia grátis <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild className={ctaSecondary}>
              <a href="#demo" onClick={scrollToDemo}>
                Ver guia demo como hóspede
              </a>
            </Button>
          </div>
          <p className="relative mt-4 text-sm text-slate-500">
            Leva menos de 5 minutos. Não precisa de cartão.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ----------------------- QUEM SOMOS ----------------------- */
const trustBadges = [
  {
    icon: ShieldCheck,
    title: "Infraestrutura Robusta",
    desc: "Seus dados e guias sempre online e rápidos.",
    bg: "bg-[hsl(186_100%_94%)]",
    iconColor: "text-[hsl(186_100%_28%)]",
    ring: "ring-[hsl(186_100%_32%)]/20",
  },
  {
    icon: SettingsIcon,
    title: "Especialistas em Automação",
    desc: "Criado por quem entende de fluxos e mensagens inteligentes.",
    bg: "bg-[#F3EBDD]/70",
    iconColor: "text-[#8a6a35]",
    ring: "ring-[#C9A56A]/30",
  },
  {
    icon: Headphones,
    title: "Suporte Direto via WhatsApp",
    desc: "Teve alguma dúvida? Você fala direto com a nossa equipe pelo WhatsApp para deixar o seu guia rodando perfeitamente, sem burocracia.",
    bg: "bg-[#D8EBD9]/70",
    iconColor: "text-[#3f7a48]",
    ring: "ring-[#7BA17F]/30",
  },
];

function QuemSomos() {
  return (
    <section className="py-16 lg:py-24 bg-white border-y border-slate-200/70">
      <div className="container max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Texto */}
          <div>
            <Badge className="mb-5 bg-white border border-[hsl(186_100%_32%)]/30 text-[hsl(186_100%_24%)] rounded-full px-3 py-1 hover:bg-white">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Quem somos
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
              Quem está por trás do{" "}
              <span style={{ color: CYAN }}>Welcome Hub?</span>
            </h2>
            <p className="mt-5 text-lg text-slate-600 leading-relaxed">
              Conheça a tecnologia feita de anfitrião para anfitrião para transformar a sua rotina.
            </p>

            <div className="mt-7 space-y-5">
              <p className="text-slate-700 leading-relaxed">
                O Welcome Hub nasceu da Mr. Flow, mas a sua verdadeira origem vem do campo de batalha. Como anfitrião, eu vivencio exatamente o mesmo dia a dia que você: a exaustão de responder às mesmas perguntas, o estresse de check-ins desorganizados tarde da noite e a eterna busca pela avaliação 5 estrelas.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Sabendo como funciona a rotina de quem gerencia propriedades na pele, desenvolvemos essa solução para ser o fim definitivo do trabalho manual. Unimos a nossa especialidade técnica em automação com a vivência prática de quem sabe o valor de cada minuto livre.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Nossa missão é colocar um guia digital interativo e inteligente para trabalhar por você 24 horas por dia. Assim, você recupera a sua paz e o seu tempo enquanto seus hóspedes desfrutam de uma recepção padrão hotelaria de luxo.
              </p>
            </div>
          </div>

          {/* Visual */}
          <div className="relative order-first lg:order-last">
            <div className="absolute -inset-6 bg-gradient-to-tr from-[hsl(186_100%_85%)]/40 via-white/0 to-[#F3EBDD]/70 rounded-[2.5rem] blur-3xl pointer-events-none" />
            <div className="relative rounded-[2rem] bg-gradient-to-br from-[hsl(186_100%_96%)] via-white to-[#F3EBDD]/40 border border-[hsl(186_100%_32%)]/20 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] p-10 lg:p-12 flex flex-col items-center text-center">
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[hsl(186_100%_70%)]/25 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[#F4C9B8]/40 blur-3xl pointer-events-none" />

              <div className="relative bg-white rounded-3xl shadow-[0_20px_50px_-25px_rgba(15,23,42,0.25)] ring-1 ring-slate-200 px-8 py-7 mb-6">
                <img src={mrFlowLogo} alt="Mr. Flow" className="h-12 w-auto" />
              </div>
              <p className="relative text-sm font-semibold tracking-[0.25em] uppercase text-[hsl(186_100%_24%)]">
                Tecnologia &amp; Automação
              </p>
              <p className="relative mt-2 text-slate-600 leading-relaxed max-w-xs">
                Plataforma brasileira focada em hospedagem, com olhar de quem vive a rotina do anfitrião.
              </p>

              <div className="relative mt-7 flex flex-wrap gap-3 justify-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[hsl(186_100%_32%)]/20 text-xs font-medium text-[hsl(186_100%_24%)]">
                  <Check className="h-3.5 w-3.5" /> Hospedagem
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[hsl(186_100%_32%)]/20 text-xs font-medium text-[hsl(186_100%_24%)]">
                  <Check className="h-3.5 w-3.5" /> Turismo
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[hsl(186_100%_32%)]/20 text-xs font-medium text-[hsl(186_100%_24%)]">
                  <Check className="h-3.5 w-3.5" /> Automação
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Selos de confiança */}
        <div className="mt-14 lg:mt-16 grid sm:grid-cols-3 gap-5">
          {trustBadges.map((b) => (
            <Card
              key={b.title}
              className={`p-6 rounded-3xl bg-white border-slate-200 ring-1 ${b.ring} shadow-[0_10px_30px_-20px_rgba(15,23,42,0.15)]`}
            >
              <div className={`h-12 w-12 rounded-2xl ${b.bg} grid place-items-center mb-4`}>
                <b.icon className={`h-6 w-6 ${b.iconColor}`} />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1.5">{b.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{b.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- PLANOS ----------------------------- */
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

type Interval = "month" | "year";

function PlanosSection() {
  const [interval, setInterval] = useState<Interval>("month");

  const yearlyDiscount = (monthly: number, yearly: number) =>
    monthly > 0 ? Math.round((1 - yearly / (monthly * 12)) * 100) : 0;

  return (
    <section
      id="planos"
      className="relative bg-[#FAFAF7] text-slate-900 border-y border-slate-200/70"
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

        {/* Bônus exclusivos */}
        <div className="mt-16 space-y-8">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Criando seu guia digital hoje, você ganha 2 bônus exclusivos:
            </h3>
            <p className="text-sm sm:text-base text-slate-600">
              Incentivos especiais para profissionalizar sua hospedagem ainda esta semana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: MessageSquare,
                title: "🎁 Bônus 1: Script de Mensagens Prontas para WhatsApp",
                desc: "Chega de pensar no que escrever. Copie e cole modelos exatos de mensagens de boas-vindas, pré-check-in, regras finas e pedido de avaliação 5 estrelas que geram a melhor experiência para o hóspede.",
                from: "R$ 47,00",
              },
              {
                icon: Zap,
                title: "🎁 Bônus 2: Guia Prático de Automação para Anfitriões",
                desc: "Um material digital passo a passo ensinando como usar o WhatsApp de forma inteligente na sua operação de temporada, economizar horas de suporte manual e fechar mais reservas diretas.",
                from: "R$ 97,00",
              },
            ].map((b) => (
              <Card
                key={b.title}
                className="p-6 rounded-2xl border-2 border-[hsl(186_100%_32%)]/25 bg-gradient-to-br from-white to-[hsl(186_100%_32%)]/5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)] flex flex-col gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-[hsl(186_100%_32%)]/10 grid place-items-center shrink-0">
                    <b.icon className="h-5 w-5 text-[hsl(186_100%_24%)]" />
                  </div>
                  <h4 className="font-semibold text-base sm:text-lg leading-snug text-slate-900">
                    {b.title}
                  </h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{b.desc}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 line-through">De {b.from}</span>
                  <Badge className="bg-[hsl(186_100%_32%)] text-white hover:bg-[hsl(186_100%_32%)]">
                    por R$ 0,00
                  </Badge>
                </div>
                <Button
                  asChild
                  className="mt-auto w-full h-12 rounded-xl font-semibold bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white"
                >
                  <Link to="/auth">Criar Meu Guia Grátis</Link>
                </Button>
              </Card>
            ))}
          </div>

          <Card className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-4 max-w-4xl mx-auto">
            <div className="h-11 w-11 rounded-xl bg-white border border-slate-200 grid place-items-center shrink-0">
              <Lock className="h-5 w-5 text-[hsl(186_100%_24%)]" />
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-slate-700">
              <span className="font-semibold text-slate-900">🔒 Risco Zero para começar:</span>{" "}
              Crie sua conta no Plano Single e aproveite 30 dias totalmente grátis com todas as
              funcionalidades liberadas. Sem pegadinhas, sem contratos e sem precisar de cartão de
              crédito no cadastro. Se sua operação crescer e você precisar de mais imóveis, mude
              de plano quando quiser.
            </p>
          </Card>
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

// ============================ TRUST LOGOS ============================
import airbnbLogo from "@/assets/lp/logos/airbnb.webp.asset.json";
import bookingLogo from "@/assets/lp/logos/booking.webp.asset.json";
import tripadvisorLogo from "@/assets/lp/logos/tripadvisor.webp.asset.json";
import vrboLogo from "@/assets/lp/logos/vrbo.webp.asset.json";
import staysLogo from "@/assets/lp/logos/stays.webp.asset.json";
import hostawayLogo from "@/assets/lp/logos/hostaway.webp.asset.json";
import omnibeesLogo from "@/assets/lp/logos/omnibees.webp.asset.json";
import hospedinLogo from "@/assets/lp/logos/hospedin.webp.asset.json";

function TrustLogos() {
  const logos = [
    { name: "Airbnb", src: airbnbLogo.url },
    { name: "Booking.com", src: bookingLogo.url },
    { name: "Tripadvisor", src: tripadvisorLogo.url },
    { name: "Vrbo", src: vrboLogo.url },
    { name: "Stays", src: staysLogo.url },
    { name: "Hostaway", src: hostawayLogo.url },
    { name: "Omnibees", src: omnibeesLogo.url },
    { name: "Hospedin", src: hospedinLogo.url },
  ];
  const track = [...logos, ...logos];

  return (
    <section className="py-8 lg:py-10 bg-gray-50/80 border-y border-slate-200/60 overflow-hidden">
      <style>{`
        @keyframes mrflow-logos-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .mrflow-logos-track {
          animation: mrflow-logos-scroll 40s linear infinite;
        }
        .mrflow-logos-mask {
          mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
        }
      `}</style>

      <div className="container mx-auto px-4">
        <p className="text-center text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-slate-500 mb-6">
          O complemento perfeito para anfitriões de destaque no:
        </p>
      </div>

      <div className="mrflow-logos-mask">
        <div className="mrflow-logos-track flex w-max items-center gap-8 lg:gap-12 hover:[animation-play-state:paused]">
          {track.map((logo, i) => (
            <img
              key={`${logo.name}-${i}`}
              src={logo.src}
              alt={logo.name}
              loading="lazy"
              decoding="async"
              width={96}
              height={96}
              className="h-16 sm:h-20 lg:h-24 w-auto object-contain grayscale opacity-60 hover:opacity-100 transition-opacity duration-200 shrink-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
}



// ============================ DEPOIMENTOS ============================
function Depoimentos() {
  const items = [
    {
      photo: denizeAvatar.url,
      name: "Denize Siqueira",
      meta: "Casa da Dinda • Rio de Janeiro - RJ",
      text:
        "Eu não aguentava mais ir jantar com meu esposo na sexta-feira e passar o tempo todo respondendo no WhatsApp sobre a senha do Wi-Fi ou regras do imóvel. Com o Welcome Hub, eu programo o envio do link e pronto. Recuperei minha paz e meu tempo livre.",
    },
    {
      photo: julianaAvatar.url,
      name: "Juliana Medeiros",
      meta: "Paracuru - CE",
      text:
        "Gerenciar os check-ins da pousada sempre foi exaustivo por conta das dúvidas repetidas. Com o guia interativo, os hóspedes têm total autonomia. Eles chegam sabendo exatamente o que fazer e nossas avaliações 5 estrelas dispararam nas plataformas.",
    },
    {
      photo: pabloAvatar.url,
      name: "Pablo da Costa",
      meta: "Sítio Vidamare • Nova Friburgo - RJ",
      text:
        "Antes eu mandava um bloco enorme de texto com as instruções que os hóspedes ignoravam e acabavam me ligando de madrugada. O hub no celular é tão simples e visual que o suporte manual virou praticamente zero.",
    },
  ];
  return (
    <section className="py-16 lg:py-24 bg-slate-50/60">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <Badge variant="secondary" className="mb-4 bg-[hsl(186_100%_32%)]/10 text-[hsl(186_100%_24%)] border-0">
            <Star className="h-3.5 w-3.5 mr-1.5 fill-current" /> Prova social
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            O que dizem os anfitriões que usam o Welcome Hub
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {items.map((t) => (
            <Card
              key={t.name}
              className="p-6 lg:p-7 rounded-2xl bg-white border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={t.photo}
                  alt={t.name}
                  loading="lazy"
                  decoding="async"
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{t.name}</p>
                  <p className="text-xs text-slate-500 truncate">{t.meta}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3" aria-label="5 estrelas">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-[15px] leading-relaxed">"{t.text}"</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
