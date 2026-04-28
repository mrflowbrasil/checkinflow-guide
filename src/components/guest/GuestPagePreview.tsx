import { ArrowLeft } from "lucide-react";
import { BlocksRenderer } from "@/components/blocks/BlockRenderer";
import type { BlockBase } from "@/lib/blocks";
import { Button } from "@/components/ui/button";

export function GuestPagePreview({
  template,
  pageTitle,
  blocks,
  primaryColor,
  onBack,
}: {
  template: "clean" | "dark" | "luxury";
  pageTitle: string;
  blocks: BlockBase[];
  primaryColor?: string;
  onBack?: () => void;
}) {
  return (
    <div className={`guide-root guide-template-${template} h-full overflow-y-auto`}>
      <div className="sticky top-0 z-10 px-4 py-3 backdrop-blur"
           style={{ background: "hsl(var(--guide-bg) / 0.85)", borderBottom: "1px solid hsl(var(--guide-fg) / 0.08)" }}>
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-lg font-semibold truncate">{pageTitle}</h2>
        </div>
      </div>
      <div className="p-5 pb-12">
        {blocks.length === 0 ? (
          <p className="text-center text-sm py-12" style={{ color: "hsl(var(--guide-muted))" }}>
            Sem conteúdo ainda.
          </p>
        ) : (
          <BlocksRenderer blocks={blocks} />
        )}
      </div>
    </div>
  );
}
