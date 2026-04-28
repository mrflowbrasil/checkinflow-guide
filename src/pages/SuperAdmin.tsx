import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsSuperAdmin } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Shield } from "lucide-react";

export default function SuperAdmin() {
  const { user, loading } = useAuth();
  const { data: isAdmin, isLoading: roleLoading } = useIsSuperAdmin();

  const { data: tenants, refetch } = useQuery({
    queryKey: ["all_tenants"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("id, name, slug, is_active, created_at, properties(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (loading || roleLoading) {
    return <div className="container py-12 grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/app" replace />;

  const toggleActive = async (id: string, next: boolean) => {
    await supabase.from("tenants").update({ is_active: next }).eq("id", id);
    refetch();
  };

  return (
    <div className="container py-8 max-w-5xl space-y-6 animate-fade-in">
      <header className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-accent-foreground" />
        <h1 className="text-2xl font-semibold">Super Admin</h1>
      </header>
      <p className="text-muted-foreground text-sm -mt-4">Gerencie todos os workspaces da plataforma.</p>

      <Card className="shadow-card overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div>Workspace</div>
          <div>Imóveis</div>
          <div>Criado em</div>
          <div>Ativo</div>
        </div>
        {tenants?.map((t: any) => (
          <div key={t.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-4 border-b last:border-0 items-center">
            <div className="min-w-0">
              <div className="font-medium truncate">{t.name}</div>
              <div className="text-xs text-muted-foreground truncate">/{t.slug}</div>
            </div>
            <Badge variant="outline" className="w-fit">{t.properties?.[0]?.count ?? 0} imóveis</Badge>
            <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("pt-BR")}</div>
            <Switch checked={t.is_active} onCheckedChange={(v) => toggleActive(t.id, v)} />
          </div>
        ))}
        {tenants?.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">Nenhum workspace ainda.</div>
        )}
      </Card>
    </div>
  );
}
