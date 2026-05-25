import { Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsSuperAdmin } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Shield, Copy, X, Mail, Check, KeyRound, Search, Lock, RefreshCw, Eye, EyeOff } from "lucide-react";
import WebhooksAdmin from "@/components/admin/WebhooksAdmin";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export default function SuperAdmin() {
  const { user, loading } = useAuth();
  const { data: isAdmin, isLoading: roleLoading } = useIsSuperAdmin();
  const qc = useQueryClient();

  const { data: tenants } = useQuery({
    queryKey: ["all_tenants"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("id, name, slug, is_active, created_at, plan_code, plan_status, properties(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: plans } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("code, name, property_limit, price_cents")
        .eq("is_active", true)
        .order("position");
      if (error) throw error;
      return data;
    },
  });

  const { data: invitations } = useQuery({
    queryKey: ["invitations"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invitations")
        .select("id, email, token, plan_code, expires_at, accepted_at, revoked_at, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePlan, setInvitePlan] = useState("free");
  const [creating, setCreating] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [resetTarget, setResetTarget] = useState<{ id: string; email: string } | null>(null);
  const [resetting, setResetting] = useState(false);

  // Set-password (LGPD fallback) state
  const [setPwTarget, setSetPwTarget] = useState<{ id: string; email: string } | null>(null);
  const [setPwValue, setSetPwValue] = useState("");
  const [setPwReason, setSetPwReason] = useState("");
  const [setPwConfirm, setSetPwConfirm] = useState(false);
  const [setPwShow, setSetPwShow] = useState(false);
  const [setPwSubmitting, setSetPwSubmitting] = useState(false);
  const [setPwResult, setSetPwResult] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setUserQuery(userSearch.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [userSearch]);

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin_users", userQuery],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-list-users", {
        body: { q: userQuery },
      });
      if (error) throw error;
      return data?.users ?? [];
    },
  });

  if (loading || roleLoading) {
    return (
      <div className="container py-12 grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/app" replace />;

  const toggleActive = async (id: string, next: boolean) => {
    await supabase.from("tenants").update({ is_active: next }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["all_tenants"] });
  };

  const updateTenantPlan = async (id: string, plan: string) => {
    const { error } = await supabase.from("tenants").update({ plan_code: plan }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Plano atualizado");
    qc.invalidateQueries({ queryKey: ["all_tenants"] });
  };

  const createInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) return toast.error("Email inválido");
    setCreating(true);
    try {
      const { error } = await supabase.from("invitations").insert({
        email,
        plan_code: invitePlan,
        invited_by: user.id,
      });
      if (error) throw error;
      toast.success("Convite criado!");
      setInviteEmail("");
      qc.invalidateQueries({ queryKey: ["invitations"] });
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao criar convite");
    } finally {
      setCreating(false);
    }
  };

  const revokeInvite = async (id: string) => {
    await supabase.from("invitations").update({ revoked_at: new Date().toISOString() }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["invitations"] });
  };

  const copyInviteLink = (token: string) => {
    // Always use the public production domain for invite links so social previews
    // (WhatsApp, Telegram, etc.) render Mr Flow metadata instead of the Lovable
    // sandbox preview metadata served by *.lovableproject.com.
    const PUBLIC_APP_URL = "https://hub.mrflow.com.br";
    const link = `${PUBLIC_APP_URL}/invite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const inviteStatus = (inv: any) => {
    if (inv.revoked_at) return { label: "Revogado", variant: "destructive" as const };
    if (inv.accepted_at) return { label: "Aceito", variant: "default" as const };
    if (new Date(inv.expires_at) < new Date()) return { label: "Expirado", variant: "secondary" as const };
    return { label: "Pendente", variant: "outline" as const };
  };

  const sendPasswordReset = async () => {
    if (!resetTarget) return;
    setResetting(true);
    try {
      const { error } = await supabase.functions.invoke("admin-send-password-reset", {
        body: { email: resetTarget.email },
      });
      if (error) throw error;
      toast.success(`Link de redefinição enviado para ${resetTarget.email}`);
      setResetTarget(null);
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao enviar link de redefinição");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="container py-8 max-w-6xl space-y-6 animate-fade-in">
      <header className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-accent-foreground" />
        <h1 className="text-2xl font-semibold">Super Admin</h1>
      </header>
      <p className="text-muted-foreground text-sm -mt-4">
        Gerencie workspaces, convites e planos da plataforma.
      </p>

      <Tabs defaultValue="workspaces" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="invitations">Convites</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="workspaces">
          <Card className="shadow-card overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div>Workspace</div>
              <div>Imóveis</div>
              <div>Plano</div>
              <div>Criado</div>
              <div>Ativo</div>
            </div>
            {tenants?.map((t: any) => (
              <div
                key={t.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-4 border-b last:border-0 items-center"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{t.name}</div>
                  <div className="text-xs text-muted-foreground truncate">/{t.slug}</div>
                </div>
                <Badge variant="outline" className="w-fit">
                  {t.properties?.[0]?.count ?? 0} imóveis
                </Badge>
                <Select value={t.plan_code} onValueChange={(v) => updateTenantPlan(t.id, v)}>
                  <SelectTrigger className="h-8 w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {plans?.map((p) => (
                      <SelectItem key={p.code} value={p.code}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground">
                  {new Date(t.created_at).toLocaleDateString("pt-BR")}
                </div>
                <Switch checked={t.is_active} onCheckedChange={(v) => toggleActive(t.id, v)} />
              </div>
            ))}
            {tenants?.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Nenhum workspace ainda.
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="p-5 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por e-mail..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="max-w-sm"
              />
              {usersLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            <p className="text-xs text-muted-foreground">
              Envie um link seguro para o usuário definir uma nova senha. Por segurança, nunca
              definimos a senha diretamente — o usuário receberá um e-mail e escolherá a nova senha.
            </p>
          </Card>

          <Card className="shadow-card overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div>E-mail</div>
              <div>Workspace</div>
              <div>Criado</div>
              <div>Último acesso</div>
              <div>Ações</div>
            </div>
            {(usersData ?? []).map((u: any) => (
              <div
                key={u.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto_auto] gap-3 px-5 py-3 border-b last:border-0 items-center text-sm"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{u.email}</div>
                  {u.full_name && (
                    <div className="text-xs text-muted-foreground truncate">{u.full_name}</div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {u.tenant_name ?? "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString("pt-BR") : "Nunca"}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setResetTarget({ id: u.id, email: u.email })}
                  title="Enviar link de redefinição de senha"
                >
                  <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                  Redefinir senha
                </Button>
              </div>
            ))}
            {!usersLoading && (usersData ?? []).length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Nenhum usuário encontrado.
              </div>
            )}
          </Card>

          <AlertDialog open={!!resetTarget} onOpenChange={(o) => !o && setResetTarget(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Enviar link de redefinição de senha?</AlertDialogTitle>
                <AlertDialogDescription>
                  Um e-mail será enviado para <strong>{resetTarget?.email}</strong> com um link
                  seguro para definir uma nova senha. O link tem validade limitada.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={resetting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={sendPasswordReset} disabled={resetting}>
                  {resetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar e-mail
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <Card className="p-5 shadow-card">
            <h2 className="font-semibold mb-1">Enviar novo convite</h2>
            <p className="text-xs text-muted-foreground mb-4">
              O destinatário receberá um link único para criar a conta. Após criar, copie o link
              e envie por email/WhatsApp.
            </p>
            <form onSubmit={createInvite} className="grid sm:grid-cols-[1fr_180px_auto] gap-3 items-end">
              <div className="space-y-1.5">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="cliente@exemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-plan">Plano</Label>
                <Select value={invitePlan} onValueChange={setInvitePlan}>
                  <SelectTrigger id="invite-plan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {plans?.map((p) => (
                      <SelectItem key={p.code} value={p.code}>
                        {p.name} · {p.property_limit === 999 ? "ilimitado" : `${p.property_limit} imóveis`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                <span className="ml-2">Criar convite</span>
              </Button>
            </form>
          </Card>

          <Card className="shadow-card overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div>Email</div>
              <div>Plano</div>
              <div>Status</div>
              <div>Expira</div>
              <div>Ações</div>
            </div>
            {invitations?.map((inv: any) => {
              const status = inviteStatus(inv);
              const isPending = !inv.accepted_at && !inv.revoked_at && new Date(inv.expires_at) > new Date();
              return (
                <div
                  key={inv.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-5 py-3 border-b last:border-0 items-center text-sm"
                >
                  <div className="font-medium truncate">{inv.email}</div>
                  <Badge variant="outline" className="w-fit capitalize">
                    {inv.plan_code}
                  </Badge>
                  <Badge variant={status.variant} className="w-fit">
                    {inv.accepted_at && <Check className="h-3 w-3 mr-1" />}
                    {status.label}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {new Date(inv.expires_at).toLocaleDateString("pt-BR")}
                  </div>
                  <div className="flex gap-1">
                    {isPending && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyInviteLink(inv.token)}
                          title="Copiar link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => revokeInvite(inv.id)}
                          title="Revogar"
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {invitations?.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Nenhum convite enviado ainda.
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhooksAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}
