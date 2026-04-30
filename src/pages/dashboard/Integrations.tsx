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
import { Plug, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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
  const [openProvider, setOpenProvider] = useState<Provider | null>(null);
  const [systemUrl, setSystemUrl] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      toast.success("Conexão iniciada. Estamos sincronizando seus imóveis.");
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
