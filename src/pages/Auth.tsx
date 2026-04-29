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
import { Home, Loader2 } from "lucide-react";
import mrFlowLogoWhite from "@/assets/mrflow-logo-white.png";

const emailSchema = z.string().trim().email("Email inválido").max(255);
const passwordSchema = z.string().min(8, "Mínimo 8 caracteres").max(72);
const nameSchema = z.string().trim().min(2, "Nome muito curto").max(80);

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

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
    if (error) return toast.error(error.message);
    navigate("/app");
  };

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const fullName = String(fd.get("full_name") ?? "");
    const ev = emailSchema.safeParse(email);
    const pv = passwordSchema.safeParse(password);
    const nv = nameSchema.safeParse(fullName);
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
    toast.success("Conta criada! Faça login para continuar.");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#020617]">
      {/* Hero side */}
      <div
        className="hidden lg:flex p-12 flex-col justify-between relative overflow-hidden text-white"
        style={{
          background:
            "radial-gradient(1200px 600px at 20% 10%, rgba(0,255,255,0.15), transparent 60%), radial-gradient(900px 500px at 80% 90%, rgba(0,140,142,0.25), transparent 60%), linear-gradient(135deg, #020617 0%, #0a1f2e 50%, #062a33 100%)",
        }}
      >
        <Link to="/" className="flex flex-col items-start gap-1 relative">
          <img src={mrFlowLogoWhite} alt="Mr Flow" className="h-10 w-auto" />
          <span className="text-[10px] tracking-[0.25em] text-white/70 uppercase">Welcome Hub</span>
        </Link>
        <div className="relative space-y-6">
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-white">
            Hub de Boas Vindas{" "}
            <span style={{ color: "#00FFFF" }}>Inteligente</span>
          </h1>
          <p
            className="text-lg max-w-md leading-relaxed"
            style={{ color: "#00FF00" }}
          >
            Encante seu hóspede desde o primeiro momento com um guia digital completo da sua hospedagem.
          </p>
        </div>
        <p className="text-white/40 text-sm relative">© Mr Flow</p>
      </div>

      {/* Form side */}
      <div
        className="flex items-center justify-center p-6 lg:bg-transparent"
        style={{
          background:
            "radial-gradient(800px 400px at 50% 0%, rgba(0,255,255,0.08), transparent 60%), linear-gradient(180deg, #020617 0%, #0a1f2e 100%)",
        }}
      >
        <Card className="w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-2xl border-0 bg-white">
          <div className="lg:hidden flex flex-col items-start gap-1 mb-8">
            <img src={mrFlowLogoWhite} alt="Mr Flow" className="h-9 w-auto invert" />
            <span className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Welcome Hub</span>
          </div>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" name="email" type="email" autoComplete="email" required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="si-password">Senha</Label>
                  <Input id="si-password" name="password" type="password" autoComplete="current-password" required className="h-11 rounded-xl" />
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="su-name">Nome</Label>
                  <Input id="su-name" name="full_name" required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" name="email" type="email" autoComplete="email" required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-password">Senha</Label>
                  <Input id="su-password" name="password" type="password" autoComplete="new-password" minLength={8} required className="h-11 rounded-xl" />
                  <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
