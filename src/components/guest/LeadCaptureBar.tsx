import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const LEAD_BAR_HEIGHT_CLASS = "h-12 sm:h-14";

export function LeadCaptureBar() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-foreground text-background shadow-md"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className={`${LEAD_BAR_HEIGHT_CLASS} max-w-5xl mx-auto px-3 sm:px-4 flex items-center gap-2 sm:gap-3`}>
        <Link
          to="/"
          aria-label="Voltar para o site"
          className="shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-background/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <p className="flex-1 min-w-0 text-xs sm:text-sm leading-tight truncate">
          <span className="hidden sm:inline">Gostou deste modelo? Crie um guia interativo para o seu imóvel.</span>
          <span className="sm:hidden">Gostou? Crie o guia do seu imóvel.</span>
        </p>

        <Button
          asChild
          size="sm"
          className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        >
          <Link to="/auth">Criar Guia Grátis</Link>
        </Button>
      </div>
    </div>
  );
}
