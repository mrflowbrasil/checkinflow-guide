import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import mockupAsset from "@/assets/lp/mockup-comp-light.webp.asset.json";

const QUICK_SIGNUP_EVENT = "lp:open-quick-signup";

export function openQuickSignup() {
  window.dispatchEvent(new Event(QUICK_SIGNUP_EVENT));
}

const nameSchema = z.string().trim().min(2, "Informe seu nome").max(80);
const emailSchema = z.string().trim().email("E-mail inválido").max(255);

type Phase = "form" | "exists";

export default function QuickSignupDialog() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const handler = () => {
      setPhase("form");
      setOpen(true);
    };
    window.addEventListener(QUICK_SIGNUP_EVENT, handler);
    return () => window.removeEventListener(QUICK_SIGNUP_EVENT, handler);
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    const nv = nameSchema.safeParse(name);
    if (!nv.success) return toast.error(nv.error.issues[0].message);
    const ev = emailSchema.safeParse(email);
    if (!ev.success) return toast.error(ev.error.issues[0].message);

    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("quick-signup", {
        body: { name: nv.data, email: ev.data },
      });
      if (error) {
        setBusy(false);
        return toast.error("Não foi possível criar sua conta agora. Tente novamente.");
      }
      const res = data as { status?: string; email?: string; tempPassword?: string };
      if (res.status === "exists") {
        setBusy(false);
        setPhase("exists");
        return;
      }
      if (res.status !== "created" || !res.email || !res.tempPassword) {
        setBusy(false);
        return toast.error("Resposta inesperada. Tente novamente.");
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: res.email,
        password: res.tempPassword,
      });
      setBusy(false);
      if (signInError) {
        return toast.error("Conta criada, mas não conseguimos entrar. Verifique seu e-mail.");
      }
      toast.success("Conta criada! Enviamos sua senha temporária por e-mail.");
      setOpen(false);
      navigate("/app");
    } catch {
      setBusy(false);
      toast.error("Erro de conexão. Tente novamente.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border-slate-200">
        <div className="bg-gradient-to-br from-[hsl(186_100%_96%)] via-white to-[#F3EBDD]/40 px-6 pt-6 pb-2">
          <img
            src={mockupAsset.url}
            alt="Painel Mr Flow Welcome Hub no notebook e celular"
            className="w-full h-auto object-contain max-h-[180px] mx-auto"
            loading="eager"
          />
        </div>

        {phase === "form" ? (
          <form onSubmit={onSubmit} className="px-6 pb-6 pt-2 space-y-4">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Comece seu guia grátis agora
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Preencha seus dados e acesse o Welcome Hub por 30 dias grátis, sem cartão de crédito.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="qs-name">Nome</Label>
                <Input
                  id="qs-name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  disabled={busy}
                  maxLength={80}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qs-email">E-mail</Label>
                <Input
                  id="qs-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  required
                  disabled={busy}
                  maxLength={255}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full h-12 rounded-xl bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white font-semibold text-base shadow-[0_10px_30px_-10px_hsl(186_100%_32%/0.5)]"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando seu acesso…
                </>
              ) : (
                <>
                  Criar meu hub grátis <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center">
              30 dias grátis no plano Single. Sem cartão. Sem pegadinhas.
            </p>
          </form>
        ) : (
          <div className="px-6 pb-6 pt-2 space-y-4 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Já existe uma conta com este e-mail
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Parece que você já se cadastrou antes com <strong>{email}</strong>. Entrar agora?
            </p>
            <Button
              className="w-full h-12 rounded-xl bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white font-semibold text-base"
              onClick={() => {
                setOpen(false);
                navigate("/auth");
              }}
            >
              Entrar na minha conta <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <button
              type="button"
              onClick={() => setPhase("form")}
              className="text-sm text-slate-500 hover:text-slate-700 underline-offset-2 hover:underline"
            >
              Usar outro e-mail
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
