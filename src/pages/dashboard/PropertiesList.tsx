import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Home, ArrowRight, Copy, QrCode, Files, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { slugify, randomSuffix } from "@/lib/slug";

export default function PropertiesList() {
  const qc = useQueryClient();
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, tenant_id, name, address, status, public_slug, cover_image_url")
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
      toast.error(e.message ?? "Erro ao duplicar imóvel");
    } finally {
      setDuplicatingId(null);
    }
  };

  return (
    <div className="container py-8 max-w-6xl space-y-6 animate-fade-in">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Imóveis</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie seus imóveis e guias do hóspede.</p>
        </div>
        <Button asChild>
          <Link to="/app/properties/new"><Plus className="mr-2 h-4 w-4" /> Novo imóvel</Link>
        </Button>
      </header>

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
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
