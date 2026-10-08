import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Copy, ExternalLink, Loader2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GuestPhoneLinkSettings({ slug }: { slug: string }) {
  const qc = useQueryClient();
  const [value, setValue] = useState(slug);
  const [check, setCheck] = useState<{ available: boolean; reason: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const normalized = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const url = `${window.location.origin}/g/${slug}/confirmar-celular`;
  useEffect(() => { setValue(slug); }, [slug]);
  useEffect(() => {
    setCheck(null);
    setChecking(false);
    if (!normalized || normalized === slug) return;
    let cancelled = false;
    setChecking(true);
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.rpc("is_tenant_slug_available", { _slug: normalized });
      if (cancelled) return;
      setChecking(false);
      if (!error) setCheck(data as { available: boolean; reason: string });
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [normalized, slug]);
  async function save() {
    setSaving(true);
    try {
      const { error } = await supabase.rpc("set_tenant_slug", { _slug: normalized });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["tenant"] });
      toast.success("Endereço do workspace atualizado!");
    } catch { toast.error("Não foi possível salvar. Verifique a disponibilidade do endereço."); }
    finally { setSaving(false); }
  }
  return <Card className="p-6 shadow-card space-y-4">
    <div className="flex items-center gap-2"><Link2 className="h-4 w-4 text-accent-foreground" /><h2 className="font-semibold">Confirmação de celular</h2></div>
    <div className="space-y-2">
      <Label htmlFor="guest-phone-slug">Endereço do workspace</Label>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input id="guest-phone-slug" value={value} onChange={e => setValue(e.target.value)} maxLength={40} placeholder="abmnb" />
        <Button onClick={save} disabled={saving || checking || !check?.available || normalized === slug}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar endereço
        </Button>
      </div>
      <p role="status" className="text-xs text-muted-foreground">{checking ? "Verificando disponibilidade…" : normalized === slug ? "Endereço atual" : check?.available ? `Disponível: ${normalized}` : check?.reason === "taken" ? "Este endereço já está em uso." : check?.reason === "reserved" ? "Este endereço é reservado." : "Use de 3 a 40 letras, números ou hífens."}</p>
    </div>
    <p className="text-sm break-all">{url}?reserva=ABC123</p>
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(url); toast.success("Link copiado!"); } catch { toast.error("Não foi possível copiar o link."); } }}><Copy className="h-4 w-4" />Copiar link</Button>
      <Button asChild variant="outline"><a href={`${url}?reserva=ABC123`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" />Visualizar exemplo</a></Button>
    </div>
    <p className="text-xs text-muted-foreground">O endereço é compartilhado com o Link da Bio. Ao alterá-lo, ambos são atualizados; os endereços anteriores continuam funcionando.</p>
  </Card>;
}