import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { supabase } from "@/integrations/supabase/client";
import { useTenant, usePlanFeatures } from "@/hooks/useTenant";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, ExternalLink, Loader2, CheckCircle2, Copy, ClipboardPaste } from "lucide-react";
import { toast } from "sonner";
import { defaultDataFor, type BlockType } from "@/lib/blocks";
import { AddBlockMenu, BlockEditor } from "@/components/blocks/BlockEditor";
import { BlocksRenderer } from "@/components/blocks/BlockRenderer";
import { GuestPagePreview } from "@/components/guest/GuestPagePreview";

type ClipboardPayload = {
  copiedAt: string;
  sourcePropertyId: string;
  sourcePropertyName: string;
  sourcePageKey: string;
  sourcePageTitle: string;
  blocks: Array<{ type: BlockType; data: any; position: number }>;
};

const clipboardKey = (tenantId: string) => `blocks-clipboard:${tenantId}`;

function readClipboard(tenantId: string): ClipboardPayload | null {
  try {
    const raw = localStorage.getItem(clipboardKey(tenantId));
    if (!raw) return null;
    return JSON.parse(raw) as ClipboardPayload;
  } catch {
    return null;
  }
}

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

  const [rotatePromptOpen, setRotatePromptOpen] = useState(false);
  const [rotating, setRotating] = useState(false);

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
    // After saving the lock_code page, prompt to rotate the public link
    if (pageKey === "lock_code") {
      setRotatePromptOpen(true);
    }
  };

  const handleRotateSlug = async () => {
    if (!id) return;
    setRotating(true);
    const { data: newSlug, error } = await supabase.rpc("rotate_property_slug", { _property_id: id });
    setRotating(false);
    if (error) {
      toast.error(error.message ?? "Erro ao gerar novo link");
      return;
    }
    setRotatePromptOpen(false);
    qc.invalidateQueries({ queryKey: ["page", id, pageKey] });
    qc.invalidateQueries({ queryKey: ["property", id] });
    const newUrl = `${window.location.origin}/g/${newSlug}`;
    try {
      await navigator.clipboard.writeText(newUrl);
      toast.success("Novo link gerado e copiado para a área de transferência.");
    } catch {
      toast.success("Novo link gerado: " + newUrl);
    }
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

  // ---- Copiar / Colar entre páginas ----
  const [clipboard, setClipboard] = useState<ClipboardPayload | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);

  useEffect(() => {
    if (tenant?.id) setClipboard(readClipboard(tenant.id));
  }, [tenant?.id, pasteOpen]);

  const handleCopy = () => {
    if (!tenant?.id || !data) return;
    if (localBlocks.length === 0) {
      toast.error("Não há blocos para copiar nesta página.");
      return;
    }
    const payload: ClipboardPayload = {
      copiedAt: new Date().toISOString(),
      sourcePropertyId: data.page.properties.id,
      sourcePropertyName: data.page.properties.name,
      sourcePageKey: data.page.page_key,
      sourcePageTitle: data.page.title,
      blocks: localBlocks.map((b, i) => ({ type: b.type, data: b.data, position: i })),
    };
    try {
      localStorage.setItem(clipboardKey(tenant.id), JSON.stringify(payload));
      setClipboard(payload);
      toast.success(`${payload.blocks.length} ${payload.blocks.length === 1 ? "bloco copiado" : "blocos copiados"}`);
    } catch (e: any) {
      toast.error("Não foi possível copiar: " + (e?.message ?? "erro desconhecido"));
    }
  };

  const applyPaste = async (mode: "replace" | "append") => {
    if (!clipboard) return;
    const pasted = clipboard.blocks.map((b) => ({
      id: `tmp-${crypto.randomUUID()}`,
      type: b.type,
      data: b.data,
      position: 0,
    }));
    const next = mode === "replace" ? pasted : [...localBlocks, ...pasted];
    const reindexed = next.map((b, i) => ({ ...b, position: i }));
    setLocalBlocks(reindexed);
    setPasteOpen(false);
    await persistBlocks(reindexed);
    toast.success(
      mode === "replace" ? "Blocos substituídos com sucesso" : "Blocos adicionados ao final",
    );
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
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={localBlocks.length === 0 || savingState === "saving"}
            title="Copiar todos os blocos desta página"
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPasteOpen(true)}
            disabled={!clipboard || savingState === "saving"}
            title={clipboard ? `Colar blocos copiados de ${clipboard.sourcePropertyName}` : "Nenhum bloco copiado"}
          >
            <ClipboardPaste className="mr-1.5 h-3.5 w-3.5" /> Colar
          </Button>
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

      <AlertDialog open={pasteOpen} onOpenChange={setPasteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Colar blocos copiados</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                {clipboard ? (
                  <>
                    <div>
                      <strong>{clipboard.blocks.length}</strong>{" "}
                      {clipboard.blocks.length === 1 ? "bloco copiado" : "blocos copiados"} de{" "}
                      <strong>{clipboard.sourcePropertyName}</strong> /{" "}
                      <strong>{clipboard.sourcePageTitle}</strong>.
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Copiado em {new Date(clipboard.copiedAt).toLocaleString("pt-BR")}
                    </div>
                    <div className="pt-2">Como deseja colar nesta página?</div>
                  </>
                ) : (
                  <div>Nenhum conteúdo copiado.</div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button variant="outline" onClick={() => applyPaste("append")} disabled={!clipboard}>
              Adicionar ao final
            </Button>
            <AlertDialogAction onClick={() => applyPaste("replace")} disabled={!clipboard}>
              Substituir tudo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rotatePromptOpen} onOpenChange={setRotatePromptOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você atualizou a senha da fechadura</AlertDialogTitle>
            <AlertDialogDescription>
              Por segurança, recomendamos gerar um novo link de acesso. Isso vai invalidar imediatamente
              o link anterior, garantindo que apenas hóspedes futuros vejam a nova senha.
              Hóspedes que receberam o link antigo verão uma página de "link expirado".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rotating}>Manter link atual</AlertDialogCancel>
            <AlertDialogAction onClick={handleRotateSlug} disabled={rotating}>
              {rotating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gerar novo link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
