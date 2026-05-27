import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Wifi, KeyRound, MapPin, BookOpen, Sparkles, Star, QrCode, Smartphone,
  Menu, X, ArrowRight, ExternalLink, MessageSquare, Layers, Palette,
  Languages, Building2, Hotel, Home, Briefcase, Network, Zap, Database,
  Workflow, ShieldCheck, RefreshCw, Image as ImageIcon, FileText, Check,
  ChevronRight, Phone, Star as StarIcon, Settings2, Globe, Users, Edit3,
} from "lucide-react";
import { Seo } from "@/components/Seo";
import { MrFlowLogo } from "@/components/brand/MrFlowLogo";
import ShaderBackground from "@/components/ui/shader-background";
import phoneMockup from "@/assets/welcome-hub-phone-mockup.webp";
import { StickyFeatureSection } from "@/components/ui/sticky-scroll-cards-section";

const DEMO_URL = "https://hub.mrflow.com.br/g/suite-premium-vila-serena-23515a";

// Ajuste manual: largura máxima do mockup do celular no hero (ex.: "360px", "420px", "80%")
const PHONE_MOCKUP_MAX_WIDTH = "320px";

const PAGE_BG = {
  background:
    "radial-gradient(1200px 600px at 15% 5%, rgba(0,255,255,0.10), transparent 60%), radial-gradient(900px 500px at 85% 95%, rgba(0,255,0,0.08), transparent 60%), linear-gradient(180deg, #020617 0%, #0F172A 100%)",
};

const navItems = [
  { label: "Benefícios", href: "#beneficios" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Recursos", href: "#recursos" },
  { label: "Planos", href: "#planos" },
  { label: "FAQ", href: "#faq" },
];

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#020617]/70 border-b border-[rgba(148,163,184,0.20)]">
      <div className="container px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between">
        <a href="#top" className="flex flex-col items-start leading-none group">
          <MrFlowLogo forceDark className="h-9 w-auto" />
          <span className="mt-1 text-[9px] tracking-[0.25em] text-[#CBD5E1] uppercase">Welcome Hub</span>
        </a>

        <nav className="hidden lg:flex items-center gap-7">
          {navItems.map((i) => (
            <a key={i.href} href={i.href} className="text-sm text-[#CBD5E1] hover:text-[#00FFFF] transition-colors">
              {i.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button asChild variant="ghost" className="text-[#CBD5E1] hover:text-white hover:bg-white/5">
            <a href="#demo">Ver demo</a>
          </Button>
          <Button asChild className="bg-[#00FFFF] text-[#020617] hover:bg-[#00FFFF]/90 font-semibold rounded-xl">
            <Link to="/auth">Criar meu hub grátis</Link>
          </Button>
        </div>

        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label="Abrir menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-[rgba(148,163,184,0.20)] bg-[#020617]/95 backdrop-blur-xl">
          <div className="container px-4 py-4 flex flex-col gap-3">
            {navItems.map((i) => (
              <a
                key={i.href}
                href={i.href}
                onClick={() => setOpen(false)}
                className="text-sm text-[#CBD5E1] py-2"
              >
                {i.label}
              </a>
            ))}
            <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white">
              <a href="#demo" onClick={() => setOpen(false)}>Ver demo</a>
            </Button>
            <Button asChild className="bg-[#00FFFF] text-[#020617] hover:bg-[#00FFFF]/90 font-semibold">
              <Link to="/auth">Criar meu hub grátis</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

function PhoneMockup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative mx-auto ${className}`}>
      <div className="absolute -inset-6 bg-gradient-to-tr from-[#00FFFF]/20 via-transparent to-[#00FF00]/20 blur-3xl rounded-full pointer-events-none" />
      <div className="relative w-[300px] sm:w-[340px] aspect-[9/19] rounded-[3rem] bg-[#0a0f1c] border-[10px] border-[#1a2236] shadow-[0_30px_80px_-20px_rgba(0,255,255,0.25)] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#0a0f1c] rounded-b-2xl z-10" />
        <div className="absolute inset-0 overflow-hidden rounded-[2rem]">{children}</div>
      </div>
    </div>
  );
}

function HeroMockupContent() {
  const tiles = [
    { i: MapPin, t: "Como chegar" },
    { i: KeyRound, t: "Check-in" },
    { i: Wifi, t: "Wi-Fi" },
    { i: BookOpen, t: "Regras" },
    { i: Sparkles, t: "Dicas" },
    { i: Star, t: "Avaliação" },
  ];
  return (
    <div className="h-full w-full bg-gradient-to-b from-[#0F172A] to-[#020617] text-white flex flex-col">
      <div className="h-28 bg-gradient-to-br from-[#00FFFF]/40 to-[#00FF00]/30 relative">
        <div className="absolute bottom-2 left-3 right-3">
          <div className="text-[10px] tracking-widest uppercase text-white/80">Hub de Boas Vindas</div>
          <div className="text-sm font-semibold">Suíte Premium · Vila Serena</div>
        </div>
      </div>
      <div className="p-3 grid grid-cols-3 gap-2 flex-1">
        {tiles.map(({ i: Icon, t }) => (
          <div key={t} className="rounded-xl bg-white/5 border border-white/10 p-2 flex flex-col items-center justify-center gap-1">
            <Icon className="h-4 w-4 text-[#00FFFF]" />
            <span className="text-[9px] text-[#CBD5E1] text-center leading-tight">{t}</span>
          </div>
        ))}
      </div>
      <div className="p-3">
        <div className="rounded-xl bg-gradient-to-r from-[#00FFFF] to-[#00FF00] text-[#020617] text-[10px] font-semibold py-2 text-center">
          Avaliar a estadia
        </div>
      </div>
    </div>
  );
}

function FloatingChip({ icon: Icon, label, className = "" }: { icon: any; label: string; className?: string }) {
  return (
    <div className={`hidden md:flex absolute items-center gap-2 px-3 py-2 rounded-2xl bg-[#111827]/80 border border-[rgba(148,163,184,0.20)] backdrop-blur-md shadow-xl text-xs text-[#F8FAFC] ${className}`}>
      <Icon className="h-3.5 w-3.5 text-[#00FFFF]" />
      {label}
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
      <div className="container px-4 sm:px-6 lg:px-12 grid lg:grid-cols-2 gap-14 items-center">
        <div className="space-y-7 text-center lg:text-left">
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            {["Guia digital para hóspedes", "Acesso por QR Code", "Mobile-first", "Sem instalar app"].map((b) => (
              <Badge key={b} variant="outline" className="border-[rgba(148,163,184,0.30)] bg-white/5 text-[#CBD5E1] rounded-full px-3 py-1 text-[11px] font-medium">
                {b}
              </Badge>
            ))}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-[#F8FAFC]">
            Transforme cada estadia em uma{" "}
            <span className="text-[#00FF00]">
              experiência digital
            </span>{" "}
            de boas-vindas
          </h1>
          <p className="text-lg text-[#CBD5E1] leading-relaxed max-w-xl mx-auto lg:mx-0">
            Crie um hub personalizado para seus hóspedes acessarem pelo celular, com QR Code, link, instruções da hospedagem, dicas locais e tudo que eles precisam saber — sem depender de PDFs ou mensagens repetidas no WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Button asChild size="lg" className="h-12 px-8 rounded-xl bg-[#00FFFF] text-[#020617] hover:bg-[#00FFFF]/90 font-semibold shadow-lg shadow-[#00FFFF]/20">
              <Link to="/auth">Criar meu primeiro hub grátis <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 rounded-xl bg-white/5 border-[rgba(148,163,184,0.30)] text-white hover:bg-white/10">
              <a href="#demo">Ver demo real</a>
            </Button>
          </div>
        </div>

        <div className="relative flex justify-center items-center min-h-[560px]">
          <div className="absolute -inset-10 bg-gradient-to-tr from-[#00FFFF]/25 via-transparent to-[#00FFFF]/10 blur-3xl rounded-full pointer-events-none" />
          <img
            src={phoneMockup}
            alt="Mockup do celular exibindo um hub de boas-vindas Mr Flow"
            className="relative z-0 w-full h-auto mx-auto drop-shadow-[0_30px_60px_rgba(0,255,255,0.25)]"
            style={{ maxWidth: PHONE_MOCKUP_MAX_WIDTH }}
            width={362}
            height={622}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <FloatingChip icon={MessageSquare} label="Menos dúvidas repetidas" className="top-10 left-4 z-10" />
          <FloatingChip icon={Smartphone} label="Mais autonomia para o hóspede" className="top-1/4 right-2 z-10" />
          <FloatingChip icon={Sparkles} label="Experiência profissional" className="bottom-24 left-2 z-10" />
          <FloatingChip icon={QrCode} label="QR Code pronto para impressão" className="bottom-10 right-6 z-10" />
        </div>
      </div>
    </section>
  );
}

const problems = [
  { icon: Layers, t: "Informações espalhadas", d: "Wi-Fi, regras, endereço e instruções ficam em lugares diferentes, dificultando a vida do hóspede." },
  { icon: MessageSquare, t: "Perguntas repetidas", d: "O anfitrião precisa responder várias vezes as mesmas dúvidas antes e durante a estadia." },
  { icon: KeyRound, t: "Check-in confuso", d: "Quando as orientações não estão claras, a chegada pode gerar ansiedade e retrabalho." },
  { icon: Briefcase, t: "Experiência pouco profissional", d: "Mesmo um ótimo imóvel pode parecer menos preparado quando a comunicação não é organizada." },
];

function ProblemSection() {
  return (
    <section id="beneficios" className="py-20 lg:py-28 bg-[#F8FAFC] border-y border-[rgba(15,23,42,0.08)]">
      <div className="container px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#0F172A] mb-4">
            Seu hóspede ainda precisa procurar informações espalhadas?
          </h2>
          <p className="text-[#475569] text-lg leading-relaxed">
            PDFs desatualizados, mensagens perdidas no WhatsApp e instruções enviadas manualmente criam ruído na experiência. Com o Mr Flow Welcome Hub, tudo fica organizado em um único link simples, bonito e fácil de acessar.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {problems.map((p) => (
            <Card key={p.t} className="p-6 bg-white border-[rgba(15,23,42,0.08)] rounded-2xl shadow-sm hover:shadow-md hover:border-[#0F172A]/20 transition-all">
              <div className="h-11 w-11 rounded-xl bg-[#0F172A]/5 grid place-items-center mb-4">
                <p.icon className="h-5 w-5 text-[#0F172A]" />
              </div>
              <h3 className="font-semibold text-[#0F172A] mb-2">{p.t}</h3>
              <p className="text-sm text-[#475569] leading-relaxed">{p.d}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const hostBuilderBenefits = [
  { icon: Edit3, t: "Edite informações da hospedagem sem depender de suporte técnico" },
  { icon: Layers, t: "Adicione páginas essenciais como Wi-Fi, check-in, regras e localização" },
  { icon: Smartphone, t: "Visualize como o hóspede verá o guia no celular" },
  { icon: RefreshCw, t: "Atualize conteúdos em tempo real sempre que precisar" },
  { icon: QrCode, t: "Publique e compartilhe por link ou QR Code" },
];

function LaptopMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[640px]">
      <div className="absolute -inset-10 bg-gradient-to-tr from-[#00FFFF]/25 via-transparent to-[#00FF00]/15 blur-3xl rounded-full pointer-events-none" />
      {/* Screen */}
      <div className="relative rounded-t-2xl bg-[#1a2236] p-[10px] pb-3 shadow-[0_30px_80px_-20px_rgba(0,255,255,0.30)]">
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 h-1 w-16 rounded-full bg-[#0a0f1c]/80 z-10" />
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-[#0a0f1c]">
          {children}
        </div>
      </div>
      {/* Hinge */}
      <div className="relative mx-auto h-2 w-[106%] -translate-x-[3%] bg-gradient-to-b from-[#2a3346] to-[#1a2236]" />
      {/* Base with trackpad notch */}
      <div
        className="relative mx-auto h-3 w-[108%] -translate-x-[4%] bg-gradient-to-b from-[#1a2236] to-[#0f1626] rounded-b-2xl shadow-[0_20px_30px_-10px_rgba(0,0,0,0.6)]"
        style={{
          clipPath:
            "polygon(0 0, 42% 0, 44% 55%, 56% 55%, 58% 0, 100% 0, 100% 100%, 0 100%)",
        }}
      />
    </div>
  );
}

function HostBuilderSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <Badge className="mb-4 bg-[#00FF00]/10 text-[#00FF00] border-[#00FF00]/30 rounded-full">
              Para o anfitrião
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#F8FAFC] mb-4">
              Monte o guia do seu imóvel em poucos minutos
            </h2>
            <p className="text-[#CBD5E1] text-lg mb-8 leading-relaxed">
              Crie páginas como Wi-Fi, check-in, checkout, regras da casa e dicas locais em um painel simples, com preview em tempo real e publicação instantânea.
            </p>
            <ul className="space-y-3 mb-8">
              {hostBuilderBenefits.map((b) => (
                <li key={b.t} className="flex items-start gap-3">
                  <div className="mt-0.5 h-8 w-8 rounded-lg bg-gradient-to-br from-[#00FFFF]/15 to-[#00FF00]/15 grid place-items-center shrink-0">
                    <b.icon className="h-4 w-4 text-[#00FFFF]" />
                  </div>
                  <span className="text-[#F8FAFC] text-sm sm:text-base">{b.t}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-[#CBD5E1] italic border-l-2 border-[#00FFFF]/50 pl-4 mb-8">
              O anfitrião cria no painel. O hóspede acessa no celular. Tudo atualizado em tempo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="rounded-xl bg-[#00FFFF] text-[#020617] hover:bg-[#00FFFF]/90 font-semibold">
                <Link to="/auth">Criar meu hub grátis</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl bg-transparent border-[#00FFFF]/40 text-[#00FFFF] hover:bg-[#00FFFF]/10 hover:text-[#00FFFF]">
                <a href="#demo">Ver demo real</a>
              </Button>
            </div>
          </div>

          <div className="order-first lg:order-last">
            <LaptopMockup>
              <video
                src="/videos/hub-rapido2.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
                className="h-full w-full object-cover"
              />
            </LaptopMockup>
          </div>
        </div>
      </div>
    </section>
  );
}

function RealDemoPreview() {
  return (
    <section id="demo" className="py-20 lg:py-28 bg-[#E6FBFC]/90 backdrop-blur-sm border-y border-[#00FFFF]/30">
      <div className="container px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[#0E7490]/10 text-[#0E7490] border-[#0E7490]/30 rounded-full">Demo real</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Experimente como seu hóspede verá o Welcome Hub
          </h2>
          <p className="text-slate-700 text-lg max-w-2xl mx-auto leading-relaxed">
            Veja uma propriedade demonstrativa criada na Mr Flow Welcome Hub e navegue como se fosse um hóspede acessando pelo celular.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">
              Uma experiência real, direto no celular do hóspede
            </h3>
            <p className="text-slate-700 mb-6 leading-relaxed">
              Seu cliente pode acessar informações como Wi-Fi, check-in, checkout, regras da casa, localização, dicas locais e contatos úteis em uma página simples, bonita e sempre atualizada.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Navegação igual à do hóspede",
                "Acesso por link ou QR Code",
                "Conteúdo atualizado em tempo real",
                "Experiência mobile-first",
                "Ideal para enviar antes da chegada ou deixar impresso no imóvel",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#0E7490] shrink-0 mt-0.5" />
                  <span className="text-slate-800">{b}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="rounded-xl bg-[#0E7490] text-white hover:bg-[#0E7490]/90 font-semibold">
                <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                  Abrir demo completa <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl bg-white border-[#0E7490]/30 text-[#0E7490] hover:bg-[#0E7490]/5">
                <Link to="/auth">Criar meu hub grátis</Link>
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-tr from-[#00FFFF]/20 via-transparent to-[#00FF00]/20 blur-3xl rounded-full pointer-events-none" />
              <div className="relative w-[320px] sm:w-[360px] rounded-[3rem] bg-[#0a0f1c] border-[10px] border-[#1a2236] shadow-[0_30px_80px_-20px_rgba(0,255,255,0.30)] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#0a0f1c] rounded-b-2xl z-10" />
                <div className="relative h-[640px] sm:h-[720px] bg-[#0F172A] overflow-hidden rounded-[2rem]">
                  <iframe
                    src={DEMO_URL}
                    title="Demo Mr Flow Welcome Hub"
                    className="absolute inset-0 w-full h-full"
                    loading="lazy"
                  />
                  <noscript>
                    <div className="p-6 text-center text-[#CBD5E1] text-sm">
                      Não foi possível carregar a prévia. Clique no botão abaixo para abrir a demo completa.
                      <a href={DEMO_URL} className="block mt-3 underline text-[#00FFFF]">
                        Abrir demo completa
                      </a>
                    </div>
                  </noscript>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const steps = [
  { n: "01", icon: Building2, t: "Cadastre o imóvel", d: "Adicione nome, endereço, fotos e informações principais." },
  { n: "02", icon: Settings2, t: "Personalize as páginas", d: "Escolha quais informações o hóspede verá: Wi-Fi, regras, check-in, checkout, localização e muito mais." },
  { n: "03", icon: QrCode, t: "Compartilhe com QR Code ou link", d: "Envie antes da chegada ou deixe impresso no imóvel." },
  { n: "04", icon: RefreshCw, t: "Atualize quando quiser", d: "Mudou a senha do Wi-Fi ou uma regra da casa? Atualize em tempo real." },
];

function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-20 lg:py-28">
      <div className="container px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#F8FAFC] mb-4">Publique seu hub em poucos passos</h2>
          <p className="text-[#CBD5E1] text-lg">Do cadastro à publicação em minutos.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-[#00FFFF]/40 to-transparent" />
          {steps.map((s) => (
            <Card key={s.n} className="relative p-6 bg-[#111827] border-[rgba(148,163,184,0.20)] rounded-2xl">
              <div className="text-3xl font-bold bg-gradient-to-r from-[#00FFFF] to-[#00FF00] bg-clip-text text-transparent mb-3">
                {s.n}
              </div>
              <div className="h-11 w-11 rounded-xl bg-[#00FF00]/10 grid place-items-center mb-4">
                <s.icon className="h-5 w-5 text-[#00FF00]" />
              </div>
              <h3 className="font-semibold text-[#F8FAFC] mb-2">{s.t}</h3>
              <p className="text-sm text-[#CBD5E1] leading-relaxed">{s.d}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Smartphone, t: "Hub mobile-first", d: "Layout pensado para o celular do hóspede, com navegação simples." },
  { icon: QrCode, t: "QR Code automático", d: "Cada imóvel ganha seu próprio código pronto para impressão." },
  { icon: FileText, t: "Cartão de boas-vindas", d: "Modelo pronto para imprimir e deixar no apartamento." },
  { icon: Palette, t: "Personalização visual", d: "Adapte cores e identidade ao estilo da sua hospedagem." },
  { icon: BookOpen, t: "Páginas essenciais prontas", d: "Wi-Fi, check-in, regras, dicas e contatos já estruturados." },
  { icon: Layers, t: "Organização por imóvel", d: "Cada propriedade com suas informações específicas." },
  { icon: Network, t: "Integração com Stays e Hostaway", d: "Importe e organize dados da sua operação." },
  { icon: ImageIcon, t: "Fotos, vídeos e links", d: "Conteúdos ricos para orientar o hóspede com clareza." },
  { icon: MessageSquare, t: "Botões úteis", d: "WhatsApp, localização e avaliação em um toque." },
  { icon: RefreshCw, t: "Atualização em tempo real", d: "Mudou algo? O hóspede vê a versão atual no mesmo link." },
  { icon: Building2, t: "Gestão multi-propriedade", d: "Administre dezenas de imóveis em um único painel." },
  { icon: ShieldCheck, t: "Sem download de app", d: "Tudo no navegador do celular, sem fricção para o hóspede." },
];

function FeaturesSection() {
  return (
    <section id="recursos" className="py-20 lg:py-28 bg-[#E6FBFC]/90 backdrop-blur-sm border-y border-[#00FFFF]/30">
      <div className="container px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Recursos para profissionalizar sua hospedagem
          </h2>
          <p className="text-slate-700 text-lg leading-relaxed">
            Tudo que sua operação precisa para entregar informações com clareza e criar uma experiência mais organizada para o hóspede.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <Card key={f.t} className="p-6 bg-white border-[#0E7490]/15 rounded-2xl hover:border-[#0E7490]/40 transition-colors shadow-sm">
              <div className="h-11 w-11 rounded-xl bg-[#0E7490]/10 grid place-items-center mb-4">
                <f.icon className="h-5 w-5 text-[#0E7490]" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{f.t}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.d}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const integrations = [
  { icon: Network, t: "Stays" },
  { icon: Workflow, t: "Hostaway" },
  { icon: Database, t: "API própria" },
  { icon: Zap, t: "Automações" },
  { icon: Building2, t: "Importação de propriedades" },
  { icon: Layers, t: "Padronização por imóvel" },
];

function IntegrationsSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge className="mb-4 bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30 rounded-full">Integrações</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#F8FAFC] mb-4">Conecte sua operação e ganhe escala</h2>
          <p className="text-[#CBD5E1] text-lg leading-relaxed">
            Para operações com muitos imóveis, o Mr Flow Welcome Hub pode ajudar a importar e organizar dados de propriedades a partir de integrações e automações.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {integrations.map((i) => (
            <Card key={i.t} className="p-5 bg-[#111827] border-[rgba(148,163,184,0.20)] rounded-2xl flex items-center gap-3 hover:border-[#38BDF8]/40 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-[#38BDF8]/10 grid place-items-center">
                <i.icon className="h-5 w-5 text-[#38BDF8]" />
              </div>
              <span className="font-medium text-[#F8FAFC]">{i.t}</span>
            </Card>
          ))}
        </div>
        <p className="text-center text-[#CBD5E1] mt-10 max-w-2xl mx-auto">
          Ideal para administradoras, anfitriões profissionais, pousadas e operações que querem reduzir retrabalho.
        </p>
      </div>
    </section>
  );
}

const audiences = [
  { icon: Home, t: "Anfitriões Airbnb", d: "Organize as informações do imóvel e envie uma experiência mais completa antes da chegada." },
  { icon: Building2, t: "Casas de temporada", d: "Facilite o acesso a instruções, regras, Wi-Fi e dicas da região." },
  { icon: Briefcase, t: "Administradoras de imóveis", d: "Padronize a comunicação de várias propriedades e reduza retrabalho operacional." },
  { icon: Hotel, t: "Pousadas", d: "Digitalize orientações importantes e facilite a jornada do hóspede." },
  { icon: Star, t: "Hotéis boutique", d: "Crie uma experiência digital elegante sem exigir download de aplicativo." },
  { icon: Users, t: "Imobiliárias com locação por temporada", d: "Ofereça um diferencial profissional para proprietários e hóspedes." },
];

function AudienceSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#E6FBFC]/90 backdrop-blur-sm border-y border-[#00FFFF]/30">
      <div className="container px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Feito para quem vive de hospedagem</h2>
          <p className="text-slate-700 text-lg leading-relaxed">
            Do anfitrião individual à administradora com dezenas de imóveis, o Welcome Hub ajuda a entregar uma comunicação mais clara e profissional.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {audiences.map((a) => (
            <Card key={a.t} className="p-6 bg-white border-[#0E7490]/15 rounded-2xl shadow-sm">
              <div className="h-11 w-11 rounded-xl bg-[#0E7490]/10 grid place-items-center mb-4">
                <a.icon className="h-5 w-5 text-[#0E7490]" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{a.t}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{a.d}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const values = [
  { t: "Reduza perguntas repetidas", d: "Deixe respostas importantes disponíveis antes mesmo do hóspede perguntar." },
  { t: "Padronize a comunicação", d: "Garanta que todos os hóspedes recebam as mesmas orientações essenciais." },
  { t: "Melhore a experiência pré-check-in", d: "Ajude o hóspede a chegar mais seguro, informado e preparado." },
  { t: "Fortaleça a marca da hospedagem", d: "Substitua PDFs e mensagens soltas por uma experiência digital com aparência profissional." },
];

function ValueSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#F8FAFC] mb-4">
            Mais clareza para o hóspede. Mais controle para sua operação.
          </h2>
          <p className="text-[#CBD5E1] text-lg leading-relaxed">
            Centralizar as informações certas ajuda a reduzir atritos, padronizar a comunicação e entregar uma experiência mais profissional desde o pré-check-in.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v, idx) => (
            <Card key={v.t} className="p-6 bg-[#111827] border-[rgba(148,163,184,0.20)] rounded-2xl">
              <div className="text-2xl font-bold bg-gradient-to-r from-[#00FFFF] to-[#00FF00] bg-clip-text text-transparent mb-3">
                0{idx + 1}
              </div>
              <h3 className="font-semibold text-[#F8FAFC] mb-2">{v.t}</h3>
              <p className="text-sm text-[#CBD5E1] leading-relaxed">{v.d}</p>
            </Card>
          ))}
        </div>
        <p className="text-center text-xs text-[#CBD5E1]/80 mt-8 max-w-2xl mx-auto">
          Os resultados podem variar de acordo com a operação, mas organizar informações em um hub digital tende a reduzir dúvidas e aumentar a autonomia do hóspede.
        </p>
      </div>
    </section>
  );
}

const ENTERPRISE_WA_HREF = `https://wa.me/5521996507509?text=${encodeURIComponent(
  "Olá! Tenho interesse no plano Enterprise do MrFlow."
)}`;

const plans = [
  {
    name: "Single", sub: "Para host individual", limit: "1 imóvel", trial: "30 dias grátis",
    monthly: "R$ 8,90", yearly: "R$ 89,00",
    features: ["1 imóvel", "Hub digital personalizado", "QR Code", "Link compartilhável", "Páginas essenciais", "Cartão de boas-vindas"],
    cta: "Começar agora", href: "/app/billing", featured: false,
  },
  {
    name: "Starter", sub: "Para pequenas operações", limit: "Até 5 imóveis",
    monthly: "R$ 29,90", yearly: "R$ 299,00",
    features: ["Até 5 imóveis", "Tudo do Single", "Gestão multi-imóveis", "Personalização visual", "Páginas avançadas", "Suporte padrão"],
    cta: "Começar agora", href: "/app/billing", featured: false,
  },
  {
    name: "Pro", sub: "Para operações em crescimento", limit: "Até 20 imóveis",
    monthly: "R$ 89,90", yearly: "R$ 899,00", badge: "Mais popular",
    features: ["Até 20 imóveis", "Tudo do Starter", "Integrações", "Importação de dados", "Templates premium", "Suporte prioritário"],
    cta: "Começar agora", href: "/app/billing", featured: true,
  },
  {
    name: "Business", sub: "Para administradoras", limit: "Até 50 imóveis",
    monthly: "R$ 199,90", yearly: "R$ 1.990,00",
    features: ["Até 50 imóveis", "Tudo do Pro", "API e automações", "Gestão em escala", "Suporte avançado", "Configuração assistida"],
    cta: "Começar agora", href: "/app/billing", featured: false,
  },
  {
    name: "Enterprise", sub: "Para grandes operações", limit: "Acima de 50 imóveis",
    custom: "Sob consulta",
    features: ["Implantação personalizada", "Integrações sob medida", "Suporte consultivo", "Condições comerciais personalizadas"],
    cta: "Falar com especialista", href: ENTERPRISE_WA_HREF, featured: false, external: true,
  },
];

function PricingSection() {
  return (
    <section id="planos" className="py-20 lg:py-28 bg-[#E6FBFC]/90 backdrop-blur-sm border-y border-[#00FFFF]/30">
      <div className="container px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Planos para cada fase da sua operação</h2>
          <p className="text-slate-700 text-lg">Comece com um imóvel e evolua conforme sua operação cresce.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5">
          {plans.map((p) => {
            const isDark = p.featured;
            return (
            <Card
              key={p.name}
              className={`relative p-6 rounded-2xl flex flex-col ${
                isDark
                  ? "bg-[#111827] border-[#00FFFF]/60 shadow-[0_0_40px_-10px_rgba(0,255,255,0.5)]"
                  : "bg-white border-[#0E7490]/15 shadow-sm"
              }`}
            >
              {p.badge && (
                <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-[#00FFFF] text-[#020617] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  {p.badge}
                </div>
              )}
              <h3 className={`font-bold text-xl ${isDark ? "text-[#F8FAFC]" : "text-slate-900"}`}>{p.name}</h3>
              <p className={`text-xs mb-1 ${isDark ? "text-[#CBD5E1]" : "text-slate-600"}`}>{p.sub}</p>
              <p className={`text-xs mb-4 ${isDark ? "text-[#38BDF8]" : "text-[#0E7490]"}`}>{p.limit}</p>
              <div className="mb-1">
                {p.custom ? (
                  <div className={`text-2xl font-bold ${isDark ? "text-[#F8FAFC]" : "text-slate-900"}`}>{p.custom}</div>
                ) : (
                  <>
                    <div className={`text-2xl font-bold ${isDark ? "text-[#F8FAFC]" : "text-slate-900"}`}>{p.monthly}<span className={`text-xs font-normal ${isDark ? "text-[#CBD5E1]" : "text-slate-600"}`}>/mês</span></div>
                    <div className={`text-xs ${isDark ? "text-[#CBD5E1]" : "text-slate-600"}`}>ou {p.yearly}/ano</div>
                  </>
                )}
              </div>
              {p.trial && <div className={`text-[10px] font-medium mb-3 ${isDark ? "text-[#00FF00]" : "text-[#0E7490]"}`}>{p.trial}</div>}
              <ul className="space-y-2 my-5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-xs ${isDark ? "text-[#CBD5E1]" : "text-slate-700"}`}>
                    <Check className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${isDark ? "text-[#00FF00]" : "text-[#0E7490]"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`w-full rounded-xl ${
                  isDark
                    ? "bg-[#00FFFF] text-[#020617] hover:bg-[#00FFFF]/90 font-semibold"
                    : "bg-[#0E7490] text-white hover:bg-[#0E7490]/90 font-semibold"
                }`}
              >
                {p.external ? (
                  <a href={p.href} target="_blank" rel="noopener noreferrer">{p.cta}</a>
                ) : (
                  <Link to={p.href}>{p.cta}</Link>
                )}
              </Button>
            </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const faq = [
  ["O hóspede precisa baixar algum aplicativo?", "Não. O hóspede acessa o hub diretamente pelo navegador do celular, usando um link ou QR Code."],
  ["Posso criar um hub para cada imóvel?", "Sim. Cada propriedade pode ter suas próprias informações, páginas, fotos, regras e QR Code."],
  ["Posso atualizar as informações depois de publicado?", "Sim. Você pode editar o conteúdo sempre que precisar, e o hóspede acessa a versão atualizada pelo mesmo link."],
  ["O QR Code muda quando eu atualizo o conteúdo?", "Não. O QR Code pode continuar o mesmo, enquanto o conteúdo do hub é atualizado no painel."],
  ["Funciona para Airbnb, Booking, pousadas e casas de temporada?", "Sim. O Welcome Hub foi pensado para qualquer operação de hospedagem que queira organizar informações e melhorar a experiência do hóspede."],
  ["Consigo usar minha identidade visual?", "Sim. A proposta é que o hub pareça uma extensão da sua marca, com personalização visual e informações próprias da hospedagem."],
  ["Existe integração com plataformas de gestão?", "Sim. A plataforma pode trabalhar com integrações e automações, especialmente para operações com muitos imóveis."],
  ["Posso cancelar?", "Sim. O cliente deve ter liberdade para cancelar conforme as regras do plano contratado."],
  ["Posso compartilhar o hub pelo WhatsApp?", "Sim. Você pode enviar o link pelo WhatsApp, e-mail, mensagem automática ou disponibilizar por QR Code no imóvel."],
  ["O Welcome Hub substitui um PDF de instruções?", "Sim. A ideia é substituir materiais estáticos por uma experiência digital mais bonita, organizada e fácil de atualizar."],
];

function FAQSection() {
  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="container px-4 sm:px-6 lg:px-12 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#F8FAFC] mb-4">Dúvidas frequentes</h2>
          <p className="text-[#CBD5E1] text-lg">Veja as principais respostas sobre como funciona o Mr Flow Welcome Hub.</p>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faq.map(([q, a], i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="bg-[#111827] border border-[rgba(148,163,184,0.20)] rounded-2xl px-5 data-[state=open]:border-[#00FFFF]/40"
            >
              <AccordionTrigger className="text-left text-[#F8FAFC] hover:no-underline py-4">
                {q}
              </AccordionTrigger>
              <AccordionContent className="text-[#CBD5E1] leading-relaxed pb-4">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container px-4 sm:px-6 lg:px-12 max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl p-10 lg:p-16 text-center border border-[rgba(148,163,184,0.20)] bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#020617]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,255,255,0.15),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(0,255,0,0.12),transparent_50%)] pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl lg:text-5xl font-bold text-[#F8FAFC] mb-4 leading-tight">
              Pronto para transformar a chegada dos seus hóspedes?
            </h2>
            <p className="text-[#CBD5E1] text-lg max-w-2xl mx-auto mb-8">
              Crie uma experiência digital simples, bonita e profissional para cada imóvel da sua operação.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Button asChild size="lg" className="h-12 px-8 rounded-xl bg-[#00FFFF] text-[#020617] hover:bg-[#00FFFF]/90 font-semibold">
                <Link to="/auth">Criar meu hub grátis <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 rounded-xl bg-white/5 border-[rgba(148,163,184,0.30)] text-white hover:bg-white/10">
                <Link to="/contato">Falar com a Mr Flow</Link>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-[#CBD5E1]">
              {["Acesso por QR Code", "Sem instalar app", "Atualização em tempo real", "Ideal para múltiplos imóveis"].map((d) => (
                <span key={d} className="px-3 py-1.5 rounded-full bg-white/5 border border-[rgba(148,163,184,0.20)]">{d}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#020617] border-t border-[rgba(148,163,184,0.20)] py-12">
      <div className="container px-4 sm:px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <MrFlowLogo forceDark className="h-9 w-auto" />
              <span className="text-[9px] tracking-[0.25em] text-[#CBD5E1] uppercase">Welcome Hub</span>
            </div>
            <p className="text-sm text-[#CBD5E1] leading-relaxed">
              O hub digital de boas-vindas para anfitriões, pousadas e operações de aluguel por temporada.
            </p>
          </div>
          <div>
            <h4 className="text-[#F8FAFC] font-semibold mb-3 text-sm">Navegação</h4>
            <ul className="space-y-2 text-sm text-[#CBD5E1]">
              <li><a href="#top" className="hover:text-[#00FFFF]">Início</a></li>
              <li><a href="#beneficios" className="hover:text-[#00FFFF]">Benefícios</a></li>
              
              <li><a href="#como-funciona" className="hover:text-[#00FFFF]">Como funciona</a></li>
              <li><a href="#planos" className="hover:text-[#00FFFF]">Planos</a></li>
              <li><a href="#faq" className="hover:text-[#00FFFF]">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#F8FAFC] font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-[#CBD5E1]">
              <li><Link to="/privacidade" className="hover:text-[#00FFFF]">Política de Privacidade</Link></li>
              <li><Link to="/termos" className="hover:text-[#00FFFF]">Termos de Uso</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-[rgba(148,163,184,0.20)] text-center text-xs text-[#CBD5E1]/70">
          Desenvolvido por Mr Flow · © {new Date().getFullYear()} Mr. Flow Automações e Serviços Digitais LTDA
        </div>
      </div>
    </footer>
  );
}

export default function WelcomeHubLanding() {
  return (
    <div className="relative min-h-screen text-[#F8FAFC]" style={PAGE_BG}>
      <Seo
        title="Mr Flow Welcome Hub | Guia Digital para Hóspedes e Anfitriões"
        description="Crie um hub digital de boas-vindas para seus hóspedes com QR Code, link personalizado, instruções de check-in, Wi-Fi, regras da casa e dicas locais."
        path="/"
      />
      <ShaderBackground className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-75" />
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <StickyFeatureSection />
          <HostBuilderSection />
          <RealDemoPreview />
          <HowItWorksSection />
          <FeaturesSection />
          <IntegrationsSection />
          <AudienceSection />
          <ValueSection />
          <PricingSection />
          <FAQSection />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}
