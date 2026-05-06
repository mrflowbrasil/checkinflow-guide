import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, QrCode, Smartphone, ArrowRight } from "lucide-react";
import mrFlowLogoWhite from "@/assets/mrflow-logo-white.png";
import mockupHome from "@/assets/mockup-home-light.webp";

const HERO_BG = {
  background:
    "radial-gradient(1200px 600px at 20% 10%, rgba(0,255,255,0.15), transparent 60%), radial-gradient(900px 500px at 80% 90%, rgba(0,140,142,0.25), transparent 60%), linear-gradient(135deg, #020617 0%, #0a1f2e 50%, #062a33 100%)",
};

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col text-white" style={HERO_BG}>
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#020617]/40 border-b border-white/10">
        <div className="container flex items-center justify-between h-16">
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
      <section className="container px-6 sm:px-8 lg:px-12 py-16 lg:py-24">
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

export default Index;
