import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { MrFlowLogo } from "@/components/brand/MrFlowLogo";
import { Seo } from "@/components/Seo";

const passwordSchema = z.string().min(8, "Mínimo 8 caracteres").max(72);

export default function ResetPassword() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    // Supabase recovery: the link sets a recovery session via the URL hash.
    // The client listens for PASSWORD_RECOVERY and exposes a session for updateUser.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady(true);
      }
    });

    // Also check if there is already an active session (link already consumed)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    // If no recovery context after 2s, mark invalid
    const t = setTimeout(() => {
      setReady((r) => {
        if (!r) setInvalid(true);
        return r;
      });
    }, 2500);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    const pv = passwordSchema.safeParse(password);
    if (!pv.success) return toast.error(pv.error.issues[0].message);
    if (password !== confirm) return toast.error("As senhas não coincidem");

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);

    toast.success("Senha redefinida com sucesso!");
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#020617]">
      <Seo
        title="Redefinir senha — Mr Flow Welcome Hub"
        description="Crie uma nova senha para sua conta de anfitrião no Mr Flow Welcome Hub."
        path="/reset-password"
        noindex
      />

      <div
        className="hidden lg:flex p-12 flex-col justify-between relative overflow-hidden text-white"
        style={{
          background:
            "radial-gradient(1200px 600px at 20% 10%, rgba(0,255,255,0.15), transparent 60%), radial-gradient(900px 500px at 80% 90%, rgba(0,140,142,0.25), transparent 60%), linear-gradient(135deg, #020617 0%, #0a1f2e 50%, #062a33 100%)",
        }}
      >
        <Link to="/" className="flex flex-col items-start gap-1 relative">
          <MrFlowLogo forceDark className="h-10 w-auto" />
          <span className="text-[10px] tracking-[0.25em] text-white/70 uppercase">Welcome Hub</span>
        </Link>
        <div className="relative space-y-6">
          <h1 className="text-5xl leading-[1.05] tracking-tight text-white font-bold">
            Nova senha, <span style={{ color: "#00FFFF" }}>novo acesso</span>
          </h1>
          <p className="text-lg max-w-md leading-relaxed" style={{ color: "#00FF00" }}>
            Escolha uma senha forte para proteger sua conta.
          </p>
        </div>
        <p className="text-white/40 text-xs relative leading-relaxed max-w-md">
          © 2026 –{" "}
          <a href="http://mrflow.com.br" target="_blank" rel="noreferrer noopener" className="underline hover:text-white/70">
            Mr. Flow Automações e Serviços Digitais LTDA
          </a>{" "}
          – CNPJ 57.466.519/0001-87 – Todos os direitos reservados.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center p-6 bg-[#f6f6f7]">
        <Card className="w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-2xl border-0 bg-white">
          <div className="lg:hidden flex flex-col items-start gap-1 mb-8">
            <MrFlowLogo className="h-9 w-auto" />
            <span className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Welcome Hub</span>
          </div>

          {invalid && !ready ? (
            <div className="space-y-5 text-center">
              <h2 className="text-xl font-bold text-foreground">Link inválido ou expirado</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Esse link de redefinição não é mais válido. Solicite um novo para continuar.
              </p>
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Solicitar novo link
              </Link>
            </div>
          ) : !ready ? (
            <div className="grid place-items-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 grid place-items-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Criar nova senha</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Escolha uma senha com no mínimo 8 caracteres.
                  </p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rp-password">Nova senha</Label>
                  <Input
                    id="rp-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rp-confirm">Confirmar nova senha</Label>
                  <Input
                    id="rp-confirm"
                    name="confirm"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  disabled={busy}
                >
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Redefinir senha
                </Button>
              </form>
              <div className="mt-6 text-center">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar para o login
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
