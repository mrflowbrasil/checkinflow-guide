export type TemplateKey =
  | "clean" | "dark" | "luxury"
  | "boho_fun" | "pop_vibes" | "arcade" | "jungle"
  | "serene_coast" | "coastal_boho" | "studio_minimal"
  | "aegean" | "surf" | "urban_oasis" | "modular" | "monochrome";

export type TemplateTier = "free" | "pro";

export type TemplateDef = {
  key: TemplateKey;
  name: string;
  description: string;
  tier: TemplateTier;
  primary: string;     // hex
  secondary: string;   // hex
  preview: string;     // CSS background for the swatch
  previewReady?: boolean; // true → "Ver" button enabled
};

export const PREVIEW_READY_TEMPLATES: TemplateKey[] = ["clean", "dark", "luxury"];

export function isPreviewReady(key: TemplateKey): boolean {
  return PREVIEW_READY_TEMPLATES.includes(key);
}

export const TEMPLATES: TemplateDef[] = [
  // Free / básicos
  { key: "clean", name: "Clean", description: "Branco + navy, sombras suaves.", tier: "free",
    primary: "#0F1E3D", secondary: "#FFFFFF",
    preview: "linear-gradient(135deg, #ffffff 50%, #0F1E3D 50%)" },
  { key: "dark", name: "Dark", description: "Fundo escuro, textos brancos.", tier: "free",
    primary: "#FFFFFF", secondary: "#0F1E3D",
    preview: "linear-gradient(135deg, #0F1E3D 50%, #1a2c52 50%)" },
  { key: "luxury", name: "Luxury", description: "Creme, serifa, acentos dourados.", tier: "free",
    primary: "#c9a35b", secondary: "#f3ebd9",
    preview: "linear-gradient(135deg, #f3ebd9 50%, #c9a35b 50%)" },

  // Pro
  { key: "boho_fun", name: "Boho Fun", description: "Verde-água + bege quente, vibe acolhedora.", tier: "pro",
    primary: "#2f6e63", secondary: "#f0e3cf",
    preview: "linear-gradient(135deg, #f0e3cf 50%, #2f6e63 50%)" },
  { key: "pop_vibes", name: "Pop Vibes", description: "Laranja vibrante + azul, divertido.", tier: "pro",
    primary: "#ef6a3a", secondary: "#2b78c2",
    preview: "linear-gradient(135deg, #ef6a3a 50%, #2b78c2 50%)" },
  { key: "arcade", name: "Arcade", description: "Roxo gamer + amarelo neon.", tier: "pro",
    primary: "#5b3a9b", secondary: "#f5d24a",
    preview: "linear-gradient(135deg, #2a1d4a 50%, #f5d24a 50%)" },
  { key: "jungle", name: "Jungle", description: "Verde floresta + creme, atmosfera natural.", tier: "pro",
    primary: "#3d6b3a", secondary: "#efe6cf",
    preview: "linear-gradient(135deg, #2f5a2c 50%, #efe6cf 50%)" },
  { key: "serene_coast", name: "Serene Coast", description: "Bege areia + coral, oceânico suave.", tier: "pro",
    primary: "#e07a5f", secondary: "#f5ead4",
    preview: "linear-gradient(135deg, #f5ead4 50%, #e07a5f 50%)" },
  { key: "coastal_boho", name: "Coastal Boho", description: "Teal escuro + coral, praiano sofisticado.", tier: "pro",
    primary: "#e57a5b", secondary: "#103a44",
    preview: "linear-gradient(135deg, #103a44 50%, #e57a5b 50%)" },
  { key: "studio_minimal", name: "Studio Minimal", description: "Branco + cinza, ultra-minimalista.", tier: "pro",
    primary: "#1a1a1a", secondary: "#f4f4f4",
    preview: "linear-gradient(135deg, #f4f4f4 50%, #1a1a1a 50%)" },
  { key: "aegean", name: "Aegean", description: "Azul Egeu + branco, mediterrâneo.", tier: "pro",
    primary: "#1f6fb2", secondary: "#ffffff",
    preview: "linear-gradient(135deg, #ffffff 50%, #1f6fb2 50%)" },
  { key: "surf", name: "Surf", description: "Branco + turquesa, leve e descontraído.", tier: "pro",
    primary: "#26b3a8", secondary: "#ffffff",
    preview: "linear-gradient(135deg, #ffffff 50%, #26b3a8 50%)" },
  { key: "urban_oasis", name: "Urban Oasis", description: "Bege quente + verde sálvia, urbano-natural.", tier: "pro",
    primary: "#6e8a6a", secondary: "#ece3d4",
    preview: "linear-gradient(135deg, #ece3d4 50%, #6e8a6a 50%)" },
  { key: "modular", name: "Modular", description: "Cinza claro + azul aço, contemporâneo.", tier: "pro",
    primary: "#3c5a72", secondary: "#e8ebee",
    preview: "linear-gradient(135deg, #e8ebee 50%, #3c5a72 50%)" },
  { key: "monochrome", name: "Monochrome", description: "Preto + branco, alto contraste.", tier: "pro",
    primary: "#000000", secondary: "#ffffff",
    preview: "linear-gradient(135deg, #ffffff 50%, #000000 50%)" },
];

export function getTemplate(key: string | null | undefined): TemplateDef {
  return TEMPLATES.find((t) => t.key === key) ?? TEMPLATES[0];
}

export function canUseProTemplates(planCode: string | null | undefined): boolean {
  return planCode === "pro" || planCode === "business";
}

export function isPlanProOrAbove(planCode: string | null | undefined): boolean {
  return planCode === "pro" || planCode === "business";
}

export function isPlanBusiness(planCode: string | null | undefined): boolean {
  return planCode === "business";
}
