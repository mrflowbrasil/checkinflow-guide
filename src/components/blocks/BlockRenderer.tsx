import { useState } from "react";
import type { BlockBase } from "@/lib/blocks";
import { youtubeEmbedUrl } from "@/lib/blocks";
import { Lightbulb, AlertTriangle, CheckCircle2, Copy, Download, ExternalLink, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormattedText } from "@/lib/inline-format";
import { useGuideT } from "@/lib/i18n-guide";
import { sbImage, sbImageSrcSet } from "@/lib/supabase-image";


export function BlockRenderer({ block, primaryColor, translate }: { block: BlockBase; primaryColor?: string; translate?: boolean }) {
  const { t } = useGuideT();
  const tr = translate ? (s: string | undefined | null) => t(s) : (s: string | undefined | null) => s ?? "";

  switch (block.type) {
    case "text":
      return (
        <FormattedText
          content={tr(block.data?.content ?? "")}
          className="text-base leading-relaxed whitespace-pre-wrap break-words text-center"
        />
      );

    case "subtitle":
      return <h3 className="text-xl font-semibold mt-4 text-center break-words">{tr(block.data?.content)}</h3>;

    case "image":
      return block.data?.url ? (
        <figure className="space-y-2">
          <img
            src={sbImage(block.data.url, { width: 800 })}
            srcSet={sbImageSrcSet(block.data.url, [480, 800, 1200])}
            sizes="(max-width: 640px) 100vw, 640px"
            alt={tr(block.data.caption ?? "")}
            className="w-full rounded-xl"
            loading="lazy"
            decoding="async"
          />

          {block.data.caption && <figcaption className="text-xs text-center" style={{ color: "hsl(var(--guide-muted))" }}>{tr(block.data.caption)}</figcaption>}
        </figure>
      ) : null;

    case "video": {
      const url: string = block.data?.url ?? "";
      if (!url) return null;
      const source = block.data?.source;
      const embed = source !== "upload" ? youtubeEmbedUrl(url) : null;
      if (embed) {
        return (
          <div className="aspect-video rounded-xl overflow-hidden">
            <iframe src={embed} className="w-full h-full" allowFullScreen title="vídeo" />
          </div>
        );
      }
      if (source === "upload") {
        return (
          <video
            src={url}
            controls
            preload="metadata"
            playsInline
            className="w-full rounded-xl bg-black aspect-video"
          />
        );
      }
      return null;
    }

    case "steps":
      return (
        <ol className="space-y-3">
          {(block.data?.items ?? []).map((it: any, i: number) => (
            <li key={i} className="flex gap-3">
              <span className="h-7 w-7 shrink-0 rounded-full grid place-items-center text-sm font-semibold"
                    style={{ background: "hsl(var(--guide-fg) / 0.08)" }}>{i + 1}</span>
              <div>
                <div className="font-medium">{tr(it.title)}</div>
                {it.detail && <div className="text-sm" style={{ color: "hsl(var(--guide-muted))" }}>{tr(it.detail)}</div>}
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
          <FormattedText content={tr(block.data?.content ?? "")} className="text-sm leading-relaxed" />
        </div>
      );
    }

    case "button": {
      const handle = () => {
        const { action, value } = block.data ?? {};
        if (action === "copy") {
          navigator.clipboard.writeText(value ?? "");
          toast.success(tr("Copiado!"));
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
          <Icon className="mr-2 h-4 w-4" /> {tr(block.data?.label)}
        </Button>
      );
    }

    case "list":
      return (
        <ul className="space-y-2">
          {(block.data?.items ?? []).map((it: any, i: number) => (
            <li key={i} className="flex gap-2"><span className="opacity-50">•</span>{tr(it.text)}</li>
          ))}
        </ul>
      );

    case "password":
      return <PasswordBlock data={block.data} primaryColor={primaryColor} translate={translate} />;

    case "divider":
      return (
        <div role="separator" aria-orientation="horizontal" className="py-2">
          <div
            className="mx-auto h-0.5 w-4/5 rounded-full"
            style={{ background: "hsl(215 16% 65%)" }}
          />
        </div>
      );

    default:
      return null;
  }
}

function PasswordBlock({ data, primaryColor, translate }: { data: any; primaryColor?: string; translate?: boolean }) {
  const [shown, setShown] = useState(false);
  const { t } = useGuideT();
  const tr = translate ? (s: string) => t(s) : (s: string) => s;
  const value: string = data?.value ?? "";
  const label: string = data?.label ?? "Senha";
  const masked = "•".repeat(Math.max(value.length, 8));
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(tr("Senha copiada!"));
    } catch {
      toast.error(tr("Não foi possível copiar"));
    }
  };
  return (
    <div
      className="rounded-xl p-4 border"
      style={{ background: "hsl(var(--guide-fg) / 0.04)", borderColor: "hsl(var(--guide-fg) / 0.1)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Lock className="h-4 w-4" style={{ color: primaryColor ?? "hsl(var(--guide-fg))" }} />
        <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "hsl(var(--guide-muted))" }}>
          {tr(label)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <code
          className="flex-1 font-mono text-base sm:text-lg tracking-wider px-3 py-2 rounded-lg break-all select-all"
          style={{ background: "hsl(var(--guide-fg) / 0.06)" }}
        >
          {value ? (shown ? value : masked) : "—"}
        </code>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Ocultar" : "Mostrar"}
          disabled={!value}
        >
          {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button
          type="button"
          size="icon"
          onClick={copy}
          aria-label="Copiar"
          disabled={!value}
          style={{ background: primaryColor ?? "hsl(var(--guide-fg))", color: "#fff" }}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function BlocksRenderer({ blocks, primaryColor, translate }: { blocks: BlockBase[]; primaryColor?: string; translate?: boolean }) {
  return (
    <div className="space-y-5 min-w-0">
      {blocks.map((b) => <div key={b.id} className="min-w-0"><BlockRenderer block={b} primaryColor={primaryColor} translate={translate} /></div>)}
    </div>
  );
}
