import { Instagram, Facebook } from "lucide-react";

interface SocialLinksProps {
  instagramUrl?: string | null;
  facebookUrl?: string | null;
}

export function SocialLinks({ instagramUrl, facebookUrl }: SocialLinksProps) {
  if (!instagramUrl && !facebookUrl) return null;

  const baseClasses =
    "h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/90 backdrop-blur-md shadow-lg ring-1 ring-black/5 grid place-items-center transition-transform hover:scale-105 active:scale-95";

  return (
    <div className="absolute left-3 sm:left-4 bottom-3 sm:bottom-4 z-30 flex items-center gap-2">
      {instagramUrl && (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Instagram"
          className={baseClasses}
          style={{ color: "#E1306C" }}
        >
          <Instagram className="h-5 w-5" />
        </a>
      )}
      {facebookUrl && (
        <a
          href={facebookUrl}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Facebook"
          className={baseClasses}
          style={{ color: "#1877F2" }}
        >
          <Facebook className="h-5 w-5" />
        </a>
      )}
    </div>
  );
}

/** Normaliza username ou URL em URL absoluta. Retorna null se vazio. */
export function normalizeSocialUrl(input: string, network: "instagram" | "facebook"): string | null {
  const v = (input ?? "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@/, "").replace(/^\/+/, "");
  const base = network === "instagram" ? "https://instagram.com/" : "https://facebook.com/";
  return base + handle;
}
