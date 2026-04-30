import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Plug, Loader2, CheckCircle2, AlertCircle, Copy, KeyRound } from "lucide-react";
import { toast } from "sonner";

type Provider = "stays" | "hostaway";

export default function Integrations() {
  const qc = useQueryClient();
  const [openProvider, setOpenProvider] = useState<Provider | null>(null);
  const [systemUrl, setSystemUrl] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  const { data: integrations } = useQuery({
    queryKey: ["tenant_integrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_integrations")
        .select("provider, system_url, status, last_sync_at, last_error");
      if (error) throw error;
      return data;
    },
  });

  const { data: apiKeys } = useQuery({
    queryKey: ["tenant_api_keys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_api_keys")
        .select("id, name, key_prefix, last_used_at, created_at, revoked_at")
        .is("revoked_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const stays = integrations?.find((i) => i.provider === "stays");
  const hostaway = integrations?.find((i) => i.provider === "hostaway");

  const openDialog = (provider: Provider) => {
    const cur = integrations?.find((i) => i.provider === provider);
    setSystemUrl(cur?.system_url ?? "");
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
      toast.success("Conexão iniciada. Estamos sincronizando seus imóveis.");
      if (data.api_key) setNewApiKey(data.api_key);
      setOpenProvider(null);
      qc.invalidateQueries({ queryKey: ["tenant_integrations"] });
      qc.invalidateQueries({ queryKey: ["tenant_api_keys"] });
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
        {/* Stays */}
        <Card className="p-5 shadow-card space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-lg">Stays</h2>
              <p className="text-xs text-muted-foreground">Importa imóveis da sua conta Stays.</p>
            </div>
            <StatusBadge status={stays?.status} />
          </div>
          {stays?.last_sync_at && (
            <p className="text-xs text-muted-foreground">
              Última sincronização: {new Date(stays.last_sync_at).toLocaleString("pt-BR")}
            </p>
          )}
          {stays?.last_error && (
            <p className="text-xs text-destructive truncate" title={stays.last_error}>
              {stays.last_error}
            </p>
          )}
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={() => openDialog("stays")}>
              {stays ? "Reconectar" : "Conectar"}
            </Button>
            {stays && (
              <Button size="sm" variant="ghost" onClick={() => disconnect("stays")}>
                Desconectar
              </Button>
            )}
          </div>
        </Card>

        {/* Hostaway */}
        <Card className="p-5 shadow-card space-y-3 opacity-70">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-lg">Hostaway</h2>
              <p className="text-xs text-muted-foreground">Em breve.</p>
            </div>
            <Badge variant="outline">Em breve</Badge>
          </div>
          <Button size="sm" disabled>
            Conectar
          </Button>
        </Card>
      </div>

      {/* API Keys */}
      <Card className="p-5 shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-accent-foreground" />
          <h2 className="font-semibold">Chave de API</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Esta chave é usada pelo n8n para enviar dados de imóveis para a sua conta. Ela é gerada
          automaticamente quando você conecta um PMS e mostrada apenas uma vez.
        </p>
        {apiKeys?.length ? (
          <div className="space-y-2">
            {apiKeys.map((k) => (
              <div key={k.id} className="flex items-center justify-between text-sm border rounded-md p-2">
                <div>
                  <code className="font-mono text-xs">{k.key_prefix}…</code>
                  <span className="text-muted-foreground ml-2 text-xs">{k.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {k.last_used_at ? `Usada em ${new Date(k.last_used_at).toLocaleDateString("pt-BR")}` : "Nunca usada"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma chave gerada ainda.</p>
        )}
      </Card>

      {/* Connect dialog */}
      <Dialog open={!!openProvider} onOpenChange={(o) => !o && setOpenProvider(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar {openProvider === "stays" ? "Stays" : "Hostaway"}</DialogTitle>
            <DialogDescription>
              Informe os dados de acesso da sua conta. Vamos buscar seus imóveis automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="sys-url">URL do sistema</Label>
              <Input
                id="sys-url"
                placeholder="https://suaempresa.stays.net"
                value={systemUrl}
                onChange={(e) => setSystemUrl(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="login">Login</Label>
              <Input id="login" value={login} onChange={(e) => setLogin(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pwd">Senha</Label>
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

      {/* Show API key once */}
      <Dialog open={!!newApiKey} onOpenChange={(o) => !o && setNewApiKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sua chave de API</DialogTitle>
            <DialogDescription>
              Copie e guarde em local seguro. Por motivos de segurança, ela não será mostrada novamente.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted p-3 rounded-md font-mono text-xs break-all">{newApiKey}</div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (newApiKey) {
                  navigator.clipboard.writeText(newApiKey);
                  toast.success("Chave copiada!");
                }
              }}
            >
              <Copy className="h-4 w-4 mr-2" /> Copiar
            </Button>
            <Button variant="ghost" onClick={() => setNewApiKey(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
