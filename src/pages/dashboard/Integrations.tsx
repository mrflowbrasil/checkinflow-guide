import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant, usePlanFeatures } from "@/hooks/useTenant";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plug, Loader2, CheckCircle2, AlertCircle, Key, Plus, Copy, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Provider = "stays" | "hostaway";

const PROVIDER_META: Record<Provider, {
  title: string;
  description: string;
  loginLabel: string;
  passwordLabel: string;
  urlLabel: string;
  urlPlaceholder: string;
  helper: string;
}> = {
  stays: {
    title: "Stays",
    description: "Importa imóveis da sua conta Stays.",
    loginLabel: "Login",
    passwordLabel: "Senha",
    urlLabel: "URL do sistema",
    urlPlaceholder: "https://suaempresa.stays.net",
    helper:
      "Para conectar, acesse o painel App Center > API Stays na sua conta Stays e ative a API Externa (a Stays cobra R$ 95,00/mês por esse recurso). Use o login e a senha gerados na ativação da API Externa — não os dados de acesso à plataforma.",
  },
  hostaway: {
    title: "Hostaway",
    description: "Importa imóveis da sua conta Hostaway.",
    loginLabel: "Client ID",
    passwordLabel: "Client Secret",
    urlLabel: "URL da API",
    urlPlaceholder: "https://api.hostaway.com/v1",
    helper:
      "Gere um Client ID e Client Secret no painel da Hostaway em Settings > API e cole os valores abaixo.",
  },
};

export default function Integrations() {
  const qc = useQueryClient();
  const { data: tenant } = useTenant();
  const [openProvider, setOpenProvider] = useState<Provider | null>(null);
  const [systemUrl, setSystemUrl] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const prevStatusRef = useRef<Record<string, string | null>>({});

  const { data: integrations } = useQuery({
    queryKey: ["tenant_integrations", tenant?.id],
    enabled: !!tenant?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_integrations")
        .select("provider, system_url, status, last_sync_at, last_error")
        .eq("tenant_id", tenant!.id);
      if (error) throw error;
      return data;
    },
    refetchInterval: (query) => {
      const rows = (query.state.data as Array<{ status: string }> | undefined) ?? [];
      const transitioning = rows.some((r) => r.status === "pending" || r.status === "syncing");
      return transitioning ? 3000 : false;
    },
    refetchOnWindowFocus: true,
  });

  // Toast on status transitions detected via polling/realtime
  useEffect(() => {
    if (!integrations) return;
    for (const row of integrations) {
      const prev = prevStatusRef.current[row.provider];
      if (prev && prev !== row.status) {
        if (row.status === "connected") {
          toast.success(`${PROVIDER_META[row.provider as Provider]?.title ?? row.provider}: conexão estabelecida.`);
        } else if (row.status === "error") {
          toast.error(`${PROVIDER_META[row.provider as Provider]?.title ?? row.provider}: falha ao conectar.`);
        }
      }
      prevStatusRef.current[row.provider] = row.status;
    }
  }, [integrations]);

  // Realtime subscription on tenant_integrations for this tenant
  useEffect(() => {
    if (!tenant?.id) return;
    const channel = supabase
      .channel(`tenant_integrations:${tenant.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tenant_integrations",
          filter: `tenant_id=eq.${tenant.id}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["tenant_integrations"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenant?.id, qc]);


  const stays = integrations?.find((i) => i.provider === "stays");
  const hostaway = integrations?.find((i) => i.provider === "hostaway");

  const openDialog = (provider: Provider) => {
    const cur = integrations?.find((i) => i.provider === provider);
    setSystemUrl(cur?.system_url ?? (provider === "hostaway" ? "https://api.hostaway.com/v1" : ""));
    setLogin("");
    setPassword("");
    setOpenProvider(provider);
  };

  const submit = async () => {
    if (!openProvider) return;
    if (!systemUrl.trim() || !login.trim() || !password.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("integrations-connect", {
        body: { provider: openProvider, system_url: systemUrl.trim(), login: login.trim(), password },
      });
      if (error) throw error;
      if (!data?.ok) {
        const msg = data?.message ?? data?.error ?? "Falha ao conectar.";
        toast.error(msg);
        return;
      }
      toast.success("Credenciais enviadas. Validando conexão…");
      setOpenProvider(null);
      qc.invalidateQueries({ queryKey: ["tenant_integrations"] });
    } catch (e: any) {
      toast.error(e.message ?? "Erro inesperado.");
    } finally {
      setSubmitting(false);
    }
  };

  const disconnect = async (provider: Provider) => {
    if (!confirm(`Desconectar ${provider}?`)) return;
    const { error } = await supabase.functions.invoke("integrations-disconnect", { body: { provider } });
    if (error) return toast.error(error.message);
    toast.success("Integração desconectada.");
    qc.invalidateQueries({ queryKey: ["tenant_integrations"] });
  };

  // ---------- API Keys ----------
  type ApiKeyRow = { id: string; name: string; key_prefix: string; created_at: string; last_used_at: string | null };
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [createKeyOpen, setCreateKeyOpen] = useState(false);
  const [revealedKey, setRevealedKey] = useState<{ name: string; key: string } | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyRow | null>(null);

  const { data: apiKeysData } = useQuery({
    queryKey: ["tenant_api_keys", tenant?.id],
    enabled: !!tenant?.id,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("tenant-api-keys", { method: "GET" });
      if (error) throw error;
      return (data?.items ?? []) as ApiKeyRow[];
    },
  });
  const apiKeys = apiKeysData ?? [];

  const createKey = async () => {
    setCreatingKey(true);
    try {
      const { data, error } = await supabase.functions.invoke("tenant-api-keys", {
        method: "POST",
        body: { name: newKeyName.trim() || "API Key" },
      });
      if (error) throw error;
      if (!data?.api_key) throw new Error("Falha ao gerar chave");
      setRevealedKey({ name: data.name, key: data.api_key });
      setCreateKeyOpen(false);
      setNewKeyName("");
      qc.invalidateQueries({ queryKey: ["tenant_api_keys"] });
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao criar chave");
    } finally {
      setCreatingKey(false);
    }
  };

  const doRevoke = async () => {
    if (!revokeTarget) return;
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tenant-api-keys?id=${revokeTarget.id}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Chave revogada.");
      setRevokeTarget(null);
      qc.invalidateQueries({ queryKey: ["tenant_api_keys"] });
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao revogar");
    }
  };

  const copyKey = async (k: string) => {
    try {
      await navigator.clipboard.writeText(k);
      toast.success("Copiado!");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const StatusBadge = ({ status }: { status?: string | null }) => {
    if (!status) return <Badge variant="outline">Não conectado</Badge>;
    if (status === "connected")
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Conectado
        </Badge>
      );
    if (status === "error")
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" /> Erro
        </Badge>
      );
    return <Badge variant="secondary">Sincronizando…</Badge>;
  };

  const renderCard = (provider: Provider, current: typeof stays) => {
    const meta = PROVIDER_META[provider];
    return (
      <Card className="p-5 shadow-card space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-lg">{meta.title}</h2>
            <p className="text-xs text-muted-foreground">{meta.description}</p>
          </div>
          <StatusBadge status={current?.status} />
        </div>
        {current?.last_sync_at && (
          <p className="text-xs text-muted-foreground">
            Última sincronização: {new Date(current.last_sync_at).toLocaleString("pt-BR")}
          </p>
        )}
        {current?.last_error && (
          <p className="text-xs text-destructive truncate" title={current.last_error}>
            {current.last_error}
          </p>
        )}
        <div className="flex gap-2 pt-2">
          <Button size="sm" onClick={() => openDialog(provider)}>
            {current ? "Reconectar" : "Conectar"}
          </Button>
          {current && (
            <Button size="sm" variant="ghost" onClick={() => disconnect(provider)}>
              Desconectar
            </Button>
          )}
        </div>
      </Card>
    );
  };

  const meta = openProvider ? PROVIDER_META[openProvider] : null;

  return (
    <div className="container py-8 max-w-4xl space-y-6 animate-fade-in">
      <header className="flex items-center gap-2">
        <Plug className="h-5 w-5 text-accent-foreground" />
        <h1 className="text-2xl font-semibold">Integrações</h1>
      </header>
      <p className="text-muted-foreground text-sm -mt-4">
        Conecte sua conta de PMS para importar imóveis automaticamente.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {renderCard("stays", stays)}
        {renderCard("hostaway", hostaway)}
      </div>

      {/* API Keys section */}
      <Card className="p-5 shadow-card space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-accent-foreground" />
            <div>
              <h2 className="font-semibold text-lg">Chaves de API</h2>
              <p className="text-xs text-muted-foreground">
                Use no header <code className="px-1 py-0.5 rounded bg-muted">X-API-Key</code> para autenticar chamadas externas (n8n, scripts).
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => setCreateKeyOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nova chave
          </Button>
        </div>

        {apiKeys.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-md">
            Nenhuma chave ativa. Crie uma para integrar com sistemas externos.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-md border">
            {apiKeys.map((k) => (
              <li key={k.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{k.name}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{k.key_prefix}…</p>
                  <p className="text-[11px] text-muted-foreground">
                    Criada em {new Date(k.created_at).toLocaleDateString("pt-BR")} ·{" "}
                    {k.last_used_at
                      ? `usada em ${new Date(k.last_used_at).toLocaleDateString("pt-BR")}`
                      : "nunca usada"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setRevokeTarget(k)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Dialog open={createKeyOpen} onOpenChange={setCreateKeyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova chave de API</DialogTitle>
            <DialogDescription>Dê um nome para identificar onde esta chave será usada.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="key-name">Nome</Label>
            <Input
              id="key-name"
              placeholder="Ex.: n8n produção"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              maxLength={60}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateKeyOpen(false)}>Cancelar</Button>
            <Button onClick={createKey} disabled={creatingKey}>
              {creatingKey && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Gerar chave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!revealedKey} onOpenChange={(o) => !o && setRevealedKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chave criada: {revealedKey?.name}</DialogTitle>
            <DialogDescription>
              Copie e guarde em local seguro. Por segurança, ela não será exibida novamente.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted/40 p-3 flex items-center gap-2">
            <code className="text-xs flex-1 break-all font-mono">{revealedKey?.key}</code>
            <Button size="sm" variant="outline" onClick={() => revealedKey && copyKey(revealedKey.key)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
            ⚠️ Esta chave dá acesso à API do seu workspace. Não compartilhe publicamente nem comite em repositórios.
          </div>
          <DialogFooter>
            <Button onClick={() => setRevealedKey(null)}>Entendi, fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!revokeTarget} onOpenChange={(o) => !o && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar chave "{revokeTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Qualquer sistema usando esta chave parará de funcionar imediatamente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={doRevoke}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revogar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!openProvider} onOpenChange={(o) => !o && setOpenProvider(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar {meta?.title}</DialogTitle>
            <DialogDescription>
              Informe os dados de acesso da sua conta. Vamos buscar seus imóveis automaticamente.
            </DialogDescription>
          </DialogHeader>

          {meta?.helper && (
            <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-muted pl-3">
              {meta.helper}
            </p>
          )}

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="sys-url">{meta?.urlLabel}</Label>
              <Input
                id="sys-url"
                placeholder={meta?.urlPlaceholder}
                value={systemUrl}
                onChange={(e) => setSystemUrl(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login">{meta?.loginLabel}</Label>
              <Input id="login" value={login} onChange={(e) => setLogin(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pwd">{meta?.passwordLabel}</Label>
              <Input
                id="pwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenProvider(null)}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Conectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
