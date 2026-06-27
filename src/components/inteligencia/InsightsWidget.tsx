import { useMemo, useState } from "react";
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, Lightbulb, TrendingUp, TrendingDown, AlertTriangle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  generateReservationInsights,
  type Insight,
  type InsightCategory,
  type InsightPriority,
} from "@/lib/insights/generateReservationInsights";

interface Props {
  current: any[];
  previous: any[];
  history: any[];
  dateBasis: "check_in" | "booked_at";
  loading?: boolean;
  fetching?: boolean;
  onRefresh: () => void;
}

const PRIORITY_STYLES: Record<InsightPriority, { badge: string; dot: string; label: string }> = {
  high:   { badge: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive", label: "Alta" },
  medium: { badge: "bg-warning/10 text-warning-foreground border-warning/30", dot: "bg-warning", label: "Atenção" },
  low:    { badge: "bg-primary/10 text-primary border-primary/20", dot: "bg-primary", label: "Oportunidade" },
  info:   { badge: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground", label: "Informação" },
};

const CATEGORY_OPTIONS: { value: "all" | InsightCategory; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "Receita", label: "Receita" },
  { value: "Canal", label: "Canal" },
  { value: "Imóvel", label: "Imóvel" },
  { value: "Sazonalidade", label: "Sazonalidade" },
  { value: "Atenção", label: "Atenção" },
];

function categoryIcon(cat: InsightCategory) {
  switch (cat) {
    case "Receita": return <TrendingUp className="h-4 w-4" />;
    case "Canal": return <Sparkles className="h-4 w-4" />;
    case "Imóvel": return <Lightbulb className="h-4 w-4" />;
    case "Sazonalidade": return <TrendingUp className="h-4 w-4" />;
    case "Lead time": return <TrendingDown className="h-4 w-4" />;
    case "Atenção": return <AlertTriangle className="h-4 w-4" />;
    case "Operação": return <Info className="h-4 w-4" />;
    default: return <Lightbulb className="h-4 w-4" />;
  }
}

function InsightRow({ insight }: { insight: Insight }) {
  const [open, setOpen] = useState(false);
  const style = PRIORITY_STYLES[insight.priority];

  return (
    <div className="rounded-lg border bg-card/60 hover:bg-card transition-colors">
      <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-2 sm:pt-1">
          <span className={`h-2 w-2 rounded-full ${style.dot} shrink-0`} aria-hidden />
          <Badge variant="outline" className="gap-1 font-normal">
            {categoryIcon(insight.category)}
            {insight.category}
          </Badge>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm leading-tight">{insight.title}</h4>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.badge}`}>
              {style.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{insight.description}</p>

          {insight.evidence.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {insight.evidence.slice(0, open ? insight.evidence.length : 3).map((e, i) => (
                <span key={i} className="text-muted-foreground">
                  <span className="text-foreground/70">{e.label}:</span>{" "}
                  <span className="font-medium tabular-nums text-foreground">{e.value}</span>
                </span>
              ))}
            </div>
          )}

          {open && (
            <div className="mt-3 rounded-md bg-primary/5 border border-primary/15 p-3 text-sm">
              <div className="text-xs uppercase tracking-wider text-primary/80 mb-1">Ação recomendada</div>
              <p className="text-foreground/90">{insight.recommended_action}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Confiança: <span className="text-foreground/80 capitalize">{insight.confidence}</span></span>
                {insight.related_property && <span>Imóvel: <span className="text-foreground/80">{insight.related_property}</span></span>}
                {insight.related_channel && <span>Canal: <span className="text-foreground/80">{insight.related_channel}</span></span>}
              </div>
            </div>
          )}
        </div>

        <Button variant="ghost" size="sm" className="text-xs h-8 shrink-0" onClick={() => setOpen((v) => !v)}>
          {open ? <><ChevronUp className="h-3.5 w-3.5 mr-1" /> Ocultar</> : <><ChevronDown className="h-3.5 w-3.5 mr-1" /> Ver detalhes</>}
        </Button>
      </div>
    </div>
  );
}

export function InsightsWidget({ current, previous, history, dateBasis, loading, fetching, onRefresh }: Props) {
  const [filter, setFilter] = useState<"all" | InsightCategory>("all");

  const allInsights = useMemo(
    () => generateReservationInsights({ current, previous, history, dateBasis }),
    [current, previous, history, dateBasis],
  );

  const insights = useMemo(
    () => (filter === "all" ? allInsights : allInsights.filter((i) => i.category === filter)),
    [allInsights, filter],
  );

  const top = insights.slice(0, 5);
  const hasData = current.length > 0 || history.length > 0;

  return (
    <Card className="p-5 sm:p-6 shadow-card border-primary/15 bg-gradient-to-br from-primary/5 via-card to-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary grid place-items-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base">Insights do Agente Mr Flow</h3>
              <Badge className="bg-primary/15 text-primary hover:bg-primary/20 border-0 h-5 text-[10px] tracking-wider">IA</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Análises e oportunidades geradas com base nos dados reais das suas reservas.
            </p>
            <p className="text-xs text-muted-foreground/80 mt-1">Baseado no período selecionado</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={fetching}>
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${fetching ? "animate-spin" : ""}`} />
          Atualizar insights
        </Button>
      </div>

      {/* Filtros internos */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {CATEGORY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              filter === opt.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <p className="text-xs text-muted-foreground text-center mt-2">Analisando dados das reservas...</p>
        </div>
      ) : !hasData ? (
        <div className="text-sm text-muted-foreground text-center py-8">
          Ainda não há dados suficientes para gerar insights neste período.
        </div>
      ) : top.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8">
          Nenhuma oportunidade crítica encontrada para este filtro. Continue acompanhando o desempenho conforme novas reservas forem sincronizadas.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
          {top.map((i) => (
            <div key={i.id} className="xl:col-span-1">
              <InsightRow insight={i} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default InsightsWidget;
