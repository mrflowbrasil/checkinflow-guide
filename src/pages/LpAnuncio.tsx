import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Check,
  ExternalLink,
  MessageCircleQuestion,
  Sparkles,
  Link2,
  KeyRound,
  QrCode,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { Seo } from "@/components/Seo";
import mrFlowLogo from "@/assets/mrflow-logo.png";
import heroImg from "@/assets/lp/hero-guest-phone.jpg";
import guideMockup from "@/assets/lp/guide-panel-mockup.webp";
import qrFrame from "@/assets/lp/qrcode-frame.webp";

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
        <AntesDepois />
        <Beneficios />
        <RealDemoLight />
        <BulletsPro />
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
              <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Guia digital para Airbnb, pousadas e casas de temporada
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.08] text-slate-900">
              Pare de responder as mesmas dúvidas no WhatsApp.{" "}
              Envie um <span style={{ color: CYAN }}>guia digital completo</span> pro seu hóspede.
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl">
              Wi-Fi, check-in, senha da fechadura, regras da casa, localização e dicas locais em um único link. Lindo,
              profissional e fácil de acessar pelo celular.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild className={ctaPrimary}>
                <Link to="/auth">
                  Criar meu guia grátis <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild className={ctaSecondary}>
                <a href="#demo" onClick={scrollToDemo}>
                  Ver como o hóspede acessa
                </a>
              </Button>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Leva menos de 5 minutos. Não precisa de cartão de crédito.
            </p>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
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

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-[hsl(186_100%_85%)]/40 via-white/0 to-[#F3EBDD]/60 rounded-[2.5rem] blur-2xl pointer-events-none" />
            <div className="relative rounded-[2rem] overflow-hidden shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] ring-1 ring-slate-200">
              <img
                src={heroImg}
                alt="Hóspede sorrindo olhando o guia digital no celular em apartamento moderno"
                width={1536}
                height={1024}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-lg ring-1 ring-slate-200 px-4 py-3 items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[hsl(186_100%_94%)] grid place-items-center">
                <Star className="h-5 w-5 text-[hsl(186_100%_32%)]" fill="currentColor" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">+ avaliações 5 estrelas</div>
                <div className="text-xs text-slate-500">menos dúvidas, mais autonomia</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------- ANTES X DEPOIS ---------------------- */
const antes = [
  "Qual a senha do Wi-Fi?",
  "Como faço check-in?",
  "Onde estaciona?",
  "Pode receber visita?",
  "Qual o horário do checkout?",
];
const depois = [
  "Tudo em um único link",
  "Informações organizadas no celular",
  "Menos mensagens repetidas",
  "Check-in mais tranquilo",
  "Experiência mais profissional",
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
  return (
    <section
      id="demo"
      className="py-16 lg:py-24 bg-white border-y border-slate-200/70 scroll-mt-20"
    >
      <div className="container max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[hsl(186_100%_32%)]/10 text-[hsl(186_100%_24%)] border-[hsl(186_100%_32%)]/30 rounded-full hover:bg-[hsl(186_100%_32%)]/10">
            Demo real
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
            Veja como seu hóspede vai receber o guia
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Esta é uma propriedade demonstrativa criada no Mr Flow Welcome Hub. Navegue como se fosse um hóspede
            acessando pelo celular.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">
              Uma experiência real, direto no celular do hóspede
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Wi-Fi, check-in, checkout, regras da casa, localização, dicas locais e contatos úteis em uma página
              simples, bonita e sempre atualizada.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Navegação igual à do hóspede",
                "Acesso por link ou QR Code",
                "Conteúdo atualizado em tempo real",
                "Experiência mobile-first",
                "Ideal para enviar antes da chegada",
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

          <div className="flex justify-center">
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
