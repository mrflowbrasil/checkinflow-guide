import { ArrowLeft } from "lucide-react";
import { BlocksRenderer } from "@/components/blocks/BlockRenderer";
import type { BlockBase } from "@/lib/blocks";
import { Button } from "@/components/ui/button";
import { getPageIcon } from "@/lib/page-icons";
import { useGuideT } from "@/lib/i18n-guide";

export function GuestPagePreview({
  template,
  pageTitle,
  pageIcon,
  blocks,
  primaryColor,
  onBack,
}: {
  template: "clean" | "dark" | "luxury";
  pageTitle: string;
  pageIcon?: string;
  blocks: BlockBase[];
  primaryColor?: string;
  onBack?: () => void;
}) {
  const Icon = pageIcon ? getPageIcon(pageIcon) : null;
  const { t } = useGuideT();
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
      <div className="px-5 pt-4 pb-12">
        <div className="flex flex-col items-center text-center mb-6">
          {Icon && (
            <Icon className="h-12 w-12 mb-3" style={{ color: primaryColor ?? "hsl(var(--guide-fg))" }} />
          )}
          <h2 className="text-2xl font-semibold">{t(pageTitle)}</h2>
        </div>

        {blocks.length === 0 ? (
          <p className="text-center text-sm py-12" style={{ color: "hsl(var(--guide-muted))" }}>
            {t("Sem conteúdo ainda.")}
          </p>
        ) : (
          <BlocksRenderer blocks={blocks} primaryColor={primaryColor} translate />
        )}
      </div>
    </div>
  );
}
