import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { slugify, randomSuffix } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { CatalogProperty } from "@/pages/dashboard/Catalog";

const Schema = z.object({
  name: z.string().trim().min(2, "Nome obrigatório").max(120),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  max_guests: z.coerce.number().int().min(1).max(50).optional().or(z.literal("" as any)),
  base_price: z.coerce.number().min(0).max(1_000_000).optional().or(z.literal("" as any)),
  cover_image_url: z.string().trim().url("URL inválida").max(2048).optional().or(z.literal("")),
  booking_url: z.string().trim().url("URL inválida").max(2048).optional().or(z.literal("")),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string | null;
  property: CatalogProperty | null;
  onSaved: () => void;
};

export function ManualPropertyDialog({ open, onOpenChange, tenantId, property, onSaved }: Props) {
  const editing = !!property;
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [maxGuests, setMaxGuests] = useState<string>("");
  const [basePrice, setBasePrice] = useState<string>("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(property?.name ?? "");
    setCity(property?.city ?? "");
    setMaxGuests(property?.max_guests ? String(property.max_guests) : "");
    setBasePrice(property?.base_price ? String(property.base_price) : "");
    setCoverImageUrl(property?.cover_image_url ?? "");
    setBookingUrl(property?.booking_url ?? "");
  }, [open, property]);

  const submit = async () => {
    if (!tenantId) return;
    const parsed = Schema.safeParse({ name, city, max_guests: maxGuests, base_price: basePrice, cover_image_url: coverImageUrl, booking_url: bookingUrl });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: parsed.data.name,
        city: parsed.data.city || null,
        max_guests: parsed.data.max_guests ? Number(parsed.data.max_guests) : null,
        base_price: parsed.data.base_price ? Number(parsed.data.base_price) : null,
        cover_image_url: parsed.data.cover_image_url || null,
        booking_url: parsed.data.booking_url || null,
      };

      if (editing && property) {
        const { error } = await supabase.from("properties").update(payload).eq("id", property.id);
        if (error) throw error;
        toast.success("Imóvel atualizado.");
      } else {
        const baseSlug = slugify(parsed.data.name) || "imovel";
        const public_slug = `${baseSlug}-${randomSuffix(6)}`;
        const { error } = await supabase.from("properties").insert({
          ...payload,
          tenant_id: tenantId,
          public_slug,
          source: "manual",
          status: "active",
        });
        if (error) throw error;
        toast.success("Imóvel adicionado.");
      }
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar imóvel" : "Adicionar imóvel"}</DialogTitle>
          <DialogDescription>
            Esses dados aparecem no seu catálogo público. Os campos não preenchidos ficam ocultos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do imóvel *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guests">Capacidade</Label>
              <Input id="guests" type="number" min={1} value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Preço base por noite (R$)</Label>
            <Input id="price" type="number" min={0} step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover">URL da foto de capa</Label>
            <Input id="cover" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="booking">URL de reserva (fallback)</Label>
            <Textarea id="booking" rows={2} value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} placeholder="https://..." />
            <p className="text-xs text-muted-foreground">
              Usada quando o webhook de disponibilidade não retornar um link específico.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editing ? "Salvar" : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
