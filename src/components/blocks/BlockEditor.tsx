import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BlockBase } from "@/lib/blocks";
import { BLOCK_LABELS, youtubeEmbedUrl, MAX_VIDEO_MB, ACCEPTED_VIDEO_TYPES } from "@/lib/blocks";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GripVertical, Trash2, Plus, X, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function BlockEditor({
  block,
  tenantId,
  onChange,
  onDelete,
}: {
  block: BlockBase;
  tenantId: string;
  onChange: (data: any) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-4 shadow-card group"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing pt-1"
          aria-label="Reordenar"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0 space-y-3">
          <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
            {BLOCK_LABELS[block.type]}
          </div>
          <BlockBody block={block} tenantId={tenantId} onChange={onChange} />
        </div>
        <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

function BlockBody({ block, tenantId, onChange }: { block: BlockBase; tenantId: string; onChange: (data: any) => void }) {
  const d = block.data ?? {};
  switch (block.type) {
    case "text":
      return (
        <Textarea
          value={d.content ?? ""}
          onChange={(e) => onChange({ ...d, content: e.target.value })}
          placeholder="Digite seu texto..."
          rows={3}
        />
      );
    case "subtitle":
      return (
        <Input
          value={d.content ?? ""}
          onChange={(e) => onChange({ ...d, content: e.target.value })}
          placeholder="Subtítulo"
          className="text-lg font-semibold"
        />
      );
    case "image":
      return <ImageBlockBody data={d} tenantId={tenantId} onChange={onChange} />;
    case "video":
      return <VideoBlockBody data={d} tenantId={tenantId} onChange={onChange} />;
    case "steps":
      return <StepsBody data={d} onChange={onChange} />;
    case "tip":
      return (
        <div className="space-y-2">
          <Select value={d.variant ?? "info"} onValueChange={(v) => onChange({ ...d, variant: v })}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Informação</SelectItem>
              <SelectItem value="warning">Atenção</SelectItem>
              <SelectItem value="success">Sucesso</SelectItem>
            </SelectContent>
          </Select>
          <Textarea value={d.content ?? ""} onChange={(e) => onChange({ ...d, content: e.target.value })} placeholder="Texto da dica..." rows={2} />
        </div>
      );
    case "button":
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input value={d.label ?? ""} onChange={(e) => onChange({ ...d, label: e.target.value })} placeholder="Texto do botão" />
            <Select value={d.action ?? "copy"} onValueChange={(v) => onChange({ ...d, action: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="copy">Copiar texto</SelectItem>
                <SelectItem value="link">Abrir link</SelectItem>
                <SelectItem value="download">Baixar arquivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input value={d.value ?? ""} onChange={(e) => onChange({ ...d, value: e.target.value })}
                 placeholder={d.action === "copy" ? "Texto a copiar (ex: senha do Wi-Fi)" : "URL"} />
        </div>
      );
    case "list":
      return <ListBody data={d} onChange={onChange} />;
    case "password":
      return (
        <div className="space-y-2">
          <Input
            value={d.label ?? ""}
            onChange={(e) => onChange({ ...d, label: e.target.value })}
            placeholder="Rótulo (ex: Senha do Wi-Fi)"
          />
          <Input
            value={d.value ?? ""}
            onChange={(e) => onChange({ ...d, value: e.target.value })}
            placeholder="Valor da senha"
            type="text"
          />
        </div>
      );
  }
}

function ImageBlockBody({ data, tenantId, onChange }: any) {
  const [busy, setBusy] = useState(false);
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast.error("Imagem maior que 5MB");
    setBusy(true);
    const ext = f.name.split(".").pop() ?? "jpg";
    const path = `${tenantId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("block-media").upload(path, f, { upsert: true });
    setBusy(false);
    if (error) return toast.error(error.message);
    const url = supabase.storage.from("block-media").getPublicUrl(path).data.publicUrl;
    onChange({ ...data, url });
  };
  return (
    <div className="space-y-2">
      {data.url ? (
        <img src={data.url} alt="" className="rounded-lg max-h-60 object-cover" />
      ) : (
        <div className="h-32 border-2 border-dashed rounded-lg grid place-items-center text-muted-foreground">
          <Upload className="h-6 w-6" />
        </div>
      )}
      <div className="flex gap-2">
        <input type="file" accept="image/*" id={`img-${crypto.randomUUID()}`} className="hidden"
               onChange={upload} />
        <Button type="button" variant="outline" size="sm" disabled={busy} asChild>
          <label className="cursor-pointer">
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {data.url ? "Trocar imagem" : "Upload"}
            <input type="file" accept="image/*" className="hidden" onChange={upload} />
          </label>
        </Button>
      </div>
      <Input value={data.caption ?? ""} onChange={(e) => onChange({ ...data, caption: e.target.value })} placeholder="Legenda (opcional)" />
    </div>
  );
}

function StepsBody({ data, onChange }: any) {
  const items = data.items ?? [];
  const update = (i: number, patch: any) => onChange({ ...data, items: items.map((it: any, idx: number) => idx === i ? { ...it, ...patch } : it) });
  const add = () => onChange({ ...data, items: [...items, { title: "" }] });
  const remove = (i: number) => onChange({ ...data, items: items.filter((_: any, idx: number) => idx !== i) });
  return (
    <div className="space-y-2">
      {items.map((it: any, i: number) => (
        <div key={i} className="flex gap-2 items-start p-2 bg-muted/50 rounded-lg">
          <span className="h-6 w-6 rounded-full bg-accent-soft text-accent-foreground grid place-items-center text-xs font-semibold shrink-0 mt-1">{i + 1}</span>
          <div className="flex-1 space-y-1">
            <Input value={it.title} onChange={(e) => update(i, { title: e.target.value })} placeholder={`Passo ${i + 1}`} />
            <Input value={it.detail ?? ""} onChange={(e) => update(i, { detail: e.target.value })} placeholder="Detalhe (opcional)" />
          </div>
          <Button size="icon" variant="ghost" onClick={() => remove(i)}><X className="h-4 w-4" /></Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="ghost" onClick={add}><Plus className="mr-2 h-3.5 w-3.5" /> Adicionar passo</Button>
    </div>
  );
}

function ListBody({ data, onChange }: any) {
  const items = data.items ?? [];
  const update = (i: number, text: string) => onChange({ ...data, items: items.map((it: any, idx: number) => idx === i ? { ...it, text } : it) });
  const add = () => onChange({ ...data, items: [...items, { text: "" }] });
  const remove = (i: number) => onChange({ ...data, items: items.filter((_: any, idx: number) => idx !== i) });
  return (
    <div className="space-y-2">
      {items.map((it: any, i: number) => (
        <div key={i} className="flex gap-2">
          <Input value={it.text} onChange={(e) => update(i, e.target.value)} placeholder="Item da lista" />
          <Button size="icon" variant="ghost" onClick={() => remove(i)}><X className="h-4 w-4" /></Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="ghost" onClick={add}><Plus className="mr-2 h-3.5 w-3.5" /> Adicionar item</Button>
    </div>
  );
}

export function AddBlockMenu({ onAdd }: { onAdd: (type: BlockBase["type"]) => void }) {
  const types: BlockBase["type"][] = ["text", "subtitle", "image", "video", "steps", "tip", "button", "list", "password"];
  return (
    <div className="grid grid-cols-2 gap-2 p-3 w-full">
      {types.map((t) => (
        <Button
          key={t}
          variant="outline"
          size="sm"
          onClick={() => onAdd(t)}
          className="justify-start w-full truncate"
        >
          <Plus className="mr-2 h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{BLOCK_LABELS[t]}</span>
        </Button>
      ))}
    </div>
  );
}
