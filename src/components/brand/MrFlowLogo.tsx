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

/**
 * Logo da plataforma Mr Flow.
 * Por padrão, alterna entre as versões clara/escura conforme o tema do
 * dispositivo do usuário (prefers-color-scheme), usando <picture>.
 */
export function MrFlowLogo({ className, alt = "Mr Flow", forceLight, forceDark }: Props) {
  if (forceDark) {
    return <img src={mrFlowLogoDark} alt={alt} className={className} />;
  }
  if (forceLight) {
    return <img src={mrFlowLogoLight} alt={alt} className={className} />;
  }
  return (
    <picture>
      <source srcSet={mrFlowLogoDark} media="(prefers-color-scheme: dark)" />
      <img src={mrFlowLogoLight} alt={alt} className={className} />
    </picture>
  );
}
