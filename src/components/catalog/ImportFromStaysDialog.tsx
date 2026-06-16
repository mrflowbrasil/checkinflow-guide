import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, Loader2, Plug } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
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

export function ImportFromStaysDialog({ open, onOpenChange, onImported }: Props) {
  const [loading, setLoading] = useState(false);

  const startImport = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("catalog-trigger-import", {
        body: {},
      });
      if (error) throw error;
      if (data?.ok === false) {
        toast.error(data.message ?? "Não foi possível iniciar a importação.");
        return;
      }
      toast.success("Importação iniciada. Os imóveis aparecerão em instantes.");
      onImported();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("Falha ao iniciar a importação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar imóveis</DialogTitle>
          <DialogDescription>
            A importação usa sua integração ativa de Stays ou Hostaway. Os imóveis aparecem no catálogo com nome, capa, hóspedes e preço base.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border bg-muted/40 p-4 text-sm space-y-2">
          <p className="font-medium">Como funciona</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Conecte seu PMS na página de Integrações (uma vez só).</li>
            <li>Clique em "Iniciar importação" — buscamos seus imóveis no provedor.</li>
            <li>Você pode editar capa, cidade, hóspedes e preço a qualquer momento.</li>
          </ul>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" asChild>
            <Link to="/app/integrations">
              <Plug className="h-4 w-4 mr-2" />
              Integrações
            </Link>
          </Button>
          <Button onClick={startImport} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Iniciar importação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
