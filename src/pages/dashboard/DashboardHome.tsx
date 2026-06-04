import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Plus, ArrowRight, CheckCircle2 } from "lucide-react";
import { FirstPropertyHelpCard } from "@/components/help/FirstPropertyHelpCard";

export default function DashboardHome() {
  const { data: tenant } = useTenant();

  const { data: stats } = useQuery({
    queryKey: ["dashboard_stats", tenant?.id],
    enabled: !!tenant?.id,
    queryFn: async () => {
      const { data: properties } = await supabase
        .from("properties")
        .select("id, name, status, public_slug, cover_image_url, created_at")
        .eq("tenant_id", tenant!.id)
        .order("created_at", { ascending: false });
      const total = properties?.length ?? 0;
      const active = properties?.filter((p) => p.status === "active").length ?? 0;
      return { total, active, recent: properties?.slice(0, 4) ?? [] };
    },
  });

  return (
    <div className="container py-8 max-w-6xl space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Bem-vindo{tenant ? `, ${tenant.name.split("'")[0]}` : ""}</h1>
          <p className="text-muted-foreground text-sm mt-1">Visão geral dos seus imóveis e guias publicados.</p>
        </div>
        <Button asChild>
          <Link to="/app/properties/new"><Plus className="mr-2 h-4 w-4" /> Novo imóvel</Link>
        </Button>
      </header>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><Home className="h-4 w-4" /> Imóveis</div>
          <div className="text-3xl font-semibold">{stats?.total ?? 0}</div>
        </Card>
        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><CheckCircle2 className="h-4 w-4 text-success" /> Publicados</div>
          <div className="text-3xl font-semibold">{stats?.active ?? 0}</div>
        </Card>
        <Card className="p-5 shadow-card bg-primary text-primary-foreground border-0">
          <div className="text-sm opacity-80 mb-1">Comece agora</div>
          <div className="text-base font-medium mb-3">Cadastre seu primeiro imóvel</div>
          <Button asChild variant="secondary" size="sm">
            <Link to="/app/properties/new">Começar <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link>
          </Button>
        </Card>
      </div>

      {stats && stats.total === 0 && <FirstPropertyHelpCard />}

      <div>
        <h2 className="text-lg font-semibold mb-3">Imóveis recentes</h2>
        {stats && stats.recent.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            <Home className="h-8 w-8 mx-auto mb-3 opacity-40" />
            Nenhum imóvel ainda. <Link to="/app/properties/new" className="text-accent-foreground underline underline-offset-2">Cadastrar agora</Link>.
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {stats?.recent.map((p) => (
              <Link key={p.id} to={`/app/properties/${p.id}`}>
                <Card className="p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow shadow-card">
                  <div className="h-14 w-14 rounded-lg bg-muted overflow-hidden shrink-0">
                    {p.cover_image_url && <img src={p.cover_image_url} alt={p.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.status === "active" ? "Publicado" : "Rascunho"}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
