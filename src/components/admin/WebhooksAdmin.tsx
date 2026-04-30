import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Webhook } from "lucide-react";
import { toast } from "sonner";

type Row = {
  id: string;
  provider: string;
  webhook_url: string;
  is_active: boolean;
};

function ProviderRow({ row, onChange }: { row: Row; onChange: () => void }) {
  const [url, setUrl] = useState(row.webhook_url);
  const [active, setActive] = useState(row.is_active);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUrl(row.webhook_url);
    setActive(row.is_active);
  }, [row.webhook_url, row.is_active]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("integration_webhooks")
      .update({ webhook_url: url, is_active: active })
      .eq("id", row.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Webhook atualizado");
    onChange();
  };

  return (
    <div className="space-y-3 border-b last:border-0 pb-4 last:pb-0">
      <div className="flex items-center justify-between">
        <h3 className="font-medium capitalize">{row.provider}</h3>
        <div className="flex items-center gap-2">
          <Label htmlFor={`active-${row.id}`} className="text-xs text-muted-foreground">Ativo</Label>
          <Switch id={`active-${row.id}`} checked={active} onCheckedChange={setActive} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`url-${row.id}`}>URL do webhook (n8n)</Label>
        <div className="flex gap-2">
          <Input
            id={`url-${row.id}`}
            placeholder="https://n8n.exemplo.com/webhook/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WebhooksAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["integration_webhooks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integration_webhooks")
        .select("id, provider, webhook_url, is_active")
        .order("provider");
      if (error) throw error;
      return data as Row[];
    },
  });

  return (
    <Card className="p-5 shadow-card space-y-5">
      <div className="flex items-center gap-2">
        <Webhook className="h-4 w-4 text-accent-foreground" />
        <h2 className="font-semibold">Webhooks de integração</h2>
      </div>
      <p className="text-xs text-muted-foreground -mt-3">
        URLs que serão chamadas quando um cliente conectar o respectivo PMS. O n8n recebe a URL do
        sistema, autorização Basic e uma API key para usar no callback.
      </p>
      {isLoading ? (
        <div className="py-8 grid place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {data?.map((r) => (
            <ProviderRow key={r.id} row={r} onChange={() => qc.invalidateQueries({ queryKey: ["integration_webhooks"] })} />
          ))}
        </div>
      )}
    </Card>
  );
}
