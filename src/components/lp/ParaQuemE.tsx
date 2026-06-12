import { Home, Building2, Trees, Sparkles, type LucideIcon } from "lucide-react";
import airbnbImg from "@/assets/lp/audience/airbnb.jpg";
import gestoresImg from "@/assets/lp/audience/gestores.jpg";
import pousadaImg from "@/assets/lp/audience/pousada.jpg";
import boutiqueImg from "@/assets/lp/audience/boutique.jpg";

const CYAN = "hsl(186 100% 32%)";

type Audience = {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
  alt: string;
};

const audiences: Audience[] = [
  {
    icon: Home,
    title: "Anfitriões de Airbnb",
    description:
      "Reduza perguntas repetidas no WhatsApp e entregue um guia digital completo antes da chegada.",
    image: airbnbImg,
    alt: "Sala de estar moderna de apartamento de Airbnb",
  },
  {
    icon: Building2,
    title: "Gestores de imóveis por temporada",
    description:
      "Padronize a comunicação de vários imóveis e mantenha tudo organizado em uma única plataforma.",
    image: gestoresImg,
    alt: "Casa de temporada moderna com piscina",
  },
  {
    icon: Trees,
    title: "Pousadas e pequenas hospedagens",
    description:
      "Facilite o check-in, apresente regras, Wi-Fi, contatos e dicas locais de forma simples e profissional.",
    image: pousadaImg,
    alt: "Entrada acolhedora de uma pousada",
  },
  {
    icon: Sparkles,
    title: "Hotéis boutique e acomodações premium",
    description:
      "Substitua PDFs e mensagens soltas por uma experiência digital moderna, personalizada e elegante.",
    image: boutiqueImg,
    alt: "Suíte elegante de hotel boutique",
  },
];

export default function ParaQuemE() {
  return (
    <section id="para-quem-e" className="py-20 lg:py-28 bg-gradient-to-b from-white via-[hsl(186_100%_98%)] to-white">
      <div className="container max-w-6xl mx-auto px-5 sm:px-8">
        <header className="text-center max-w-3xl mx-auto mb-14 lg:mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(186_100%_94%)] border border-[hsl(186_100%_32%)]/20 text-xs font-semibold tracking-wide uppercase text-[hsl(186_100%_24%)]">
            Para quem é
          </span>
          <h2 className="mt-5 text-3xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
            Feito para quem recebe hóspedes e{" "}
            <span style={{ color: CYAN }}>quer ganhar tempo</span>
          </h2>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed">
            O Welcome Hub foi criado para anfitriões, gestores e negócios de hospedagem que querem reduzir
            dúvidas repetidas, profissionalizar a chegada do hóspede e organizar todas as informações da
            estadia em um só lugar.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {audiences.map((a) => {
            const Icon = a.icon;
            return (
              <article
                key={a.title}
                className="group relative flex flex-col rounded-3xl bg-white border border-slate-200/80 shadow-[0_10px_40px_-20px_rgba(15,23,42,0.15)] hover:shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)] transition-shadow overflow-hidden"
              >
                <div className="relative h-40 sm:h-44 overflow-hidden">
                  <img
                    src={a.image}
                    alt={a.alt}
                    loading="lazy"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="p-6 lg:p-7 text-left">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(186_100%_94%)] text-[hsl(186_100%_24%)] mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-slate-900 leading-snug">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm lg:text-base text-slate-600 leading-relaxed">
                    {a.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
