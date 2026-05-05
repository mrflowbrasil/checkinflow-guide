import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant, usePlanFeatures } from "@/hooks/useTenant";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Palette, Upload, Trash2, ImageIcon, MessageCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { LogoCropDialog } from "@/components/property/LogoCropDialog";


export default function Settings() {
  const { data: tenant, refetch } = useTenant();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(tenant?.name ?? "");
  const [primary, setPrimary] = useState(tenant?.primary_color ?? "#0F1E3D");
  const [secondary, setSecondary] = useState(tenant?.secondary_color ?? "#FFFFFF");
  const [template] = useState<string>(tenant?.template ?? "clean");
  const [logoUrl, setLogoUrl] = useState<string | null>(tenant?.logo_url ?? null);
  const [showLogo, setShowLogo] = useState<boolean>(tenant?.show_logo ?? true);
  const [supportWhatsapp, setSupportWhatsapp] = useState<string>((tenant as any)?.support_whatsapp ?? "");
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const handlePickFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async (blob: Blob) => {
    if (!tenant) return;
    setUploading(true);
    try {
      const path = `${tenant.id}/logo-${Date.now()}.png`;
      const { error: upErr } = await supabase.storage.from("tenant-logos").upload(path, blob, { upsert: true, contentType: "image/png" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("tenant-logos").getPublicUrl(path);
      setLogoUrl(pub.publicUrl);
      setCropSrc(null);
      toast.success("Logo ajustada. Clique em Salvar para confirmar.");
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
        name, primary_color: primary, secondary_color: secondary,
        logo_url: logoUrl, show_logo: showLogo,
        support_whatsapp: supportWhatsapp.trim() || null,
      } as any).eq("id", tenant.id);
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
          A logo aparece no topo do guia do hóspede. Limite máximo: 5MB. Tamanho ideal: 960×960px em PNG/WebP com fundo transparente, mantendo a marca centralizada e com respiro para caber no círculo.
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
                if (f) handlePickFile(f);
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

        <div className="rounded-lg border bg-muted/30 p-4 flex items-start justify-between gap-3">
          <div>
            <div className="font-medium text-sm">Template do guia</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Atual: <span className="font-medium text-foreground">{template}</span>. Troque o visual completo na biblioteca de templates.
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href="/app/templates">Ver biblioteca</a>
          </Button>
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

      <Card className="p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-accent-foreground" />
          <h2 className="font-semibold">Atendimento ao hóspede</h2>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">
          Quando você gera um novo link de um imóvel, hóspedes que acessam o link antigo veem uma página de "link expirado".
          O número abaixo será usado no botão "Ajuda" dessa página.
        </p>
        <div className="space-y-2">
          <Label htmlFor="support_whatsapp">WhatsApp de atendimento</Label>
          <Input
            id="support_whatsapp"
            value={supportWhatsapp}
            onChange={(e) => setSupportWhatsapp(e.target.value)}
            placeholder="Ex: 5511999998888 (DDI + DDD + número, só dígitos)"
            inputMode="numeric"
          />
          <p className="text-xs text-muted-foreground">Deixe em branco para esconder o botão de ajuda.</p>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar alterações
        </Button>
      </div>

      <LogoCropDialog
        open={!!cropSrc}
        onOpenChange={(o) => !o && setCropSrc(null)}
        imageSrc={cropSrc}
        onConfirm={handleCropConfirm}
        busy={uploading}
      />
    </div>
  );
}
