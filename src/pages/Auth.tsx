import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { MrFlowLogo } from "@/components/brand/MrFlowLogo";
import { Seo } from "@/components/Seo";
import { lovable } from "@/integrations/lovable/index";
import hospitalityBg from "@/assets/auth/hospitality-bg.jpg.asset.json";

const emailSchema = z.string().trim().email("Email inválido").max(255);
const passwordSchema = z.string().min(1, "Informe uma senha").max(72);
const nameSchema = z.string().trim().min(2, "Nome muito curto").max(80);

function traduzErroAuth(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("password") && (m.includes("weak") || m.includes("pwned") || m.includes("known"))) {
    return "Esta senha é muito comum. Escolha outra senha.";
  }
  if (m.includes("password should be at least")) return "A senha é muito curta.";
  if (m.includes("invalid login credentials")) return "Email ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu email antes de entrar.";
  if (m.includes("user already registered") || m.includes("already registered")) return "Este email já está cadastrado.";
  if (m.includes("rate limit") || m.includes("too many")) return "Muitas tentativas. Tente novamente em alguns minutos.";
  if (m.includes("invalid email")) return "Email inválido.";
  if (m.includes("network")) return "Erro de conexão. Verifique sua internet.";
  return "Não foi possível concluir. Tente novamente.";
}

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (user) return <Navigate to="/app" replace />;

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const ev = emailSchema.safeParse(email);
    const pv = passwordSchema.safeParse(password);
    if (!ev.success) return toast.error(ev.error.issues[0].message);
    if (!pv.success) return toast.error(pv.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(traduzErroAuth(error.message));
    navigate("/app");
  };

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const fullName = String(fd.get("full_name") ?? "");
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const nv = nameSchema.safeParse(fullName);
    const ev = emailSchema.safeParse(email);
    const pv = passwordSchema.safeParse(password);
    if (!nv.success) return toast.error(nv.error.issues[0].message);
    if (!ev.success) return toast.error(ev.error.issues[0].message);
    if (!pv.success) return toast.error(pv.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { full_name: fullName },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Conta criada! Verifique seu email para confirmar antes de entrar.");
    setTab("signin");
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/app`,
    });
    if (result.error) {
      setBusy(false);
      return toast.error(result.error.message ?? "Falha ao entrar com Google");
    }
    if (result.redirected) return;
    setBusy(false);
    navigate("/app");
  };

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2 bg-[#020617]">
      <Seo
        title="Entrar — Mr Flow Welcome Hub"
        description="Acesse sua conta de anfitrião na Mr Flow para gerenciar guias digitais dos seus imóveis de temporada."
        path="/auth"
        noindex
      />
      {/* Hero side */}
      <div
        className="relative overflow-hidden text-white bg-[#0a1521] min-h-[60vh] sm:min-h-[55vh] lg:min-h-screen lg:flex"
        style={{
          backgroundImage: `url(${hospitalityBg.url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlays */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,15,25,0.62) 0%, rgba(8,15,25,0.72) 55%, rgba(8,15,25,0.92) 100%)",
          }}
        />

        {/* Logo */}
        <Link to="/" className="absolute top-6 left-6 lg:top-10 lg:left-12 flex flex-col items-start gap-1 z-10">
          <MrFlowLogo forceDark className="h-9 lg:h-10 w-auto" />
          <span className="text-[10px] tracking-[0.25em] text-white/70 uppercase">Welcome Hub</span>
        </Link>

        {/* Content (centered vertically) */}
        <div className="relative z-10 flex flex-col justify-center w-full px-6 sm:px-10 lg:px-16 pt-24 pb-12 lg:py-24">
          <div key={tab} className="max-w-lg mx-auto lg:mx-0 w-full animate-in fade-in duration-500">
            {tab === "signin" ? (
              <div className="space-y-5 lg:space-y-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight font-bold text-white">
                  Hub de Boas Vindas <span style={{ color: "#5EEAD4" }}>Inteligente</span>
                </h1>
                <p className="text-base lg:text-lg text-white/85 leading-relaxed max-w-md">
                  Encante seu hóspede desde o primeiro momento com um guia digital completo da sua hospedagem.
                </p>
              </div>
            ) : (
              <div className="space-y-5 lg:space-y-7">
                <div className="flex justify-start lg:justify-end">
                  <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase font-semibold px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#5EEAD4]">
                    30 dias grátis · Sem cartão
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-[44px] leading-[1.1] tracking-tight font-bold text-white">
                  Falta apenas um passo para{" "}
                  <span style={{ color: "#5EEAD4" }}>profissionalizar</span> seu imóvel
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-white/85 leading-relaxed">
                  Monte o seu guia digital hoje e garanta acesso imediato a todas as vantagens:
                </p>
                <ul className="space-y-3 lg:space-y-4 pt-1">
                  {[
                    {
                      title: "30 dias grátis no plano Single",
                      desc: "Sem pegadinhas e sem precisar de cartão de crédito.",
                    },
                    {
                      title: "Bônus 1: Scripts de Mensagens para WhatsApp",
                      desc: "Modelos prontos, copia e cola.",
                    },
                    {
                      title: "Bônus 2: Guia Prático de Automação para Anfitriões",
                      desc: "Para escalar sem perder o toque humano.",
                    },
                    {
                      title: "Suporte humano via WhatsApp",
                      desc: "Direto com a gente para te ajudar na configuração.",
                    },
                  ].map((item) => (
                    <li key={item.title} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 lg:h-6 lg:w-6 shrink-0 items-center justify-center rounded-full bg-[#5EEAD4]/15 border border-[#5EEAD4]/40">
                        <Check className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-[#5EEAD4]" strokeWidth={3} />
                      </span>
                      <div className="leading-snug">
                        <p className="text-sm lg:text-[15px] font-semibold text-white">{item.title}</p>
                        <p className="text-xs lg:text-sm text-white/70">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer copyright — desktop only inside hero */}
        <p className="hidden lg:block absolute bottom-8 left-12 right-12 z-10 text-white/50 text-xs leading-relaxed max-w-md">
          © 2026 –{" "}
          <a href="http://mrflow.com.br" target="_blank" rel="noreferrer noopener" className="underline hover:text-white/80">
            Mr. Flow Automações e Serviços Digitais LTDA
          </a>{" "}
          – CNPJ 57.466.519/0001-87 – Todos os direitos reservados.
        </p>
      </div>

      {/* Form side */}
      <div className="flex flex-col items-center justify-center p-6 bg-[#f6f6f7]">
        <Card className="w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-2xl border-0 bg-white">


          <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogle}
              disabled={busy}
              className="w-full h-11 rounded-xl mb-4 font-medium"
            >
              <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              Continuar com Google
            </Button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">ou</span></div>
            </div>

            <TabsContent value="signin" className="mt-0">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" name="email" type="email" autoComplete="email" required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="si-password">Senha</Label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                      Esqueci minha senha
                    </Link>
                  </div>
                  <Input id="si-password" name="password" type="password" autoComplete="current-password" required className="h-11 rounded-xl" />
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="su-name">Seu nome</Label>
                  <Input id="su-name" name="full_name" required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" name="email" type="email" autoComplete="email" required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-password">Senha</Label>
                  <Input id="su-password" name="password" type="password" autoComplete="new-password" required className="h-11 rounded-xl" />
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar conta gratuita
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Você começa com 30 dias grátis no plano Single. Sem pegadinhas.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
        <p className="lg:hidden mt-6 text-[11px] leading-relaxed text-center text-muted-foreground max-w-md px-4">
          © 2026 –{" "}
          <a href="http://mrflow.com.br" target="_blank" rel="noreferrer noopener" className="underline hover:opacity-80">
            Mr. Flow Automações e Serviços Digitais LTDA
          </a>{" "}
          – CNPJ 57.466.519/0001-87 – Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
