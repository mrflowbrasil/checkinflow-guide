import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePlanUsage, useTenant } from "@/hooks/useTenant";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Home, ArrowRight, Copy, QrCode, Files, Loader2, Trash2, Sparkles, Download, MoreHorizontal, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { slugify, randomSuffix } from "@/lib/slug";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

type IntegrationRow = {
  provider: "stays" | "hostaway";
  status: string | null;
};

const PROVIDER_LABEL: Record<string, string> = {
  stays: "Stays",
  hostaway: "Hostaway",
};

export default function PropertiesList() {
  const qc = useQueryClient();
  const { data: usage } = usePlanUsage();
  const { data: tenant } = useTenant();
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<"publish" | "unpublish" | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkConfirmed, setBulkConfirmed] = useState(false);

  const { data: integrations } = useQuery<IntegrationRow[]>({
    queryKey: ["tenant_integrations", tenant?.id],
    enabled: !!tenant?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_integrations")
        .select("provider, status")
        .eq("tenant_id", tenant!.id);
      if (error) throw error;
      return (data ?? []) as IntegrationRow[];
    },
    refetchInterval: (q) => {
      const rows = (q.state.data as IntegrationRow[] | undefined) ?? [];
      return rows.some((r) => r.status === "syncing" || r.status === "pending") ? 3000 : false;
    },
  });

  const connected = (integrations ?? []).filter((i) => i.status === "connected");
  const syncing = (integrations ?? []).find((i) => i.status === "syncing");

  // Refetch properties while syncing
  useEffect(() => {
    if (!syncing) return;
    const t = setInterval(() => {
      qc.invalidateQueries({ queryKey: ["properties"] });
    }, 4000);
    return () => clearInterval(t);
  }, [syncing, qc]);

  // Notify when sync completes
  const [wasSyncing, setWasSyncing] = useState(false);
  useEffect(() => {
    if (syncing) {
      setWasSyncing(true);
    } else if (wasSyncing) {
      setWasSyncing(false);
      toast.success("Importação concluída!");
      qc.invalidateQueries({ queryKey: ["properties"] });
    }
  }, [syncing, wasSyncing, qc]);

  const triggerImport = async (provider: "stays" | "hostaway") => {
    setImporting(provider);
    try {
      const { data, error } = await supabase.functions.invoke("integrations-trigger-import", {
        body: { provider },
      });
      if (error) throw error;
      if (!data?.ok) {
        toast.error(data?.message ?? data?.error ?? "Falha ao iniciar importação.");
        return;
      }
      toast.info("Importação iniciada. Os imóveis aparecerão automaticamente.");
      qc.invalidateQueries({ queryKey: ["tenant_integrations"] });
    } catch (e: any) {
      toast.error(e.message ?? "Erro inesperado.");
    } finally {
      setImporting(null);
    }
  };

  const deleteProperty = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("properties").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      toast.success("Imóvel excluído!");
      qc.invalidateQueries({ queryKey: ["properties"] });
      setDeleteTarget(null);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao excluir imóvel");
    } finally {
      setDeleting(false);
    }
  };

  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties", tenant?.id],
    enabled: !!tenant?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, tenant_id, name, address, status, public_slug, cover_image_url")
        .eq("tenant_id", tenant!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/g/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  const duplicateProperty = async (sourceId: string) => {
    setDuplicatingId(sourceId);
    try {
      // 1) Load full source property
      const { data: src, error: srcErr } = await supabase
        .from("properties")
        .select("*")
        .eq("id", sourceId)
        .single();
      if (srcErr) throw srcErr;

      // 2) Insert new property (trigger will seed default pages)
      const newName = `${src.name} (cópia)`;
      const newSlug = `${slugify(newName)}-${randomSuffix(5)}`;
      const { data: newProp, error: insErr } = await supabase
        .from("properties")
        .insert({
          tenant_id: src.tenant_id,
          name: newName,
          external_id: src.external_id,
          address: src.address,
          description: src.description,
          booking_url: src.booking_url,
          cover_image_url: src.cover_image_url,
          public_slug: newSlug,
          status: "inactive", // sempre inicia como rascunho
        })
        .select("id")
        .single();
      if (insErr) throw insErr;

      // 3) Load source pages + blocks
      const { data: srcPages, error: pErr } = await supabase
        .from("property_pages")
        .select("id, page_key, title, icon, position, is_enabled")
        .eq("property_id", sourceId);
      if (pErr) throw pErr;

      const { data: newPages, error: npErr } = await supabase
        .from("property_pages")
        .select("id, page_key")
        .eq("property_id", newProp.id);
      if (npErr) throw npErr;

      const newPageByKey = new Map(newPages!.map((p) => [p.page_key, p.id]));

      // 4) Sync page settings (title/icon/position/enabled)
      for (const sp of srcPages!) {
        const npId = newPageByKey.get(sp.page_key);
        if (!npId) continue;
        await supabase
          .from("property_pages")
          .update({ title: sp.title, icon: sp.icon, position: sp.position, is_enabled: sp.is_enabled })
          .eq("id", npId);
      }

      // 5) Copy content blocks
      const srcPageIds = srcPages!.map((p) => p.id);
      if (srcPageIds.length > 0) {
        const { data: blocks, error: bErr } = await supabase
          .from("content_blocks")
          .select("page_id, type, data, position")
          .in("page_id", srcPageIds);
        if (bErr) throw bErr;

        if (blocks && blocks.length > 0) {
          const srcIdToKey = new Map(srcPages!.map((p) => [p.id, p.page_key]));
          const payload = blocks
            .map((b) => {
              const key = srcIdToKey.get(b.page_id);
              const newPageId = key ? newPageByKey.get(key) : null;
              if (!newPageId) return null;
              return { page_id: newPageId, type: b.type, data: b.data, position: b.position };
            })
            .filter(Boolean) as any[];
          if (payload.length > 0) {
            const { error: cbErr } = await supabase.from("content_blocks").insert(payload);
            if (cbErr) throw cbErr;
          }
        }
      }

      toast.success("Imóvel duplicado!");
      qc.invalidateQueries({ queryKey: ["properties"] });
    } catch (e: any) {
      const msg = e?.message?.includes("property_limit_reached")
        ? "Você atingiu o limite de imóveis do seu plano. Faça upgrade para duplicar."
        : e.message ?? "Erro ao duplicar imóvel";
      toast.error(msg);
    } finally {
      setDuplicatingId(null);
    }
  };

  const inactiveCount = properties?.filter((p) => p.status !== "active").length ?? 0;
  const activeCount = properties?.filter((p) => p.status === "active").length ?? 0;

  const runBulk = async () => {
    if (!tenant?.id || !bulkAction) return;
    setBulkLoading(true);
    try {
      const newStatus = bulkAction === "publish" ? "active" : "inactive";
      const fromStatus = bulkAction === "publish" ? "inactive" : "active";
      const { error } = await supabase
        .from("properties")
        .update({ status: newStatus })
        .eq("tenant_id", tenant.id)
        .eq("status", fromStatus);
      if (error) throw error;
      toast.success(bulkAction === "publish" ? "Todos os imóveis foram publicados!" : "Todos os imóveis foram despublicados.");
      qc.invalidateQueries({ queryKey: ["properties"] });
      setBulkAction(null);
      setBulkConfirmed(false);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao atualizar imóveis");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-6xl space-y-6 animate-fade-in">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Imóveis</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie seus imóveis e guias do hóspede.</p>
        </div>
        <div className="flex items-center gap-3">
          {usage && (
            <Badge variant="outline" className="gap-1.5 py-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-normal">
                {usage.used} / {usage.unlimited ? "∞" : usage.limit} · Plano {usage.plan?.name}
              </span>
            </Badge>
          )}
          <ImportButton
            connected={connected}
            syncing={!!syncing}
            importing={importing}
            onImport={triggerImport}
          />
          {(properties?.length ?? 0) > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" title="Ações em massa" disabled={bulkLoading}>
                  {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={inactiveCount === 0}
                  onClick={() => { setBulkConfirmed(false); setBulkAction("publish"); }}
                >
                  <Eye className="mr-2 h-4 w-4" /> Publicar todos {inactiveCount > 0 && `(${inactiveCount})`}
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={activeCount === 0}
                  onClick={() => setBulkAction("unpublish")}
                  className="text-destructive focus:text-destructive"
                >
                  <EyeOff className="mr-2 h-4 w-4" /> Despublicar todos {activeCount > 0 && `(${activeCount})`}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {usage?.atLimit ? (
            <Button asChild variant="default">
              <Link to="/app/billing"><Sparkles className="mr-2 h-4 w-4" /> Fazer upgrade</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/app/properties/new"><Plus className="mr-2 h-4 w-4" /> Novo imóvel</Link>
            </Button>
          )}
        </div>
      </header>

      {usage?.atLimit && (
        <Card className="p-4 border-primary/30 bg-primary/5 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 text-sm">
            <strong>Você atingiu o limite do plano {usage.plan?.name}</strong> ({usage.limit} {usage.limit === 1 ? "imóvel" : "imóveis"}).
            Faça upgrade para adicionar mais imóveis.
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-64 animate-pulse" />
          ))}
        </div>
      ) : properties?.length === 0 ? (
        <Card className="p-12 text-center">
          <Home className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground mb-4">Nenhum imóvel cadastrado ainda.</p>
          <Button asChild>
            <Link to="/app/properties/new"><Plus className="mr-2 h-4 w-4" /> Cadastrar primeiro imóvel</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties?.map((p) => (
            <Card key={p.id} className="overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
              <div className="aspect-video bg-muted relative">
                {p.cover_image_url ? (
                  <img src={p.cover_image_url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full grid place-items-center text-muted-foreground">
                    <Home className="h-8 w-8 opacity-40" />
                  </div>
                )}
                <Badge className="absolute top-3 right-3" variant={p.status === "active" ? "default" : "secondary"}>
                  {p.status === "active" ? "Publicado" : "Rascunho"}
                </Badge>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold truncate">{p.name}</h3>
                  {p.address && <p className="text-xs text-muted-foreground truncate mt-0.5">{p.address}</p>}
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="secondary" className="flex-1">
                    <Link to={`/app/properties/${p.id}`}>
                      Editar <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    title="Duplicar imóvel"
                    onClick={() => duplicateProperty(p.id)}
                    disabled={duplicatingId === p.id}
                  >
                    {duplicatingId === p.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Files className="h-4 w-4" />
                    )}
                  </Button>
                  {p.status === "active" && (
                    <>
                      <Button size="icon" variant="outline" onClick={() => copyLink(p.public_slug)} title="Copiar link">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button asChild size="icon" variant="outline" title="QR Code">
                        <Link to={`/app/properties/${p.id}#qr`}><QrCode className="h-4 w-4" /></Link>
                      </Button>
                    </>
                  )}
                  <Button
                    size="icon"
                    variant="outline"
                    title="Excluir imóvel"
                    onClick={() => setDeleteTarget({ id: p.id, name: p.name })}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir imóvel?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget?.name}</strong>? Esta ação não pode ser desfeita e todas as páginas e conteúdos associados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); deleteProperty(); }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ImportButton({
  connected,
  syncing,
  importing,
  onImport,
}: {
  connected: IntegrationRow[];
  syncing: boolean;
  importing: string | null;
  onImport: (provider: "stays" | "hostaway") => void;
}) {
  const disabled = connected.length === 0 || syncing || !!importing;
  const tooltip =
    connected.length === 0
      ? "Conecte uma integração em Integrações para importar imóveis."
      : syncing
      ? "Importação em andamento…"
      : "";

  // Single connected provider → direct button
  if (connected.length === 1) {
    const provider = connected[0].provider;
    return (
      <Button
        variant="outline"
        disabled={disabled}
        title={tooltip}
        onClick={() => onImport(provider)}
      >
        {syncing || importing ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {syncing ? "Importando…" : `Importar de ${PROVIDER_LABEL[provider]}`}
      </Button>
    );
  }

  // 0 or multiple → dropdown (disabled when 0)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled} title={tooltip}>
          {syncing || importing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {syncing ? "Importando…" : "Importar imóveis"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {connected.map((i) => (
          <DropdownMenuItem key={i.provider} onClick={() => onImport(i.provider)}>
            Importar de {PROVIDER_LABEL[i.provider]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
