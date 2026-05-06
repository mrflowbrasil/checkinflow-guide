import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Download, Palette, Circle } from "lucide-react";
import { toast } from "sonner";
import { generateWelcomePdf, type WelcomePdfMode } from "@/lib/welcome-pdf";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  propertyName: string;
  url: string;
  slug: string;
  primaryColor: string;
  tenantLogoUrl?: string | null;
};

export function WelcomeCardDialog({ open, onOpenChange, propertyName, url, slug, primaryColor, tenantLogoUrl }: Props) {
  const [mode, setMode] = useState<WelcomePdfMode>("color");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await generateWelcomePdf({ propertyName, url, primaryColor, mode, tenantLogoUrl, fileSlug: slug });
      toast.success("Cartão gerado com sucesso!");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao gerar PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cartão de boas-vindas (A4)</DialogTitle>
          <DialogDescription>
            Gere um PDF pronto para impressão com o QR Code do guia. Escolha o estilo de cores abaixo.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={mode} onValueChange={(v) => setMode(v as WelcomePdfMode)} className="grid gap-3 py-2">
          <label
            htmlFor="mode-color"
            className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent transition-colors"
          >
            <RadioGroupItem value="color" id="mode-color" />
            <Palette className="h-4 w-4" style={{ color: primaryColor }} />
            <div className="flex-1">
              <div className="text-sm font-medium">Cores do template</div>
              <div className="text-xs text-muted-foreground">Usa a cor principal da sua marca</div>
            </div>
            <span className="h-5 w-5 rounded-full border" style={{ background: primaryColor }} />
          </label>

          <label
            htmlFor="mode-bw"
            className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent transition-colors"
          >
            <RadioGroupItem value="bw" id="mode-bw" />
            <Circle className="h-4 w-4" />
            <div className="flex-1">
              <div className="text-sm font-medium">Padrão preto e branco</div>
              <div className="text-xs text-muted-foreground">Ideal para impressão econômica</div>
            </div>
            <span className="h-5 w-5 rounded-full border bg-foreground" />
          </label>
        </RadioGroup>

        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
          <strong>Atenção:</strong> se você gerar um novo link público para este imóvel, o QR Code deste cartão deixará de funcionar e será necessário imprimir uma nova versão.
        </div>

        {tenantLogoUrl && (
          <p className="text-xs text-muted-foreground">
            ✓ Sua logo será incluída no canto superior direito do cartão.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleDownload} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Baixar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
