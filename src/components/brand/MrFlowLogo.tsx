import { useEffect, useState } from "react";
import mrFlowLogoLight from "@/assets/mrflow-logo.png";
import mrFlowLogoDark from "@/assets/mrflow-logo-white.png";

type Props = {
  className?: string;
  alt?: string;
  /** Força a versão clara (escura no fundo) — para fundos sempre claros. */
  forceLight?: boolean;
  /** Força a versão escura (logo branca) — para fundos sempre escuros. */
  forceDark?: boolean;
};

function useIsDarkTheme() {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const el = document.documentElement;
    const update = () => setIsDark(el.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return isDark;
}

/**
 * Logo da plataforma Mr Flow.
 * Por padrão, alterna entre as versões clara/escura conforme o tema do
 * app (classe `.dark` no <html>, controlada pelo Tailwind).
 */
export function MrFlowLogo({ className, alt = "Mr Flow", forceLight, forceDark }: Props) {
  const isDark = useIsDarkTheme();

  if (forceDark) {
    return <img src={mrFlowLogoDark} alt={alt} className={className} />;
  }
  if (forceLight) {
    return <img src={mrFlowLogoLight} alt={alt} className={className} />;
  }
  const src = isDark ? mrFlowLogoDark : mrFlowLogoLight;
  return <img src={src} alt={alt} className={className} />;
}
