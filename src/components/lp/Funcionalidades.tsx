import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Smartphone, Palette, Plug, Check } from "lucide-react";
import { openQuickSignup } from "@/components/lp/QuickSignupDialog";
import func1 from "@/assets/lp/features/func1.webp.asset.json";
import func2 from "@/assets/lp/features/func2.webp.asset.json";
import func3 from "@/assets/lp/features/func3.webp.asset.json";
import func4 from "@/assets/lp/features/func4.webp.asset.json";

const CYAN = "hsl(186 100% 32%)";

type Feature = {
  badge: string;
  icon: typeof Building2;
  title: string;
  description: string;
  bullets: string[];
  image: string;
  alt: string;
};

const features: Feature[] = [
  {
    badge: "Gestão de imóveis",
    icon: Building2,
    title: "Centralize todos os seus imóveis em um só lugar",
    description:
      "Cadastre e organize cada propriedade com endereço, fotos, regras e informações essenciais. Tudo em um painel simples, pensado para quem gerencia múltiplos imóveis.",
    bullets: [
      "Cadastre quantos imóveis quiser",
      "Edição rápida e em massa",
      "Status de publicação claro",
    ],
    image: func1.url,
    alt: "Painel do Welcome Hub mostrando a listagem de imóveis cadastrados",
  },
  {
    badge: "Guia digital do hóspede",
    icon: Smartphone,
    title: "Um guia digital pronto em minutos para enviar ao seu hóspede",
    description:
      "Gere um link único e QR Code com todas as informações da estadia: check-in, Wi-Fi, regras, dicas e contatos. Envie por WhatsApp ou imprima o Cartão de Boas-Vindas A4.",
    bullets: [
      "Link público e QR Code automáticos",
      "Cartão de Boas-Vindas A4 pronto para impressão",
      "Atualize informações a qualquer momento",
    ],
    image: func2.url,
    alt: "Tela do guia digital com QR Code, link público e cartão de boas-vindas",
  },
  {
    badge: "Templates e personalização",
    icon: Palette,
    title: "Templates profissionais que valorizam a sua marca",
    description:
      "Escolha entre templates básicos e da biblioteca premium para deixar o guia com a cara da sua operação. Cores, fontes e estilo ajustados sem precisar mexer em código.",
    bullets: [
      "Biblioteca de templates Pro",
      "Identidade visual personalizada",
      "Pré-visualização em tempo real",
    ],
    image: func3.url,
    alt: "Galeria de templates do Welcome Hub com diferentes estilos visuais",
  },
  {
    badge: "Integrações e API",
    icon: Plug,
    title: "Conecte com Stays, Hostaway e seu fluxo de trabalho",
    description:
      "Importe imóveis automaticamente do seu PMS e use nossa API REST para integrar com Make, n8n, Zapier ou qualquer sistema. E, se precisar, nossa equipe oferece suporte no WhatsApp.",
    bullets: [
      "Integração nativa com Stays e Hostaway",
      "API REST com chaves dedicadas",
      "Suporte humano no WhatsApp",
    ],
    image: func4.url,
    alt: "Tela de integrações com Stays, Hostaway e chaves de API do Welcome Hub",
  },
];

export default function Funcionalidades() {
  return (
    <section id="funcionalidades" className="py-20 lg:py-28 bg-gradient-to-b from-white via-[hsl(186_100%_98%)] to-white">
      <div className="container max-w-6xl mx-auto px-5 sm:px-8">
        <header className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(186_100%_94%)] border border-[hsl(186_100%_32%)]/20 text-xs font-semibold tracking-wide uppercase text-[hsl(186_100%_24%)]">
            Funcionalidades
          </span>
          <h2 className="mt-5 text-3xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
            Tudo o que você precisa para organizar seus imóveis e{" "}
            <span style={{ color: CYAN }}>melhorar a experiência do hóspede</span>
          </h2>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed">
            Com o Welcome Hub, você centraliza a gestão dos imóveis, cria guias digitais personalizados e
            padroniza sua operação — tudo em uma plataforma pensada para anfitriões e gestores profissionais.
          </p>
        </header>

        <div className="space-y-20 lg:space-y-28">
          {features.map((f, idx) => {
            const Icon = f.icon;
            const reverse = idx % 2 === 1;
            return (
              <article
                key={f.title}
                className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"
              >
                <div className={`relative ${reverse ? "lg:order-2" : ""}`}>
                  <div className="absolute -inset-4 bg-gradient-to-tr from-[hsl(186_100%_70%)]/20 via-transparent to-[#F4C9B8]/30 rounded-[2.5rem] blur-2xl pointer-events-none" />
                  <div className="relative rounded-3xl overflow-hidden ring-1 ring-slate-200/70 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] bg-white">
                    <img
                      src={f.image}
                      alt={f.alt}
                      loading="lazy"
                      width={1600}
                      height={1200}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>

                <div className={reverse ? "lg:order-1" : ""}>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[hsl(186_100%_32%)]/20 text-xs font-semibold text-[hsl(186_100%_24%)] mb-4">
                    <Icon className="h-3.5 w-3.5" />
                    {f.badge}
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                    {f.title}
                  </h3>
                  <p className="mt-4 text-base lg:text-lg text-slate-600 leading-relaxed">
                    {f.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3">
                        <span className="mt-1 h-5 w-5 rounded-full bg-[hsl(186_100%_94%)] grid place-items-center shrink-0">
                          <Check className="h-3 w-3 text-[hsl(186_100%_28%)]" strokeWidth={3} />
                        </span>
                        <span className="text-slate-700">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-20 lg:mt-28 relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12 lg:p-14 text-center bg-gradient-to-br from-[hsl(186_100%_94%)] via-white to-[#F3EBDD]/60 border border-[hsl(186_100%_32%)]/20 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)]">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[hsl(186_100%_70%)]/25 blur-3xl pointer-events-none" />
          <h3 className="relative text-2xl lg:text-4xl font-bold text-slate-900 leading-tight">
            Pronto para criar seu primeiro guia digital?
          </h3>
          <p className="relative mt-4 text-base lg:text-lg text-slate-600 max-w-2xl mx-auto">
            Comece grátis e veja como é simples organizar seus imóveis e entregar uma experiência mais
            profissional para seus hóspedes.
          </p>
          <div className="relative mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              type="button"
              onClick={openQuickSignup}
              className="h-14 px-7 rounded-2xl bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white font-semibold shadow-[0_10px_30px_-10px_hsl(186_100%_32%/0.5)] text-base"
            >
              Criar meu guia grátis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              asChild
              className="h-14 px-7 rounded-2xl bg-white border-2 border-[hsl(186_100%_32%)]/30 text-[hsl(186_100%_24%)] hover:bg-[hsl(186_100%_32%)]/5 font-semibold text-base"
            >
              <a
                href="#demo"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("demo")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Ver demonstração
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
