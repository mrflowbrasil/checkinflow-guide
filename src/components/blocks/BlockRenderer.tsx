import type { BlockBase } from "@/lib/blocks";
import { youtubeEmbedUrl } from "@/lib/blocks";
import { Lightbulb, AlertTriangle, CheckCircle2, Copy, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function BlockRenderer({ block, primaryColor }: { block: BlockBase; primaryColor?: string }) {
  switch (block.type) {
    case "text":
      return (
        <p className="text-base leading-relaxed whitespace-pre-wrap break-words text-center">
          {block.data?.content}
        </p>
      );

    case "subtitle":
      return <h3 className="text-xl font-semibold mt-4 text-center break-words">{block.data?.content}</h3>;

    case "image":
      return block.data?.url ? (
        <figure className="space-y-2">
          <img src={block.data.url} alt={block.data.caption ?? ""} className="w-full rounded-xl" loading="lazy" />
          {block.data.caption && <figcaption className="text-xs text-center" style={{ color: "hsl(var(--guide-muted))" }}>{block.data.caption}</figcaption>}
        </figure>
      ) : null;

    case "video": {
      const embed = youtubeEmbedUrl(block.data?.url);
      if (!embed) return null;
      return (
        <div className="aspect-video rounded-xl overflow-hidden">
          <iframe src={embed} className="w-full h-full" allowFullScreen title="vídeo" />
        </div>
      );
    }

    case "steps":
      return (
        <ol className="space-y-3">
          {(block.data?.items ?? []).map((it: any, i: number) => (
            <li key={i} className="flex gap-3">
              <span className="h-7 w-7 shrink-0 rounded-full grid place-items-center text-sm font-semibold"
                    style={{ background: "hsl(var(--guide-fg) / 0.08)" }}>{i + 1}</span>
              <div>
                <div className="font-medium">{it.title}</div>
                {it.detail && <div className="text-sm" style={{ color: "hsl(var(--guide-muted))" }}>{it.detail}</div>}
              </div>
            </li>
          ))}
        </ol>
      );

    case "tip": {
      const variant = block.data?.variant ?? "info";
      const Icon = variant === "warning" ? AlertTriangle : variant === "success" ? CheckCircle2 : Lightbulb;
      const bg = variant === "warning" ? "hsl(40 95% 55% / 0.1)" : variant === "success" ? "hsl(142 70% 40% / 0.1)" : "hsl(210 80% 55% / 0.08)";
      const fg = variant === "warning" ? "hsl(35 90% 40%)" : variant === "success" ? "hsl(142 70% 35%)" : "hsl(210 80% 45%)";
      return (
        <div className="flex gap-3 p-4 rounded-xl" style={{ background: bg }}>
          <Icon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: fg }} />
          <p className="text-sm leading-relaxed">{block.data?.content}</p>
        </div>
      );
    }

    case "button": {
      const handle = () => {
        const { action, value } = block.data ?? {};
        if (action === "copy") {
          navigator.clipboard.writeText(value ?? "");
          toast.success("Copiado!");
        } else if (action === "download" || action === "link") {
          window.open(value, "_blank", "noopener,noreferrer");
        }
      };
      const Icon = block.data?.action === "copy" ? Copy : block.data?.action === "download" ? Download : ExternalLink;
      return (
        <Button
          onClick={handle}
          className="w-full"
          size="lg"
          style={{ background: primaryColor ?? "hsl(var(--guide-fg))", color: "#fff" }}
        >
          <Icon className="mr-2 h-4 w-4" /> {block.data?.label}
        </Button>
      );
    }

    case "list":
      return (
        <ul className="space-y-2">
          {(block.data?.items ?? []).map((it: any, i: number) => (
            <li key={i} className="flex gap-2"><span className="opacity-50">•</span>{it.text}</li>
          ))}
        </ul>
      );

    default:
      return null;
  }
}

export function BlocksRenderer({ blocks, primaryColor }: { blocks: BlockBase[]; primaryColor?: string }) {
  return (
    <div className="space-y-5 min-w-0">
      {blocks.map((b) => <div key={b.id} className="min-w-0"><BlockRenderer block={b} primaryColor={primaryColor} /></div>)}
    </div>
  );
}
