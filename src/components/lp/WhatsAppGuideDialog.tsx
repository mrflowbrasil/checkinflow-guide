import { useState } from "react";
import { z } from "zod";
import { MessageCircle, Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const WEBHOOK_URL = "https://n8n.mrflow.com.br/webhook/disparo-hub";

const schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(100),
  whatsapp: z
    .string()
    .trim()
    .min(10, "WhatsApp inválido")
    .max(20, "WhatsApp inválido")
    .regex(/^[\d\s()+-]+$/, "Use apenas números"),
  email: z.string().trim().email("E-mail inválido").max(255),
});

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WhatsAppGuideDialog({ open, onOpenChange }: Props) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const reset = () => {
    setName("");
    setWhatsapp("");
    setEmail("");
    setErrors({});
    setSent(false);
    setLoading(false);
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ name, whatsapp, email });
    if (!result.success) {
      const fe: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fe[issue.path[0] as string] = issue.message;
      }
      setErrors(fe);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: result.data.name,
          whatsapp: result.data.whatsapp,
          email: result.data.email,
          source: "welcome-hub-landing",
          timestamp: new Date().toISOString(),
        }),
      });
      setSent(true);
      toast.success("Enviado! Em instantes você receberá o guia no WhatsApp.");
    } catch {
      toast.error("Não foi possível enviar agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {sent ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-[#25D366] mb-3" />
            <DialogTitle className="text-xl mb-2">Tudo certo!</DialogTitle>
            <DialogDescription>
              Em instantes você receberá o guia diretamente no seu WhatsApp.
            </DialogDescription>
            <Button className="mt-6 w-full" onClick={() => handleOpenChange(false)}>
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-[#25D366]/15 grid place-items-center">
                  <MessageCircle className="h-5 w-5 text-[#25D366]" />
                </div>
                <DialogTitle>Receber Guia no meu WhatsApp</DialogTitle>
              </div>
              <DialogDescription>
                Preencha seus dados e enviaremos o guia em instantes.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="wa-name">Nome</Label>
                <Input
                  id="wa-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  maxLength={100}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wa-phone">WhatsApp</Label>
                <Input
                  id="wa-phone"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(maskPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  inputMode="tel"
                  autoComplete="tel"
                />
                {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wa-email">E-mail</Label>
                <Input
                  id="wa-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  autoComplete="email"
                  maxLength={255}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                  </>
                ) : (
                  "Enviar"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
