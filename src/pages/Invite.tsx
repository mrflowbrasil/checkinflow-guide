import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Home, Loader2, AlertCircle, Mail } from "lucide-react";
import mrFlowLogoWhite from "@/assets/mrflow-logo-white.png";

const passwordSchema = z.string().min(8, "Mínimo 8 caracteres").max(72);
const nameSchema = z.string().trim().min(2, "Nome muito curto").max(80);

type Invitation = {
  id: string;
  email: string;
  plan_code: string;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
};

export default function Invite() {
  const { token } = useParams<{ token: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data, error } = await supabase
        .from("invitations")
        .select("id, email, plan_code, expires_at, accepted_at, revoked_at")
        .eq("token", token)
        .maybeSingle();
      if (error || !data) {
        setError("Convite não encontrado.");
      } else if (data.revoked_at) {
        setError("Este convite foi revogado.");
      } else if (data.accepted_at) {
        setError("Este convite já foi utilizado. Faça login normalmente.");
      } else if (new Date(data.expires_at) < new Date()) {
        setError("Este convite expirou. Solicite um novo ao administrador.");
      } else {
        setInvitation(data as Invitation);
      }
      setLoading(false);
    })();
  }, [token]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user) return <Navigate to="/app" replace />;

  const handleAccept = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!invitation) return;
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const fullName = String(fd.get("full_name") ?? "");
    const nv = nameSchema.safeParse(fullName);
    const pv = passwordSchema.safeParse(password);
    if (!nv.success) return toast.error(nv.error.issues[0].message);
    if (!pv.success) return toast.error(pv.error.issues[0].message);

    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: invitation.email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { full_name: fullName },
      },
    });
    setBusy(false);
    if (error) {
      if (error.message.includes("signup_requires_invitation")) {
        return toast.error("Convite inválido ou expirado.");
      }
      return toast.error(error.message);
    }
    toast.success("Conta criada! Verifique seu email para confirmar.");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#020617]">
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
          <h1 className="text-5xl leading-[1.05] tracking-tight text-white font-bold">
            Você foi <span style={{ color: "#00FFFF" }}>convidado</span>
          </h1>
          <p className="text-lg max-w-md leading-relaxed" style={{ color: "#00FF00" }}>
            Crie sua conta para começar a transformar a experiência dos seus hóspedes.
          </p>
        </div>
        <p className="text-white/40 text-sm relative">© Mr Flow</p>
      </div>

      <div className="flex items-center justify-center p-6 bg-[#f6f6f7]">
        <Card className="w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-2xl border-0 bg-white">
          <div className="lg:hidden flex flex-col items-start gap-1 mb-8">
            <img src={mrFlowLogoWhite} alt="Mr Flow" className="h-9 w-auto invert" />
            <span className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Welcome Hub</span>
          </div>

          {error ? (
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-xl font-semibold">Convite inválido</h2>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button asChild variant="outline">
                <Link to="/auth"><Home className="mr-2 h-4 w-4" /> Ir para login</Link>
              </Button>
            </div>
          ) : invitation ? (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Convite</span>
                </div>
                <h2 className="text-2xl font-semibold">Crie sua conta</h2>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Badge variant="outline" className="font-normal">{invitation.email}</Badge>
                  <Badge className="capitalize">Plano {invitation.plan_code}</Badge>
                </div>
              </div>

              <form onSubmit={handleAccept} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="su-name">Seu nome</Label>
                  <Input id="su-name" name="full_name" required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-password">Crie uma senha</Label>
                  <Input id="su-password" name="password" type="password" autoComplete="new-password" minLength={8} required className="h-11 rounded-xl" />
                  <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar minha conta
                </Button>
              </form>
            </>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
