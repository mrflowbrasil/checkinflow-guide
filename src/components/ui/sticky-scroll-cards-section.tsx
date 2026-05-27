import React, { useState, useEffect, useRef, RefObject } from "react";

// --- Data for the feature cards (PT-BR / WelcomeHub) ---
const features = [
  {
    title: "Link único para hóspedes",
    description:
      "Um único link inteligente reúne todas as informações da propriedade e pode ser enviado por WhatsApp, e-mail ou mensagem automática.",
    imageUrl: "/1cf79061-ac95-49bc-975f-509bfc357da5.webp",
    bgColor: "bg-cyan-100 dark:bg-cyan-900",
    textColor: "text-cyan-950 dark:text-cyan-50",
  },
  {
    title: "Cartão de Boas Vindas pronto para impressão",
    description:
      "Gere um Cartão de Boas Vindas A4 com QR Code para deixar no imóvel ou na recepção, facilitando o acesso às informações.",
    imageUrl: "/2b8b8106-ed26-409d-a624-60882db9fe80.webp",
    bgColor: "bg-cyan-200 dark:bg-cyan-800",
    textColor: "text-cyan-950 dark:text-cyan-50",
  },
  {
    title: "Wi-Fi, check-in e checkout sem confusão",
    description:
      "Envie boas-vindas, regras da casa, wi-fi, horários, senhas e muito mais, em páginas simples e fáceis de acessar e editar. Reduza mensagens repetidas no WhatsApp e ganhe tempo para cuidar do que importa.",
    imageUrl: "/4f67f9e6-9ac6-4147-bfc3-24da30575b55.webp",
    bgColor: "bg-sky-200 dark:bg-sky-800",
    textColor: "text-cyan-950 dark:text-cyan-50",
  },
  {
    title: "Dicas locais e pontos turísticos",
    description:
      "Indique restaurantes, mercados, praias, pontos turísticos, transporte e experiências próximas ao imóvel.",
    imageUrl: "/393a68b5-5299-4846-944b-802044708993.webp",
    bgColor: "bg-cyan-300 dark:bg-cyan-900",
    textColor: "text-cyan-950 dark:text-cyan-50",
  },
];

// --- Custom Hook for Scroll Animation ---
function useScrollAnimation<T extends HTMLElement>(): [RefObject<T>, boolean] {
  const [inView, setInView] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { root: null, rootMargin: "0px", threshold: 0.1 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}

// --- Header Component ---
const AnimatedHeader: React.FC = () => {
  const [headerRef, headerInView] = useScrollAnimation<HTMLHeadingElement>();
  const [pRef, pInView] = useScrollAnimation<HTMLParagraphElement>();

  return (
    <div className="mx-auto max-w-3xl text-center mb-16">
      <h2
        ref={headerRef}
        className={`text-4xl md:text-5xl font-bold tracking-tight text-cyan-950 dark:text-cyan-50 transition-all duration-700 ${
          headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        Tudo que o hóspede precisa, organizado em uma experiência digital
      </h2>
      <p
        ref={pRef}
        className={`mt-6 text-lg text-cyan-900/70 dark:text-cyan-100/70 transition-all duration-700 delay-150 ${
          pInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        Recursos pensados para anfitriões, pousadas e gestores que querem reduzir perguntas repetidas, padronizar informações e encantar o hóspede desde antes do check-in.
      </p>
    </div>
  );
};

// --- Main sticky feature section ---
export function StickyFeatureSection() {
  return (
    <section id="beneficios" className="w-full bg-white dark:bg-slate-950 py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <AnimatedHeader />

        <div className="relative">
          {features.map((feature, index) => (
            <div
              key={index}
              className="sticky"
              style={{ top: `${80 + index * 24}px` }}
            >
              <div
                className={`${feature.bgColor} ${feature.textColor} rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12 mb-8`}
              >
                {/* Card Content */}
                <div className="flex flex-col justify-center">
                  <span className="text-sm font-mono opacity-60 mb-3">
                    0{index + 1}
                  </span>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-lg opacity-90 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Card Image */}
                <div className="rounded-2xl overflow-hidden aspect-video md:aspect-auto md:min-h-[320px] bg-black/5">
                  <img
                    src={feature.imageUrl}
                    alt={feature.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src =
                        "https://placehold.co/600x400/cccccc/ffffff?text=Imagem+indisponivel";
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StickyFeatureSection;
