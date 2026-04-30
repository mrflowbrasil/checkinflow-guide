import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

interface UpgradePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName?: string;
  limit?: number;
}

export function UpgradePromptDialog({ open, onOpenChange, planName, limit }: UpgradePromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="h-12 w-12 rounded-full bg-accent/10 grid place-items-center mb-3">
            <Crown className="h-6 w-6 text-accent-foreground" />
          </div>
          <DialogTitle>Limite do plano atingido</DialogTitle>
          <DialogDescription className="pt-2">
            Você atingiu o limite de <strong>{limit} {limit === 1 ? "imóvel" : "imóveis"}</strong> do plano{" "}
            <strong>{planName}</strong>. Faça upgrade para adicionar mais imóveis e desbloquear novos recursos.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Agora não
          </Button>
          <Button asChild>
            <Link to="/app/billing" onClick={() => onOpenChange(false)}>
              Ver planos
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
