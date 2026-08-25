import { ArrowLeft, Clock } from "lucide-react";
import { BlocksRenderer } from "@/components/blocks/BlockRenderer";
import type { BlockBase } from "@/lib/blocks";
import { Button } from "@/components/ui/button";
import { getPageIcon } from "@/lib/page-icons";
import { useGuideT, type GuideLocale } from "@/lib/i18n-guide";

function formatLockRelease(iso: string, locale: GuideLocale): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const loc = locale === "en" ? "en-US" : locale === "es" ? "es-ES" : "pt-BR";
  const date = d.toLocaleDateString(loc, { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit" });
  return `${date} ${locale === "pt" ? "às" : "at"} ${time}`;
}

export function GuestPagePreview({
  template,
  pageTitle,
  pageIcon,
  blocks,
  primaryColor,
  pendingLockAt,
  onBack,
}: {
  template: "clean" | "dark" | "luxury";
  pageTitle: string;
  pageIcon?: string;
  blocks: BlockBase[];
  primaryColor?: string;
  /** ISO timestamp of the next scheduled lock-code release (shown as a notice when no code is visible yet). */
  pendingLockAt?: string | null;
  onBack?: () => void;
}) {
  const Icon = pageIcon ? getPageIcon(pageIcon) : null;
  const { t, locale } = useGuideT();
  const hasVisibleCode = blocks.some(
    (b) => b.type === "password" && !!(b.data as any)?.value
  );
  const showLockNotice = !!pendingLockAt && !hasVisibleCode;
  return (
    <div className={`guide-root guide-template-${template} h-full overflow-y-auto`}>
      <div
        className="sticky top-0 z-10 px-4 pb-3 backdrop-blur"
        style={{
          background: "hsl(var(--guide-bg) / 0.85)",
          borderBottom: "1px solid hsl(var(--guide-fg) / 0.08)",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 1.25rem)",
        }}
      >
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      <div className="guide-inner-decor px-5 pt-4 pb-12">
        <div className="flex flex-col items-center text-center mb-6">
          {Icon && (
            <span className="guide-page-icon-halo mb-3">
              <Icon className="h-12 w-12" style={{ color: primaryColor ?? "hsl(var(--guide-fg))" }} />
            </span>
          )}
          <h2 className="text-2xl font-semibold">{t(pageTitle)}</h2>
        </div>

        {showLockNotice && (
          <div
            className="flex gap-3 p-4 rounded-xl mb-5"
            style={{ background: "hsl(210 80% 55% / 0.08)" }}
          >
            <Clock className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "hsl(210 80% 45%)" }} />
            <p className="text-sm leading-relaxed">
              {t("A senha da fechadura será liberada em")}{" "}
              <strong>{formatLockRelease(pendingLockAt!, locale)}</strong>.
            </p>
          </div>
        )}

        {blocks.length === 0 ? (
          !showLockNotice && (
            <p className="text-center text-sm py-12" style={{ color: "hsl(var(--guide-muted))" }}>
              {t("Sem conteúdo ainda.")}
            </p>
          )
        ) : (
          <BlocksRenderer blocks={blocks} primaryColor={primaryColor} translate />
        )}
      </div>

    </div>
  );
}
