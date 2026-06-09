import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const Schema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(80),
  email: z.string().trim().email("E-mail inválido").max(255),
  message: z.string().trim().min(5, "Conte um pouco mais sobre a sugestão").max(2000),
});

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
};

export function SuggestionDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
    const fullName = (meta.full_name as string) || (meta.name as string) || "";
    setName(fullName);
    setEmail(user?.email ?? "");
    setMessage("");
  }, [open, user]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = Schema.safeParse({ name, email, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique os campos");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke("suggestion-submit", {
        body: parsed.data,
      });
      if (error) throw error;
      toast.success("Sugestão enviada! Nosso time irá avaliar e, caso aprovada, a implementação será feita em poucos dias.");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Não foi possível enviar agora. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar sugestão</DialogTitle>
          <DialogDescription>
            Sentiu falta de algo? Conta pra gente — nosso time avalia todas as sugestões.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sg-name">Nome</Label>
            <Input id="sg-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sg-email">E-mail</Label>
            <Input id="sg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required />
            <p className="text-xs text-muted-foreground">Usaremos só para te avisar se sua sugestão for aprovada.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sg-msg">Sua sugestão</Label>
            <Textarea
              id="sg-msg"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              placeholder="Descreva a funcionalidade ou melhoria que faria diferença para você."
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar sugestão
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
