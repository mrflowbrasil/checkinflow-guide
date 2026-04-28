export type BlockType = "text" | "subtitle" | "image" | "video" | "steps" | "tip" | "button" | "list";

export interface BlockBase {
  id: string;
  type: BlockType;
  position: number;
  data: any;
}

// Per-type data shapes (stored in `data` JSONB)
export interface TextData { content: string }
export interface SubtitleData { content: string }
export interface ImageData { url: string; caption?: string }
export interface VideoData { url: string }
export interface StepsData { items: { title: string; detail?: string }[] }
export interface TipData { content: string; variant?: "info" | "warning" | "success" }
export interface ButtonData { label: string; action: "copy" | "download" | "link"; value: string }
export interface ListData { items: { text: string; icon?: string }[] }

export const BLOCK_LABELS: Record<BlockType, string> = {
  text: "Texto",
  subtitle: "Subtítulo",
  image: "Imagem",
  video: "Vídeo (YouTube)",
  steps: "Passo a passo",
  tip: "Caixa de dica",
  button: "Botão",
  list: "Lista",
};

export function defaultDataFor(type: BlockType): any {
  switch (type) {
    case "text": return { content: "" };
    case "subtitle": return { content: "" };
    case "image": return { url: "", caption: "" };
    case "video": return { url: "" };
    case "steps": return { items: [{ title: "" }] };
    case "tip": return { content: "", variant: "info" };
    case "button": return { label: "", action: "copy", value: "" };
    case "list": return { items: [{ text: "" }] };
  }
}

export function youtubeEmbedUrl(input: string): string | null {
  if (!input) return null;
  try {
    const u = new URL(input);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
  } catch { /* ignore */ }
  return null;
}
