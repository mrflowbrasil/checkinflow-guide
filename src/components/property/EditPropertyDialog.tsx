import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  property: {
    id: string;
    name: string;
    address: string | null;
    description: string | null;
    booking_url: string | null;
    external_id: string | null;
    cover_image_url: string | null;
    public_slug: string;
    tenant_id: string;
  };
};

export function EditPropertyDialog({ open, onOpenChange, property }: Props) {
  const qc = useQueryClient();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(property.cover_image_url);
  const [busy, setBusy] = useState(false);

  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast.error("Imagem maior que 5MB");
    setCoverFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = useMutation({
    mutationFn: async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const name = String(fd.get("name") ?? "").trim();
      if (name.length < 2) throw new Error("Nome muito curto");

      let coverUrl = property.cover_image_url;
      if (coverFile) {
        const ext = coverFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${property.tenant_id}/${property.public_slug}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("property-covers").upload(path, coverFile, { upsert: true });
        if (upErr) throw upErr;
        coverUrl = supabase.storage.from("property-covers").getPublicUrl(path).data.publicUrl;
      }

      const { error } = await supabase
        .from("properties")
        .update({
          name,
          address: String(fd.get("address") ?? "") || null,
          description: String(fd.get("description") ?? "") || null,
          booking_url: String(fd.get("booking_url") ?? "") || null,
          external_id: String(fd.get("external_id") ?? "") || null,
          cover_image_url: coverUrl,
        })
        .eq("id", property.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Imóvel atualizado!");
      qc.invalidateQueries({ queryKey: ["property", property.id] });
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao salvar"),
    onSettled: () => setBusy(false),
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    setBusy(true);
    save.mutate(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar imóvel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Imagem de capa</Label>
            <div className="flex items-center gap-4">
              <div className="h-24 w-32 rounded-lg bg-muted overflow-hidden grid place-items-center shrink-0">
                {preview ? (
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground opacity-40" />
                )}
              </div>
              <div>
                <input type="file" accept="image/*" id="edit-cover" className="hidden" onChange={onCoverChange} />
                <Button type="button" variant="outline" size="sm" asChild>
                  <label htmlFor="edit-cover" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" /> Trocar imagem
                  </label>
                </Button>
                <p className="text-xs text-muted-foreground mt-2">JPG ou PNG, até 5MB.</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome da propriedade *</Label>
            <Input id="name" name="name" required defaultValue={property.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" name="address" defaultValue={property.address ?? ""} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="external_id">ID externo</Label>
              <Input id="external_id" name="external_id" defaultValue={property.external_id ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking_url">Link de reserva</Label>
              <Input id="booking_url" name="booking_url" type="url" defaultValue={property.booking_url ?? ""} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={property.description ?? ""} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
