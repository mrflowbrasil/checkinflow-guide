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
import { Loader2, Shield, Copy, X, Mail, Check, KeyRound, Search, Lock, RefreshCw, Eye, EyeOff, Trash2 } from "lucide-react";
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

  // Delete user state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string; tenant_name: string | null } | null>(null);
  const [deleteWorkspace, setDeleteWorkspace] = useState(true);
  const [deleting, setDeleting] = useState(false);

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

  const generateRandomPassword = () => {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnopqrstuvwxyz";
    const digits = "23456789";
    const symbols = "!@#$%&*";
    const all = upper + lower + digits + symbols;
    const arr = new Uint32Array(12);
    crypto.getRandomValues(arr);
    let out = "";
    out += upper[arr[0] % upper.length];
    out += lower[arr[1] % lower.length];
    out += digits[arr[2] % digits.length];
    out += symbols[arr[3] % symbols.length];
    for (let i = 4; i < arr.length; i++) out += all[arr[i] % all.length];
    return out.split("").sort(() => Math.random() - 0.5).join("");
  };

  const openSetPassword = (u: { id: string; email: string }) => {
    setSetPwTarget(u);
    setSetPwValue("");
    setSetPwReason("");
    setSetPwConfirm(false);
    setSetPwShow(false);
  };

  const submitSetPassword = async () => {
    if (!setPwTarget) return;
    if (setPwValue.length < 8 || !/[A-Za-z]/.test(setPwValue) || !/[0-9]/.test(setPwValue)) {
      return toast.error("Senha fraca: mínimo 8 caracteres, letras e números.");
    }
    if (setPwReason.trim().length < 10) {
      return toast.error("Informe um motivo (mín. 10 caracteres) para auditoria.");
    }
    if (!setPwConfirm) {
      return toast.error("Confirme que tentou o fluxo de redefinição padrão antes.");
    }
    setSetPwSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-set-user-password", {
        body: {
          userId: setPwTarget.id,
          email: setPwTarget.email,
          password: setPwValue,
          reason: setPwReason.trim(),
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).message ?? (data as any).error);
      const result = { email: setPwTarget.email, password: setPwValue };
      setSetPwTarget(null);
      setSetPwResult(result);
      toast.success("Senha definida e usuário notificado por e-mail.");
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao definir senha");
    } finally {
      setSetPwSubmitting(false);
    }
  };

  const openDeleteUser = (u: { id: string; email: string; tenant_name?: string | null }) => {
    setDeleteTarget({ id: u.id, email: u.email, tenant_name: u.tenant_name ?? null });
    setDeleteWorkspace(true);
  };

  const submitDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-delete-user", {
        body: { user_id: deleteTarget.id, delete_workspace: deleteWorkspace },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).message ?? (data as any).error);
      const tenantDeleted = (data as any)?.tenant_deleted;
      const keptReason = (data as any)?.tenant_kept_reason;
      if (tenantDeleted) {
        toast.success("Usuário e workspace excluídos.");
      } else if (keptReason === "has_properties") {
        toast.success("Usuário excluído. Workspace mantido (possui imóveis).");
      } else if (keptReason === "has_other_members") {
        toast.success("Usuário excluído. Workspace mantido (possui outros membros).");
      } else {
        toast.success("Usuário excluído.");
      }
      setDeleteTarget(null);
      qc.invalidateQueries({ queryKey: ["admin_users"] });
      qc.invalidateQueries({ queryKey: ["all_tenants"] });
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao excluir usuário");
    } finally {
      setDeleting(false);
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
              Por padrão, envie um <strong>link de redefinição</strong> — o usuário escolhe a nova senha (fluxo seguro e em conformidade com a LGPD).
              Use <strong>"Definir senha"</strong> apenas como fallback (ex.: o cliente não recebe o e-mail). Toda ação é registrada em auditoria e o titular é notificado por e-mail.
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
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setResetTarget({ id: u.id, email: u.email })}
                    title="Enviar link de redefinição de senha"
                  >
                    <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                    Redefinir
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openSetPassword({ id: u.id, email: u.email })}
                    title="Definir senha diretamente (fallback)"
                    className="border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
                  >
                    <Lock className="h-3.5 w-3.5 mr-1.5" />
                    Definir senha
                  </Button>
                  {u.id !== user?.id && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openDeleteUser({ id: u.id, email: u.email, tenant_name: u.tenant_name })}
                      title="Excluir usuário"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Excluir
                    </Button>
                  )}
                </div>
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

          {/* Delete user */}
          <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && !deleting && setDeleteTarget(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-2">
                    <div>
                      Esta ação é <strong>irreversível</strong>. O usuário <strong>{deleteTarget?.email}</strong>
                      {deleteTarget?.tenant_name ? <> (workspace <strong>{deleteTarget.tenant_name}</strong>)</> : null}
                      {" "}será removido permanentemente do login e do banco.
                    </div>
                    <label className="flex items-start gap-2 text-sm cursor-pointer pt-2">
                      <Checkbox
                        checked={deleteWorkspace}
                        onCheckedChange={(v) => setDeleteWorkspace(!!v)}
                        className="mt-0.5"
                      />
                      <span>
                        Excluir também o <strong>workspace</strong> e todos os imóveis, páginas, integrações e assinaturas vinculados.
                      </span>
                    </label>
                    {deleteWorkspace && (
                      <div className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded p-2">
                        Atenção: todos os imóveis, conteúdos e assinaturas deste workspace serão apagados.
                      </div>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={submitDeleteUser}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Excluir definitivamente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>


          {/* Set password (LGPD fallback) */}
          <Dialog open={!!setPwTarget} onOpenChange={(o) => !o && setSetPwTarget(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Definir senha diretamente</DialogTitle>
                <DialogDescription>
                  Use apenas como fallback quando o e-mail de redefinição não chegar.
                  O titular será <strong>notificado por e-mail</strong> e a ação ficará registrada em auditoria (LGPD).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  Usuário: <strong>{setPwTarget?.email}</strong>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-pw">Nova senha</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="new-pw"
                        type={setPwShow ? "text" : "password"}
                        value={setPwValue}
                        onChange={(e) => setSetPwValue(e.target.value)}
                        placeholder="Mín. 8 caracteres, letras e números"
                      />
                      <button
                        type="button"
                        onClick={() => setSetPwShow((s) => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label="Mostrar/ocultar senha"
                      >
                        {setPwShow ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => { setSetPwValue(generateRandomPassword()); setSetPwShow(true); }}
                      title="Gerar senha aleatória"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pw-reason">Motivo (auditoria)</Label>
                  <Textarea
                    id="pw-reason"
                    value={setPwReason}
                    onChange={(e) => setSetPwReason(e.target.value)}
                    placeholder="Ex.: Cliente não recebe o e-mail de redefinição (verificado spam e contato seguro)."
                    rows={3}
                  />
                </div>
                <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
                  <Checkbox
                    checked={setPwConfirm}
                    onCheckedChange={(v) => setSetPwConfirm(!!v)}
                    className="mt-0.5"
                  />
                  <span>Confirmo que tentei o fluxo de redefinição padrão (e-mail) antes desta ação.</span>
                </label>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setSetPwTarget(null)} disabled={setPwSubmitting}>
                  Cancelar
                </Button>
                <Button onClick={submitSetPassword} disabled={setPwSubmitting}>
                  {setPwSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Definir senha
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Show password once after success */}
          <Dialog open={!!setPwResult} onOpenChange={(o) => !o && setSetPwResult(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Senha definida com sucesso</DialogTitle>
                <DialogDescription>
                  Copie a senha abaixo e envie por <strong>canal seguro</strong> ao titular.
                  Esta senha <strong>não será exibida novamente</strong>.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Usuário: <strong>{setPwResult?.email}</strong></div>
                <div className="flex gap-2">
                  <Input readOnly value={setPwResult?.password ?? ""} className="font-mono" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(setPwResult?.password ?? "");
                      toast.success("Senha copiada!");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  O usuário também foi notificado por e-mail de que a senha foi alterada por um administrador.
                </p>
              </div>
              <DialogFooter>
                <Button onClick={() => setSetPwResult(null)}>Fechar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
