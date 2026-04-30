import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Palette, Upload, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { LogoCropDialog } from "@/components/property/LogoCropDialog";

const TEMPLATES: { value: "clean" | "dark" | "luxury"; label: string; desc: string; preview: string }[] = [
  { value: "clean", label: "Clean", desc: "Branco + navy + sombras suaves.", preview: "linear-gradient(135deg, #fff 50%, #0F1E3D 50%)" },
  { value: "dark", label: "Dark", desc: "Fundo escuro, alto contraste.", preview: "linear-gradient(135deg, #0F1E3D 50%, #1a2c52 50%)" },
  { value: "luxury", label: "Luxury", desc: "Creme, serifa, dourado.", preview: "linear-gradient(135deg, #f3ebd9 50%, #c9a35b 50%)" },
];

export default function Settings() {
  const { data: tenant, refetch } = useTenant();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(tenant?.name ?? "");
  const [primary, setPrimary] = useState(tenant?.primary_color ?? "#0F1E3D");
  const [secondary, setSecondary] = useState(tenant?.secondary_color ?? "#FFFFFF");
  const [template, setTemplate] = useState<"clean" | "dark" | "luxury">(tenant?.template ?? "clean");
  const [logoUrl, setLogoUrl] = useState<string | null>(tenant?.logo_url ?? null);
  const [showLogo, setShowLogo] = useState<boolean>(tenant?.show_logo ?? true);
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (file: File) => {
    if (!tenant) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo deve ter no máximo 2MB.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${tenant.id}/logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("tenant-logos").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("tenant-logos").getPublicUrl(path);
      setLogoUrl(pub.publicUrl);
      toast.success("Logo carregada. Clique em Salvar para confirmar.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!tenant) return;
      const { error } = await supabase.from("tenants").update({
        name, primary_color: primary, secondary_color: secondary, template,
        logo_url: logoUrl, show_logo: showLogo,
      }).eq("id", tenant.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Configurações salvas!");
      qc.invalidateQueries({ queryKey: ["tenant"] });
      refetch();
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (!tenant) {
    return <div className="container py-12 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="container py-8 max-w-3xl space-y-6 animate-fade-in">
      <header>
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Personalize o visual dos guias do seu workspace.</p>
      </header>

      <Card className="p-6 shadow-card space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do workspace</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
        </div>
      </Card>

      <Card className="p-6 shadow-card space-y-5">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-accent-foreground" />
          <h2 className="font-semibold">Logo da empresa</h2>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">
          A logo aparece no topo do guia do hóspede. PNG ou SVG com fundo transparente funciona melhor. Máx. 2MB.
        </p>

        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-lg border bg-muted/30 grid place-items-center overflow-hidden shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-full w-full object-contain p-2" />
            ) : (
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleLogoUpload(f);
                e.target.value = "";
              }}
            />
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-2 h-3.5 w-3.5" />}
                {logoUrl ? "Trocar logo" : "Enviar logo"}
              </Button>
              {logoUrl && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setLogoUrl(null)}>
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Remover
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="show-logo" className="cursor-pointer">Exibir logo no guia</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Mostrar a logo no topo da página do hóspede.</p>
          </div>
          <Switch id="show-logo" checked={showLogo} onCheckedChange={setShowLogo} />
        </div>
      </Card>

      <Card className="p-6 shadow-card space-y-5">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-accent-foreground" />
          <h2 className="font-semibold">Aparência dos guias</h2>
        </div>

        <div>
          <Label className="mb-3 block">Template</Label>
          <RadioGroup value={template} onValueChange={(v) => setTemplate(v as any)} className="grid sm:grid-cols-3 gap-3">
            {TEMPLATES.map((t) => (
              <label key={t.value} className={`relative cursor-pointer rounded-xl border-2 p-3 transition-all ${template === t.value ? "border-accent ring-2 ring-accent/20" : "border-border"}`}>
                <RadioGroupItem value={t.value} className="sr-only" />
                <div className="aspect-video rounded-lg mb-2" style={{ background: t.preview }} />
                <div className="font-medium text-sm">{t.label}</div>
                <div className="text-xs text-muted-foreground">{t.desc}</div>
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary">Cor primária</Label>
            <div className="flex gap-2">
              <Input id="primary" type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="w-16 h-10 p-1" />
              <Input value={primary} onChange={(e) => setPrimary(e.target.value)} maxLength={7} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondary">Cor secundária</Label>
            <div className="flex gap-2">
              <Input id="secondary" type="color" value={secondary} onChange={(e) => setSecondary(e.target.value)} className="w-16 h-10 p-1" />
              <Input value={secondary} onChange={(e) => setSecondary(e.target.value)} maxLength={7} />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar alterações
        </Button>
      </div>
    </div>
  );
}
