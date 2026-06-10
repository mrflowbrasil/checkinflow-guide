import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Copy, Download, ExternalLink, Eye, LayoutGrid, Loader2, Plus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

import { ManualPropertyDialog } from "@/components/catalog/ManualPropertyDialog";
import { ImportFromStaysDialog } from "@/components/catalog/ImportFromStaysDialog";
import { CatalogPreviewDialog } from "@/components/catalog/CatalogPreviewDialog";
import { PropertyCatalogCard } from "@/components/catalog/PropertyCatalogCard";

export type CatalogProperty = {
  id: string;
  name: string;
  city: string | null;
  max_guests: number | null;
  base_price: number | null;
  cover_image_url: string | null;
  public_slug: string;
  booking_url: string | null;
  status: "active" | "inactive";
  source: "manual" | "stays" | "hub";
  external_provider: string | null;
};

export default function Catalog() {
  const { data: tenant } = useTenant();
  const qc = useQueryClient();

  const [manualOpen, setManualOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogProperty | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [bio, setBio] = useState<string | null>(null);
  const [savingBio, setSavingBio] = useState(false);

  const propertiesQ = useQuery({
    queryKey: ["catalog-properties", tenant?.id],
    enabled: !!tenant?.id,
    queryFn: async (): Promise<CatalogProperty[]> => {
      const { data, error } = await supabase
        .from("properties")
        .select(
          "id, name, city, max_guests, base_price, cover_image_url, public_slug, booking_url, status, source, external_provider",
        )
        .eq("tenant_id", tenant!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CatalogProperty[];
    },
  });

  const tenantBioQ = useQuery({
    queryKey: ["tenant-bio", tenant?.id],
    enabled: !!tenant?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("tenants")
        .select("catalog_bio")
        .eq("id", tenant!.id)
        .maybeSingle();
      const value = (data as { catalog_bio: string | null } | null)?.catalog_bio ?? "";
      setBio(value);
      return value;
    },
  });

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = tenant ? `${origin}/c/${tenant.slug}` : "";

  const copyLink = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    toast.success("Link copiado!");
  };

  const saveBio = async () => {
    if (!tenant) return;
    setSavingBio(true);
    const { error } = await supabase
      .from("tenants")
      .update({ catalog_bio: bio })
      .eq("id", tenant.id);
    setSavingBio(false);
    if (error) {
      toast.error("Não foi possível salvar.");
      return;
    }
    toast.success("Bio atualizada.");
    qc.invalidateQueries({ queryKey: ["tenant-bio", tenant.id] });
  };

  const refresh = () => qc.invalidateQueries({ queryKey: ["catalog-properties", tenant?.id] });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LayoutGrid className="h-4 w-4" />
          Catálogo
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Catálogo & Link da Bio</h1>
        <p className="text-muted-foreground">
          Reúna seus imóveis em uma página única, otimizada para o Instagram, e deixe seus hóspedes pesquisarem disponibilidade em segundos.
        </p>
      </header>

      <Tabs defaultValue="properties" className="w-full">
        <TabsList>
          <TabsTrigger value="properties">Imóveis</TabsTrigger>
          <TabsTrigger value="link">Link da Bio</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Seus imóveis</h2>
              <p className="text-sm text-muted-foreground">
                {propertiesQ.data?.length ?? 0} imóvel(eis) no catálogo. Apenas os ativos aparecem na página pública.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                <Download className="h-4 w-4 mr-2" />
                Importar da Stays / Hub
              </Button>
              <Button onClick={() => { setEditing(null); setManualOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar manualmente
              </Button>
            </div>
          </div>

          {propertiesQ.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-lg" />
              ))}
            </div>
          ) : (propertiesQ.data?.length ?? 0) === 0 ? (
            <Card>
              <CardContent className="py-12 text-center space-y-3">
                <p className="text-muted-foreground">Nenhum imóvel cadastrado ainda.</p>
                <Button onClick={() => { setEditing(null); setManualOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar meu primeiro imóvel
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {propertiesQ.data!.map((p) => (
                <PropertyCatalogCard
                  key={p.id}
                  property={p}
                  onEdit={() => { setEditing(p); setManualOpen(true); }}
                  onChanged={refresh}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="link" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Seu Link da Bio</CardTitle>
              <CardDescription>
                Copie este link e cole na bio do Instagram. Toda atualização no catálogo aparece automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input readOnly value={publicUrl} className="font-mono text-sm" />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={copyLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                  <Button variant="outline" onClick={() => setPreviewOpen(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  {publicUrl && (
                    <Button asChild variant="ghost">
                      <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personalização</CardTitle>
              <CardDescription>O nome, a logo e as cores vêm das suas configurações do workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio do catálogo</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  maxLength={240}
                  placeholder="Encontre a sua próxima estadia ideal abaixo."
                  value={bio ?? ""}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={tenantBioQ.isLoading}
                />
                <p className="text-xs text-muted-foreground">{(bio ?? "").length}/240</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/app/settings">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Editar logo e cores
                  </Link>
                </Button>
                <Button onClick={saveBio} disabled={savingBio || tenantBioQ.isLoading}>
                  {savingBio && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ManualPropertyDialog
        open={manualOpen}
        onOpenChange={(o) => { setManualOpen(o); if (!o) setEditing(null); }}
        tenantId={tenant?.id ?? null}
        property={editing}
        onSaved={refresh}
      />
      <ImportFromStaysDialog open={importOpen} onOpenChange={setImportOpen} onImported={refresh} />
      <CatalogPreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} url={publicUrl} />
    </div>
  );
}
