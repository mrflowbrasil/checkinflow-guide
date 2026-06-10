import { Link } from "react-router-dom";
import { Plug } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
};

export function ImportFromStaysDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar imóveis</DialogTitle>
          <DialogDescription>
            A importação automática usa sua integração ativa (Stays, Hostaway ou Hospedin/Hub). Você gerencia conexões e sincronização na página de Integrações.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border bg-muted/40 p-4 text-sm space-y-2">
          <p className="font-medium">Como funciona</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Conecte seu PMS na página de Integrações.</li>
            <li>Os imóveis aparecem aqui automaticamente, com o selo da origem.</li>
            <li>Você pode editar foto de capa, cidade e preço para deixar o catálogo mais bonito.</li>
          </ul>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button asChild>
            <Link to="/app/integrations">
              <Plug className="h-4 w-4 mr-2" />
              Ir para Integrações
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
