import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Sparkles, QrCode, Smartphone, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-30">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2 font-semibold">
            <div className="h-8 w-8 rounded-lg bg-primary grid place-items-center text-primary-foreground">
              <Home className="h-4 w-4" />
            </div>
            Mr Flow Host
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Entrar</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-20 lg:py-32 text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft text-accent-foreground text-xs font-medium mb-6">
          <Sparkles className="h-3 w-3" /> Guias digitais para temporada
        </div>
        <h1 className="text-4xl lg:text-6xl font-semibold tracking-tight mb-6 leading-[1.1]">
          O guia perfeito para cada hóspede,<br />
          em <span className="text-accent">um único link</span>.
        </h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
          Cadastre seu imóvel, personalize o conteúdo em blocos e compartilhe um link mobile com QR Code. Sem app, sem cadastro para o hóspede.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild size="lg" className="h-12 px-8">
            <Link to="/auth">Começar grátis <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-24 grid gap-6 md:grid-cols-3">
        {[
          { icon: Smartphone, title: "Mobile-first", desc: "Pensado para o hóspede acessar do celular, com botões grandes e navegação simples." },
          { icon: Sparkles, title: "Editor por blocos", desc: "Texto, vídeo, imagem, passo-a-passo, dicas. Reordene tudo arrastando." },
          { icon: QrCode, title: "QR Code automático", desc: "Cada imóvel ganha um link e um QR Code para imprimir e deixar no apartamento." },
        ].map((f) => (
          <div key={f.title} className="p-6 rounded-2xl bg-card border shadow-card">
            <div className="h-10 w-10 rounded-lg bg-accent-soft text-accent-foreground grid place-items-center mb-4">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © Mr Flow Host
      </footer>
    </div>
  );
};

export default Index;
