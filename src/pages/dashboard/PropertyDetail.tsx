import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePlanFeatures } from "@/hooks/useTenant";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, Download, ExternalLink, Pencil, QrCode as QrIcon, Loader2, GripVertical, RefreshCw, Lock } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { getPageIcon } from "@/lib/page-icons";
import QRCode from "qrcode";
import { EditPropertyDialog } from "@/components/property/EditPropertyDialog";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, useSortable, arrayMove, rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const features = usePlanFeatures();
  const qrCanvas = useRef<HTMLCanvasElement>(null);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [editOpen, setEditOpen] = useState(false);

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*, property_pages(id, page_key, title, icon, position, is_enabled)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const togglePublish = useMutation({
    mutationFn: async (next: "active" | "inactive") => {
      const { error } = await supabase.from("properties").update({ status: next }).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property", id] });
      toast.success("Status atualizado");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const togglePage = useMutation({
    mutationFn: async ({ pageId, enabled }: { pageId: string; enabled: boolean }) => {
      const { error } = await supabase.from("property_pages").update({ is_enabled: enabled }).eq("id", pageId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["property", id] }),
  });

  const reorderPages = useMutation({
    mutationFn: async (items: { id: string; position: number }[]) => {
      // Atualiza em paralelo para refletir nova ordem
      const results = await Promise.all(
        items.map((it) => supabase.from("property_pages").update({ position: it.position }).eq("id", it.id))
      );
      const err = results.find((r) => r.error)?.error;
      if (err) throw err;
    },
    onSuccess: () => toast.success("Ordem atualizada"),
    onError: (e: any) => {
      toast.error(e.message);
      qc.invalidateQueries({ queryKey: ["property", id] });
    },
  });

  const rotateSlug = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("rotate_property_slug", { _property_id: id! });
      if (error) throw error;
      return data as string;
    },
    onSuccess: (newSlug) => {
      qc.invalidateQueries({ queryKey: ["property", id] });
      toast.success("Novo link gerado! O link anterior foi invalidado.");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao gerar novo link"),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const current = (property?.property_pages as any[]).slice().sort((a, b) => a.position - b.position);
    const oldIdx = current.findIndex((p) => p.id === active.id);
    const newIdx = current.findIndex((p) => p.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(current, oldIdx, newIdx).map((p, i) => ({ ...p, position: i }));

    // Optimistic update
    qc.setQueryData(["property", id], (old: any) => old ? { ...old, property_pages: next } : old);
    reorderPages.mutate(next.map((p) => ({ id: p.id, position: p.position })));
  };

  useEffect(() => {
    if (!property) return;
    const url = `${window.location.origin}/g/${property.public_slug}`;
    setQrUrl(url);
    if (qrCanvas.current) {
      QRCode.toCanvas(qrCanvas.current, url, { width: 220, margin: 2, color: { dark: "#0F1E3D", light: "#FFFFFF" } });
    }
  }, [property]);

  const copyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    toast.success("Link copiado!");
  };

  const downloadQR = async () => {
    const dataUrl = await QRCode.toDataURL(qrUrl, { width: 800, margin: 2, color: { dark: "#0F1E3D", light: "#FFFFFF" } });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qrcode-${property?.public_slug}.png`;
    a.click();
  };

  if (isLoading) {
    return <div className="container py-12 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }
  if (!property) return <div className="container py-12">Imóvel não encontrado.</div>;

  const pages = (property.property_pages as any[]).sort((a, b) => a.position - b.position);

  return (
    <div className="container py-8 max-w-5xl space-y-6 animate-fade-in">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/app/properties"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
      </Button>

      {/* Header card */}
      <Card className="overflow-hidden shadow-card">
        <div className="aspect-[3/1] bg-muted relative">
          {property.cover_image_url && (
            <img src={property.cover_image_url} alt={property.name} className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-6 text-white">
            <Badge variant={property.status === "active" ? "default" : "secondary"} className="mb-2">
              {property.status === "active" ? "Publicado" : "Rascunho"}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-semibold">{property.name}</h1>
            {property.address && <p className="text-sm opacity-90">{property.address}</p>}
          </div>
        </div>
        <div className="p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Switch
              checked={property.status === "active"}
              onCheckedChange={(v) => togglePublish.mutate(v ? "active" : "inactive")}
            />
            <span className="text-sm font-medium">{property.status === "active" ? "Publicado" : "Despublicado"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-3.5 w-3.5" /> Editar
            </Button>
            {property.status === "active" && (
              <Button asChild variant="outline" size="sm">
                <a href={qrUrl} target="_blank" rel="noreferrer">
                  Ver guia <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </Card>

      <EditPropertyDialog open={editOpen} onOpenChange={setEditOpen} property={property as any} />

      {/* QR + Link */}
      <Card id="qr" className="p-6 shadow-card grid sm:grid-cols-[auto_1fr] gap-6 items-center">
        <canvas ref={qrCanvas} className="border rounded-lg bg-white" />
        <div className="space-y-3 min-w-0">
          <div>
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><QrIcon className="h-3.5 w-3.5" /> LINK PÚBLICO</div>
            <div className="font-mono text-sm break-all bg-muted p-2 rounded">{qrUrl}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={copyLink}><Copy className="mr-2 h-4 w-4" /> Copiar link</Button>
            <Button size="sm" variant="outline" onClick={downloadQR}><Download className="mr-2 h-4 w-4" /> Baixar QR Code</Button>
            {features.slugRotation ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" disabled={rotateSlug.isPending}>
                    {rotateSlug.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Gerar novo link
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Gerar um novo link de acesso?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Isso vai criar uma nova URL para este guia e <strong>invalidar imediatamente o link anterior</strong>.
                      Hóspedes que receberam o link antigo não conseguirão mais acessar — eles verão uma página de "link expirado".
                      Use isso quando trocar a senha da fechadura ou em qualquer mudança sensível.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => rotateSlug.mutate()}>
                      Gerar novo link
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button size="sm" variant="outline" asChild>
                <Link to="/app/billing">
                  <Lock className="mr-2 h-4 w-4" /> URL rotativa (Pro)
                </Link>
              </Button>
            )}
          </div>
          {property.status !== "active" && (
            <p className="text-xs text-muted-foreground">⚠️ O imóvel está despublicado. O link só funcionará após publicar.</p>
          )}
        </div>
      </Card>

      {/* Pages list */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Páginas do guia</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Arraste pelo ícone <GripVertical className="inline h-3.5 w-3.5 align-text-bottom" /> para reordenar. Edite cada categoria que aparece no guia do hóspede.
        </p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={pages.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {pages.map((p) => (
                <SortablePageCard
                  key={p.id}
                  page={p}
                  propertyId={id!}
                  onToggle={(enabled) => togglePage.mutate({ pageId: p.id, enabled })}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

function SortablePageCard({
  page, propertyId, onToggle,
}: {
  page: any;
  propertyId: string;
  onToggle: (enabled: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });
  const Icon = getPageIcon(page.icon);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-3 flex items-center gap-2 shadow-card hover:shadow-card-hover transition-shadow"
    >
      <button
        type="button"
        className="h-8 w-6 grid place-items-center text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
        aria-label="Arrastar para reordenar"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="h-10 w-10 rounded-md bg-accent-soft text-accent-foreground grid place-items-center shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{page.title}</div>
      </div>
      <Switch
        checked={page.is_enabled}
        onCheckedChange={onToggle}
        className="shrink-0"
      />
      <Button asChild size="icon" variant="ghost" className="shrink-0">
        <Link to={`/app/properties/${propertyId}/pages/${page.page_key}`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
    </Card>
  );
}
