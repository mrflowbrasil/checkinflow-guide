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
import { lovable } from "@/integrations/lovable";
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
  const [googleBusy, setGoogleBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const onGoogle = async () => {
    if (busy || googleBusy) return;
    setGoogleBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/app",
      });
      if (result.error) {
        setGoogleBusy(false);
        toast.error("Não foi possível conectar com o Google. Tente novamente.");
        return;
      }
      if (result.redirected) return;
      setGoogleBusy(false);
      navigate("/app");
    } catch {
      setGoogleBusy(false);
      toast.error("Erro de conexão com o Google.");
    }
  };

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
        <div className="bg-gradient-to-br from-[hsl(186_100%_96%)] via-white to-[#F3EBDD]/40 px-6 pt-4 pb-2">
          <img
            src={mockupAsset.url}
            alt="Painel Mr Flow Welcome Hub no notebook e celular"
            className="w-full h-auto object-contain max-h-[140px] mx-auto"
            loading="eager"
          />
        </div>

        {phase === "form" ? (
          <form onSubmit={onSubmit} className="px-6 pb-6 pt-2 space-y-4">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Comece seu guia grátis agora
              </h2>
              <p className="text-sm font-semibold text-[hsl(186_100%_32%)]">
                Seu guia fica pronto em menos de 5 minutos!
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Preencha seus dados e acesse o Welcome Hub por 30 dias grátis, sem cartão de crédito.
              </p>
            </div>

            <Button
              type="button"
              onClick={onGoogle}
              disabled={busy || googleBusy}
              variant="outline"
              className="w-full h-11 rounded-xl border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium"
            >
              {googleBusy ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Conectando ao Google…
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400">ou</span>
              </div>
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
                  disabled={busy || googleBusy}
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
                  disabled={busy || googleBusy}
                  maxLength={255}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={busy || googleBusy}
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
