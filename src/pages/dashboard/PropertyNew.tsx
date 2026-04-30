import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useTenant, usePlanUsage } from "@/hooks/useTenant";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { slugify, randomSuffix } from "@/lib/slug";
import { UpgradePromptDialog } from "@/components/billing/UpgradePromptDialog";

const schema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(120),
  external_id: z.string().trim().max(80).optional().or(z.literal("")),
  address: z.string().trim().max(255).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  booking_url: z.string().trim().url("URL inválida").max(500).optional().or(z.literal("")),
});

export default function PropertyNew() {
  const { data: tenant } = useTenant();
  const { data: usage } = usePlanUsage();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast.error("Imagem maior que 5MB");
    setCoverFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tenant) return toast.error("Workspace não carregado");
    if (usage?.atLimit) {
      setShowUpgrade(true);
      return;
    }
    const fd = new FormData(e.currentTarget);
    const raw = {
      name: String(fd.get("name") ?? ""),
      external_id: String(fd.get("external_id") ?? ""),
      address: String(fd.get("address") ?? ""),
      description: String(fd.get("description") ?? ""),
      booking_url: String(fd.get("booking_url") ?? ""),
    };
    const v = schema.safeParse(raw);
    if (!v.success) return toast.error(v.error.issues[0].message);

    setBusy(true);
    try {
      const slug = `${slugify(raw.name)}-${randomSuffix(5)}`;

      let coverUrl: string | null = null;
      if (coverFile) {
        const ext = coverFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${tenant.id}/${slug}.${ext}`;
        const { error: upErr } = await supabase.storage.from("property-covers").upload(path, coverFile, { upsert: true });
        if (upErr) throw upErr;
        coverUrl = supabase.storage.from("property-covers").getPublicUrl(path).data.publicUrl;
      }

      const { data, error } = await supabase
        .from("properties")
        .insert({
          tenant_id: tenant.id,
          name: raw.name,
          external_id: raw.external_id || null,
          address: raw.address || null,
          description: raw.description || null,
          booking_url: raw.booking_url || null,
          cover_image_url: coverUrl,
          public_slug: slug,
        })
        .select("id")
        .single();
      if (error) throw error;

      toast.success("Imóvel criado!");
      navigate(`/app/properties/${data.id}`);
    } catch (err: any) {
      if (err?.message?.includes("property_limit_reached")) {
        setShowUpgrade(true);
      } else {
        toast.error(err.message ?? "Erro ao criar imóvel");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-8 max-w-3xl animate-fade-in">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/app/properties"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
      </Button>

      <h1 className="text-2xl font-semibold mb-1">Novo imóvel</h1>
      <p className="text-muted-foreground text-sm mb-6">Preencha os dados básicos. Você poderá editar tudo depois.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="p-6 space-y-4 shadow-card">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da propriedade *</Label>
            <Input id="name" name="name" required placeholder="Ex: Maison Bleu" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="external_id">ID externo</Label>
              <Input id="external_id" name="external_id" placeholder="Opcional (Stays, Hostaway...)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking_url">Link de reserva</Label>
              <Input id="booking_url" name="booking_url" type="url" placeholder="https://airbnb.com/..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" name="address" placeholder="Avenida Almirante Maximiano Fonseca, 245" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" rows={3} placeholder="Apartamento de 2 quartos com vista para o mar..." />
          </div>
        </Card>

        <Card className="p-6 space-y-4 shadow-card">
          <Label>Imagem de capa</Label>
          <div className="flex items-center gap-4">
            <div className="h-24 w-32 rounded-lg bg-muted overflow-hidden grid place-items-center">
              {preview ? (
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground opacity-40" />
              )}
            </div>
            <div>
              <input type="file" accept="image/*" id="cover" className="hidden" onChange={onCoverChange} />
              <Button type="button" variant="outline" size="sm" asChild>
                <label htmlFor="cover" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" /> Escolher imagem
                </label>
              </Button>
              <p className="text-xs text-muted-foreground mt-2">JPG ou PNG, até 5MB.</p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button asChild variant="ghost"><Link to="/app/properties">Cancelar</Link></Button>
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar imóvel
          </Button>
        </div>
      </form>
    </div>
  );
}
