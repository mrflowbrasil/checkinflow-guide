import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Plus, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { defaultDataFor, type BlockType } from "@/lib/blocks";
import { AddBlockMenu, BlockEditor } from "@/components/blocks/BlockEditor";
import { BlocksRenderer } from "@/components/blocks/BlockRenderer";
import { GuestPagePreview } from "@/components/guest/GuestPagePreview";

export default function PageEditor() {
  const { id, pageKey } = useParams<{ id: string; pageKey: string }>();
  const { data: tenant } = useTenant();
  const qc = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");

  const { data, isLoading } = useQuery({
    queryKey: ["page", id, pageKey],
    enabled: !!id && !!pageKey,
    queryFn: async () => {
      const { data: page, error } = await supabase
        .from("property_pages")
        .select("*, properties!inner(id, name, public_slug, status)")
        .eq("property_id", id!)
        .eq("page_key", pageKey!)
        .single();
      if (error) throw error;
      const { data: blocks } = await supabase
        .from("content_blocks")
        .select("*")
        .eq("page_id", page.id)
        .order("position");
      return { page, blocks: blocks ?? [] };
    },
  });

  const [localBlocks, setLocalBlocks] = useState<any[]>([]);
  useEffect(() => {
    if (data?.blocks) setLocalBlocks(data.blocks);
  }, [data?.blocks]);

  const persistBlocks = async (blocks: any[]) => {
    if (!data?.page.id) return;
    setSavingState("saving");
    // Strategy: replace all blocks for this page (small data per page).
    await supabase.from("content_blocks").delete().eq("page_id", data.page.id);
    if (blocks.length > 0) {
      const payload = blocks.map((b, i) => ({
        page_id: data.page.id,
        type: b.type,
        data: b.data,
        position: i,
      }));
      const { error } = await supabase.from("content_blocks").insert(payload);
      if (error) {
        toast.error(error.message);
        setSavingState("idle");
        return;
      }
    }
    setSavingState("saved");
    setTimeout(() => setSavingState("idle"), 1500);
    qc.invalidateQueries({ queryKey: ["page", id, pageKey] });
  };

  const isDirty = useMemo(
    () => !!data?.blocks && JSON.stringify(localBlocks) !== JSON.stringify(data.blocks),
    [localBlocks, data?.blocks],
  );

  // Avisa antes de sair com alterações não salvas
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const addBlock = (type: BlockType) => {
    const newBlock = {
      id: `tmp-${crypto.randomUUID()}`,
      type,
      position: localBlocks.length,
      data: defaultDataFor(type),
    };
    setLocalBlocks([...localBlocks, newBlock]);
  };
  const updateBlock = (id: string, patch: any) => {
    setLocalBlocks(localBlocks.map((b) => (b.id === id ? { ...b, data: patch } : b)));
  };
  const deleteBlock = (id: string) => setLocalBlocks(localBlocks.filter((b) => b.id !== id));

  const handleDragEnd = (e: any) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = localBlocks.findIndex((b) => b.id === active.id);
    const newIdx = localBlocks.findIndex((b) => b.id === over.id);
    setLocalBlocks(arrayMove(localBlocks, oldIdx, newIdx));
  };

  const publicUrl = useMemo(() => data?.page ? `${window.location.origin}/g/${data.page.properties.public_slug}` : "", [data]);

  if (isLoading || !data) {
    return <div className="container py-12 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="container py-6 max-w-7xl animate-fade-in">
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link to={`/app/properties/${id}`}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
          </Button>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground truncate">{data.page.properties.name}</div>
            <h1 className="text-lg font-semibold truncate">{data.page.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            {savingState === "saving" && <><Loader2 className="h-3 w-3 animate-spin" /> Salvando...</>}
            {savingState === "saved" && <><CheckCircle2 className="h-3 w-3 text-success" /> Salvo</>}
            {savingState === "idle" && isDirty && <span className="text-warning">Alterações não salvas</span>}
          </span>
          <Button
            size="sm"
            onClick={() => persistBlocks(localBlocks)}
            disabled={!isDirty || savingState === "saving"}
          >
            {savingState === "saving" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
            Salvar
          </Button>
          {publicUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={publicUrl} target="_blank" rel="noreferrer">Ver <ExternalLink className="ml-1.5 h-3.5 w-3.5" /></a>
            </Button>
          )}
        </div>
      </header>

      <Tabs defaultValue="edit">
        <TabsList className="mb-4">
          <TabsTrigger value="edit">Editar</TabsTrigger>
          <TabsTrigger value="preview">Pré-visualizar</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="grid lg:grid-cols-[1fr_380px] gap-6">
          <div className="space-y-3">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={localBlocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                {localBlocks.length === 0 ? (
                  <Card className="p-10 text-center text-muted-foreground border-dashed">
                    Nenhum bloco ainda. Adicione o primeiro abaixo.
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {localBlocks.map((b) => (
                      <BlockEditor
                        key={b.id}
                        block={b}
                        tenantId={tenant?.id ?? ""}
                        onChange={(data) => updateBlock(b.id, data)}
                        onDelete={() => deleteBlock(b.id)}
                      />
                    ))}
                  </div>
                )}
              </SortableContext>
            </DndContext>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full border-dashed">
                  <Plus className="mr-2 h-4 w-4" /> Adicionar bloco
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <AddBlockMenu onAdd={addBlock} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Live mobile preview */}
          <aside className="hidden lg:block sticky top-6 self-start">
            <div className="text-xs text-muted-foreground mb-2 text-center">Pré-visualização mobile</div>
            <div className="mx-auto w-[340px] h-[680px] rounded-[2.5rem] bg-foreground p-3 shadow-hero">
              <div className="rounded-[2rem] overflow-hidden h-full bg-background">
                <GuestPagePreview
                  template={tenant?.template ?? "clean"}
                  pageTitle={data.page.title}
                  pageIcon={data.page.icon}
                  blocks={localBlocks}
                  primaryColor={tenant?.primary_color}
                />
              </div>
            </div>
          </aside>
        </TabsContent>

        <TabsContent value="preview">
          <div className="mx-auto max-w-md">
            <Card className="p-6 shadow-card">
              <h2 className="text-2xl font-semibold mb-4">{data.page.title}</h2>
              <BlocksRenderer blocks={localBlocks as any} />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
