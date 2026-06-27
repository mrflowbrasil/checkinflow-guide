import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  Plug,
  Info,
} from "lucide-react";
import {
  format,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  parseISO,
  formatDistanceToNow,
  differenceInCalendarDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useHasReservationsIntegration,
  useReservationsRange,
  useReservationsAll,
  useMonthlyMetrics,
  usePropertyMetrics,
  useLastSyncedAt,
  useUpcomingCheckins,
  type DateBasis,
} from "@/hooks/useInteligencia";
import { InsightsWidget } from "@/components/inteligencia/InsightsWidget";
import { ChannelRevenueCard } from "@/components/inteligencia/ChannelRevenueCard";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const BRL2 = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const NUM = new Intl.NumberFormat("pt-BR");

type PresetKey = "30d" | "month" | "90d" | "6m" | "12m" | "ytd" | "prev_year" | "all" | "custom";

const ALL_TIME_START = "2000-01-01";

type Range = { start: string; end: string; label: string; prev: { start: string; end: string } };

function presetRange(p: PresetKey, custom?: { start: string; end: string }): Range {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  switch (p) {
    case "month": {
      const s = startOfMonth(today), e = endOfMonth(today);
      const ps = startOfMonth(subMonths(today, 1)), pe = endOfMonth(subMonths(today, 1));
      return { start: fmt(s), end: fmt(e), label: "Mês atual", prev: { start: fmt(ps), end: fmt(pe) } };
    }
    case "90d": {
      const s = subDays(today, 90);
      const ps = subDays(today, 180), pe = subDays(today, 90);
      return { start: fmt(s), end: fmt(today), label: "Últimos 90 dias", prev: { start: fmt(ps), end: fmt(pe) } };
    }
    case "6m": {
      const s = subMonths(today, 6);
      const ps = subMonths(today, 12), pe = subMonths(today, 6);
      return { start: fmt(s), end: fmt(today), label: "Últimos 6 meses", prev: { start: fmt(ps), end: fmt(pe) } };
    }
    case "12m": {
      const s = subMonths(today, 12);
      const ps = subMonths(today, 24), pe = subMonths(today, 12);
      return { start: fmt(s), end: fmt(today), label: "Últimos 12 meses", prev: { start: fmt(ps), end: fmt(pe) } };
    }
    case "ytd": {
      const s = startOfYear(today);
      const ps = startOfYear(subMonths(today, 12)), pe = subMonths(today, 12);
      return { start: fmt(s), end: fmt(today), label: "Ano atual", prev: { start: fmt(ps), end: fmt(pe) } };
    }
    case "prev_year": {
      const lastYear = subMonths(today, 12);
      const s = startOfYear(lastYear), e = endOfYear(lastYear);
      const prevYear = subMonths(today, 24);
      const ps = startOfYear(prevYear), pe = endOfYear(prevYear);
      return { start: fmt(s), end: fmt(e), label: "Ano anterior", prev: { start: fmt(ps), end: fmt(pe) } };
    }
    case "all":
      return { start: ALL_TIME_START, end: fmt(today), label: "Todo histórico", prev: { start: ALL_TIME_START, end: ALL_TIME_START } };
    case "custom": {
      const s = custom?.start ?? fmt(subDays(today, 30));
      const e = custom?.end ?? fmt(today);
      const days = Math.max(1, differenceInCalendarDays(parseISO(e), parseISO(s)));
      const ps = subDays(parseISO(s), days);
      const pe = subDays(parseISO(s), 1);
      return { start: s, end: e, label: "Personalizado", prev: { start: fmt(ps), end: fmt(pe) } };
    }
    case "30d":
    default: {
      const s = subDays(today, 30);
      const ps = subDays(today, 60), pe = subDays(today, 30);
      return { start: fmt(s), end: fmt(today), label: "Últimos 30 dias", prev: { start: fmt(ps), end: fmt(pe) } };
    }
  }
}

function KpiCard({
  label,
  value,
  delta,
  loading,
  hint,
}: {
  label: string;
  value: string;
  delta?: number | null;
  loading?: boolean;
  hint?: string;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <Card className="p-5 shadow-card">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        {hint && (
          <TooltipProvider delayDuration={150}>
            <UITooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">{hint}</TooltipContent>
            </UITooltip>
          </TooltipProvider>
        )}
      </div>
      {loading ? (
        <Skeleton className="h-8 w-32" />
      ) : (
        <div className="text-2xl sm:text-3xl font-semibold tabular-nums">{value}</div>
      )}
      {delta != null && !loading && Number.isFinite(delta) && (
        <div className={`mt-2 inline-flex items-center gap-1 text-xs ${up ? "text-success" : "text-destructive"}`}>
          {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {Math.abs(delta).toFixed(1)}% vs período anterior
        </div>
      )}
    </Card>
  );
}

function aggregate(rows: any[]) {
  const confirmed = rows.filter((r) => r.status !== "canceled");
  const num = (v: any) => Number(v ?? 0) || 0;
  const grossRevenue = confirmed.reduce((s, r) => s + num(r.sell_price_corrected ?? r.total_amount), 0);
  const fees = confirmed.reduce((s, r) => s + num(r.fees_amount), 0);
  const commission = confirmed.reduce((s, r) => s + num(r.company_commission), 0);
  const netRevenue = grossRevenue - fees - commission;
  const nights = confirmed.reduce((s, r) => s + num(r.nights), 0);
  const count = confirmed.length;
  const avg = count > 0 ? grossRevenue / count : 0;
  const leadRows = confirmed.filter((r) => r.lead_time_days != null);
  const leadAvg = leadRows.length > 0 ? leadRows.reduce((s, r) => s + num(r.lead_time_days), 0) / leadRows.length : 0;
  return { grossRevenue, netRevenue, fees, commission, nights, count, avg, canceled: rows.length - count, leadAvg };
}

// Refined Mr Flow chart palette — teal/cyan first, complementary muted tones, no pure black or hot reds.
const CHART_COLORS = [
  "hsl(var(--chart-1))", // teal Mr Flow
  "hsl(var(--chart-2))", // cyan accent
  "hsl(var(--chart-3))", // azul suave
  "hsl(var(--chart-4))", // âmbar
  "hsl(var(--chart-5))", // roxo suave
  "hsl(var(--chart-6))", // verde sálvia
  "hsl(var(--chart-7))", // coral suave
  "hsl(var(--chart-8))", // cinza neutro
];

// Semantic colors for status-aware data
const DATA_COLORS = {
  confirmed: "hsl(var(--chart-1))",        // ciano/teal Mr Flow
  canceled: "hsl(var(--destructive))",     // vermelho suave
  pending: "hsl(var(--warning))",          // âmbar
  fees: "hsl(var(--chart-7))",             // laranja suave
  positive: "hsl(var(--success))",
  negative: "hsl(var(--destructive))",
  neutral: "hsl(var(--muted-foreground))",
  primary: "hsl(var(--chart-1))",
  primaryAlt: "hsl(var(--chart-2))",
};

// Normalize unknown/empty channel names for color mapping
function channelColor(name: string, index: number): string {
  const key = (name || "").toLowerCase();
  if (key === "direto") return "hsl(var(--chart-1))";
  if (key === "airbnb") return "hsl(var(--chart-7))";
  if (key === "booking" || key === "booking.com") return "hsl(var(--chart-3))";
  if (key === "vrbo") return "hsl(var(--chart-4))";
  if (key === "stays") return "hsl(var(--chart-2))";
  if (key === "hostaway") return "hsl(var(--chart-5))";
  if (!key || key === "unknown" || key === "outros") return "hsl(var(--chart-8))";
  return CHART_COLORS[index % CHART_COLORS.length];
}

export default function Inteligencia() {
  const qc = useQueryClient();
  const [preset, setPreset] = useState<PresetKey>("30d");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [dateBasis, setDateBasis] = useState<DateBasis>("check_in");
  const [customStart, setCustomStart] = useState<string>(() => format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [customEnd, setCustomEnd] = useState<string>(() => format(new Date(), "yyyy-MM-dd"));

  const range = useMemo(
    () => presetRange(preset, { start: customStart, end: customEnd }),
    [preset, customStart, customEnd],
  );

  const integration = useHasReservationsIntegration();
  const lastSync = useLastSyncedAt();
  const current = useReservationsRange(range.start, range.end, dateBasis);
  const previous = useReservationsRange(range.prev.start, range.prev.end, dateBasis);
  const monthly = useMonthlyMetrics();
  const propMetrics = usePropertyMetrics();
  const upcoming = useUpcomingCheckins(20);
  const allHistory = useReservationsAll(dateBasis);
  const [yearMetric, setYearMetric] = useState<"netRevenue" | "grossRevenue" | "count" | "nights" | "avg">("netRevenue");

  const channels = useMemo(() => {
    const set = new Set<string>();
    (current.data ?? []).forEach((r) => set.add(r.channel || "Direto"));
    return Array.from(set).sort();
  }, [current.data]);

  const applyClientFilters = (rows: any[]) =>
    rows.filter((r) => {
      if (propertyFilter !== "all" && r.property_external_id !== propertyFilter) return false;
      if (channelFilter !== "all" && (r.channel || "Direto") !== channelFilter) return false;
      return true;
    });

  const filteredCurrent = useMemo(() => applyClientFilters(current.data ?? []), [current.data, propertyFilter, channelFilter]);
  const filteredPrev = useMemo(() => applyClientFilters(previous.data ?? []), [previous.data, propertyFilter, channelFilter]);

  const kpi = useMemo(() => aggregate(filteredCurrent), [filteredCurrent]);
  const kpiPrev = useMemo(() => aggregate(filteredPrev), [filteredPrev]);

  const delta = (a: number, b: number) => (b > 0 ? ((a - b) / b) * 100 : a > 0 ? 100 : 0);

  const channelMix = useMemo(() => {
    const map = new Map<string, number>();
    filteredCurrent.forEach((r) => {
      if (r.status === "canceled") return;
      const k = r.channel || "Direto";
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredCurrent]);

  const monthlyChart = useMemo(
    () =>
      (monthly.data ?? []).slice(-12).map((m) => ({
        label: format(parseISO(m.month), "MMM/yy", { locale: ptBR }),
        revenue: Number(m.revenue ?? 0),
        confirmed: Number(m.confirmed_count ?? 0),
        canceled: Number(m.canceled_count ?? 0),
      })),
    [monthly.data],
  );

  const topProperties = useMemo(() => (propMetrics.data ?? []).slice(0, 10), [propMetrics.data]);
  const topNights = useMemo(
    () =>
      [...(propMetrics.data ?? [])]
        .sort((a, b) => Number(b.nights) - Number(a.nights))
        .slice(0, 10)
        .map((p) => ({ name: p.property_name || p.property_external_id || "—", nights: Number(p.nights) })),
    [propMetrics.data],
  );
  // History-based aggregations (Sub-etapa 2.2)
  const historyFiltered = useMemo(() => applyClientFilters(allHistory.data ?? []), [allHistory.data, propertyFilter, channelFilter]);

  // Per year × month aggregation
  const yearMonthAgg = useMemo(() => {
    const map = new Map<string, { gross: number; net: number; fees: number; commission: number; count: number; nights: number }>();
    const num = (v: any) => Number(v ?? 0) || 0;
    historyFiltered.forEach((r) => {
      if (r.status === "canceled") return;
      const basis = dateBasis === "booked_at" ? r.booked_at : r.check_in;
      if (!basis) return;
      const key = String(basis).slice(0, 7); // YYYY-MM
      const cur = map.get(key) ?? { gross: 0, net: 0, fees: 0, commission: 0, count: 0, nights: 0 };
      const gross = num(r.sell_price_corrected ?? r.total_amount);
      const fees = num(r.fees_amount);
      const commission = num(r.company_commission);
      cur.gross += gross;
      cur.fees += fees;
      cur.commission += commission;
      cur.net += gross - fees - commission;
      cur.count += 1;
      cur.nights += num(r.nights);
      map.set(key, cur);
    });
    return map;
  }, [historyFiltered, dateBasis]);

  const annualSeries = useMemo(() => {
    const years = new Set<number>();
    yearMonthAgg.forEach((_, k) => years.add(Number(k.slice(0, 4))));
    const sortedYears = Array.from(years).sort();
    const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const data = monthLabels.map((label, i) => {
      const row: Record<string, any> = { month: label };
      sortedYears.forEach((y) => {
        const key = `${y}-${String(i + 1).padStart(2, "0")}`;
        const agg = yearMonthAgg.get(key);
        let value = 0;
        if (agg) {
          switch (yearMetric) {
            case "grossRevenue": value = agg.gross; break;
            case "netRevenue": value = agg.net; break;
            case "count": value = agg.count; break;
            case "nights": value = agg.nights; break;
            case "avg": value = agg.count > 0 ? agg.gross / agg.count : 0; break;
          }
        }
        row[String(y)] = value;
      });
      return row;
    });
    return { years: sortedYears, data };
  }, [yearMonthAgg, yearMetric]);

  // Seasonality matrix (year × month) with intensity by net revenue
  const seasonality = useMemo(() => {
    const years = annualSeries.years;
    const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    let max = 0;
    years.forEach((y) => {
      for (let m = 1; m <= 12; m++) {
        const key = `${y}-${String(m).padStart(2, "0")}`;
        const v = yearMonthAgg.get(key)?.net ?? 0;
        if (v > max) max = v;
      }
    });
    return { years, monthLabels, max };
  }, [annualSeries.years, yearMonthAgg]);

  // Channel × month stacked (last 12 months from today, basis = check_in/booked_at filter)
  const channelMonthly = useMemo(() => {
    const today = new Date();
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(today, i);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    const channelSet = new Set<string>();
    const num = (v: any) => Number(v ?? 0) || 0;
    const byMonth = new Map<string, Map<string, number>>();
    historyFiltered.forEach((r) => {
      if (r.status === "canceled") return;
      const basis = dateBasis === "booked_at" ? r.booked_at : r.check_in;
      if (!basis) return;
      const key = String(basis).slice(0, 7);
      if (!months.includes(key)) return;
      const ch = r.channel || "Direto";
      channelSet.add(ch);
      const m = byMonth.get(key) ?? new Map<string, number>();
      m.set(ch, (m.get(ch) ?? 0) + (num(r.sell_price_corrected ?? r.total_amount) - num(r.fees_amount) - num(r.company_commission)));
      byMonth.set(key, m);
    });
    const channels = Array.from(channelSet).sort();
    const data = months.map((k) => {
      const row: Record<string, any> = { label: format(parseISO(`${k}-01`), "MMM/yy", { locale: ptBR }) };
      const m = byMonth.get(k) ?? new Map();
      channels.forEach((c) => { row[c] = Math.round(m.get(c) ?? 0); });
      return row;
    });
    return { data, channels };
  }, [historyFiltered, dateBasis]);

  // Channel summary table (current filtered period)
  const channelSummary = useMemo(() => {
    const num = (v: any) => Number(v ?? 0) || 0;
    const map = new Map<string, { gross: number; net: number; count: number; leadSum: number; leadN: number }>();
    filteredCurrent.forEach((r) => {
      if (r.status === "canceled") return;
      const ch = r.channel || "Direto";
      const cur = map.get(ch) ?? { gross: 0, net: 0, count: 0, leadSum: 0, leadN: 0 };
      const gross = num(r.sell_price_corrected ?? r.total_amount);
      cur.gross += gross;
      cur.net += gross - num(r.fees_amount) - num(r.company_commission);
      cur.count += 1;
      if (r.lead_time_days != null) { cur.leadSum += num(r.lead_time_days); cur.leadN += 1; }
      map.set(ch, cur);
    });
    const totalNet = Array.from(map.values()).reduce((s, x) => s + x.net, 0);
    return Array.from(map.entries())
      .map(([name, v]) => ({
        name,
        gross: v.gross,
        net: v.net,
        count: v.count,
        avg: v.count > 0 ? v.gross / v.count : 0,
        share: totalNet > 0 ? (v.net / totalNet) * 100 : 0,
        lead: v.leadN > 0 ? v.leadSum / v.leadN : 0,
      }))
      .sort((a, b) => b.net - a.net);
  }, [filteredCurrent]);

  // Lead time histogram (current filtered)
  const leadHistogram = useMemo(() => {
    const buckets = [
      { name: "0–7 dias", min: 0, max: 7, count: 0 },
      { name: "8–30 dias", min: 8, max: 30, count: 0 },
      { name: "31–60 dias", min: 31, max: 60, count: 0 },
      { name: "61–90 dias", min: 61, max: 90, count: 0 },
      { name: "90+ dias", min: 91, max: Infinity, count: 0 },
    ];
    let total = 0;
    filteredCurrent.forEach((r) => {
      if (r.status === "canceled") return;
      if (r.lead_time_days == null) return;
      const v = Number(r.lead_time_days);
      const b = buckets.find((x) => v >= x.min && v <= x.max);
      if (b) { b.count += 1; total += 1; }
    });
    return buckets.map((b) => ({ name: b.name, count: b.count, pct: total > 0 ? (b.count / total) * 100 : 0 }));
  }, [filteredCurrent]);

  if (integration.isLoading) {
    return (
      <div className="container py-8 max-w-7xl space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (!integration.data?.connected) {
    return (
      <div className="container py-12 max-w-3xl">
        <Card className="p-8 text-center shadow-card">
          <div className="mx-auto h-14 w-14 rounded-full bg-accent-soft grid place-items-center mb-4">
            <Plug className="h-7 w-7 text-accent-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Conecte Stays ou Hostaway para ver seus dados</h2>
          <p className="text-muted-foreground text-sm mb-6">
            A Inteligência de reservas analisa as sincronizações em tempo real do seu PMS. Conecte uma integração para começar.
          </p>
          <Button asChild>
            <Link to="/app/integrations"><Plug className="mr-2 h-4 w-4" /> Conectar integração</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const firstLoad = (current.isLoading && !current.data) || (monthly.isLoading && !monthly.data) || (propMetrics.isLoading && !propMetrics.data);
  const fetching = current.isFetching || monthly.isFetching || propMetrics.isFetching || upcoming.isFetching;
  const loading = firstLoad;
  const error = current.error || monthly.error || propMetrics.error;

  return (
    <div className="container py-6 sm:py-8 max-w-7xl space-y-6 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-semibold">Inteligência de reservas</h1>
          </div>
          <p className="text-muted-foreground text-sm">Dados sincronizados em tempo real do seu PMS.</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {integration.data.providers.map((p) => (
              <Badge key={p} variant="secondary" className="capitalize">{p}</Badge>
            ))}
            {lastSync.data && (
              <span className="text-xs text-muted-foreground">
                Atualizado {formatDistanceToNow(new Date(lastSync.data), { addSuffix: true, locale: ptBR })}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => qc.invalidateQueries({ predicate: (q) => {
            const k = q.queryKey?.[0] as string | undefined;
            return !!k && (k.startsWith("v_") || k === "last_synced_at");
          }})}
          disabled={fetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${fetching ? "animate-spin" : ""}`} /> Atualizar
        </Button>
      </header>

      {/* Filtros */}
      <Card className="p-4 shadow-card space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" /> Período
          </div>
          <Select value={preset} onValueChange={(v) => setPreset(v as PresetKey)}>
            <SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="month">Mês atual</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
              <SelectItem value="ytd">Ano atual</SelectItem>
              <SelectItem value="prev_year">Ano anterior</SelectItem>
              <SelectItem value="all">Todo histórico</SelectItem>
              <SelectItem value="custom">Personalizado…</SelectItem>
            </SelectContent>
          </Select>

          {preset === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(parseISO(customStart), "dd/MM/yy")} → {format(parseISO(customEnd), "dd/MM/yy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Início</Label>
                  <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Fim</Label>
                  <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
                </div>
              </PopoverContent>
            </Popover>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Base:</span>
            <Select value={dateBasis} onValueChange={(v) => setDateBasis(v as DateBasis)}>
              <SelectTrigger className="w-44 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="check_in">Data de check-in</SelectItem>
                <SelectItem value="booked_at">Data da reserva</SelectItem>
              </SelectContent>
            </Select>
            <TooltipProvider delayDuration={150}>
              <UITooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  <p><strong>Check-in</strong>: agrupa pela estada (quando o hóspede chegou).</p>
                  <p className="mt-1"><strong>Reserva</strong>: agrupa por quando a reserva foi feita (`booked_at`). Útil para analisar ritmo de vendas.</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>

          <div className="sm:ml-auto text-xs text-muted-foreground">
            {format(parseISO(range.start), "dd/MM/yy", { locale: ptBR })} → {format(parseISO(range.end), "dd/MM/yy", { locale: ptBR })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="w-full sm:w-72"><SelectValue placeholder="Todos os imóveis" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os imóveis</SelectItem>
              {(propMetrics.data ?? []).map((p) => (
                <SelectItem key={p.property_external_id} value={p.property_external_id}>
                  {p.property_name || p.property_external_id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-full sm:w-52"><SelectValue placeholder="Todos os canais" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os canais</SelectItem>
              {channels.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {error && (
        <Card className="p-4 border-destructive/40 bg-destructive/5 text-sm text-destructive">
          Erro ao carregar dados. <Button variant="link" className="px-1 h-auto" onClick={() => qc.invalidateQueries()}>Tentar novamente</Button>
        </Card>
      )}

      {/* KPIs financeiros */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Receita bruta"
          value={BRL.format(kpi.grossRevenue)}
          delta={delta(kpi.grossRevenue, kpiPrev.grossRevenue)}
          loading={loading}
          hint="Soma de sell_price_corrected das reservas confirmadas no período."
        />
        <KpiCard
          label="Receita líquida"
          value={BRL.format(kpi.netRevenue)}
          delta={delta(kpi.netRevenue, kpiPrev.netRevenue)}
          loading={loading}
          hint="Receita bruta − taxas − comissão da empresa."
        />
        <KpiCard
          label="Taxas"
          value={BRL.format(kpi.fees)}
          delta={delta(kpi.fees, kpiPrev.fees)}
          loading={loading}
          hint="Total de forward fees (total_forward_fee + total_forward_fee_all)."
        />
        <KpiCard
          label="Comissão"
          value={BRL.format(kpi.commission)}
          delta={delta(kpi.commission, kpiPrev.commission)}
          loading={loading}
          hint="Soma de company_commission das reservas no período."
        />
      </div>

      {/* KPIs operacionais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Reservas confirmadas" value={NUM.format(kpi.count)} delta={delta(kpi.count, kpiPrev.count)} loading={loading} />
        <KpiCard label="Diárias vendidas" value={NUM.format(kpi.nights)} delta={delta(kpi.nights, kpiPrev.nights)} loading={loading} />
        <KpiCard label="Ticket médio" value={BRL.format(kpi.avg)} delta={delta(kpi.avg, kpiPrev.avg)} loading={loading} hint="Receita bruta ÷ número de reservas confirmadas." />
        <KpiCard
          label="Lead time médio"
          value={`${kpi.leadAvg.toFixed(1)} dias`}
          delta={delta(kpi.leadAvg, kpiPrev.leadAvg)}
          loading={loading}
          hint="Dias entre a data da reserva (booked_at) e o check-in."
        />
      </div>

      {/* Insights do Agente Mr Flow (determinístico) */}
      <InsightsWidget
        current={filteredCurrent}
        previous={filteredPrev}
        history={historyFiltered}
        dateBasis={dateBasis}
        loading={loading}
        fetching={fetching || allHistory.isFetching}
        onRefresh={() => qc.invalidateQueries({ predicate: (q) => {
          const k = q.queryKey?.[0] as string | undefined;
          return !!k && k.startsWith("v_");
        }})}
      />

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5 shadow-card">
          <div className="mb-3">
            <h3 className="font-semibold">Receita mensal</h3>
            <p className="text-xs text-muted-foreground">Últimos 12 meses</p>
          </div>
          <div className="h-72" aria-label="Gráfico de receita mensal">
            {monthly.isLoading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => BRL.format(v)} />
                  <Tooltip
                    formatter={(v: number) => BRL2.format(v)}
                    contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  />
                  <Bar dataKey="revenue" name="Receita" fill={DATA_COLORS.primary} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <div className="mb-3">
            <h3 className="font-semibold">Confirmadas vs canceladas</h3>
            <p className="text-xs text-muted-foreground">Evolução mensal</p>
          </div>
          <div className="h-72" aria-label="Gráfico de reservas confirmadas vs canceladas">
            {monthly.isLoading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="confirmed" name="Confirmadas" stroke={DATA_COLORS.confirmed} strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="canceled" name="Canceladas" stroke={DATA_COLORS.canceled} strokeWidth={2} strokeDasharray="4 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <div className="mb-3">
            <h3 className="font-semibold">Mix por canal</h3>
            <p className="text-xs text-muted-foreground">Reservas confirmadas no período</p>
          </div>
          <div className="h-72" aria-label="Gráfico de mix por canal">
            {loading ? <Skeleton className="h-full w-full" /> : channelMix.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">Sem dados no período</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={channelMix} dataKey="value" nameKey="name" outerRadius={90} stroke="hsl(var(--background))" strokeWidth={2} label>
                    {channelMix.map((entry, i) => (
                      <Cell key={i} fill={channelColor(entry.name, i)} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <div className="mb-3">
            <h3 className="font-semibold">Top imóveis por noites vendidas</h3>
            <p className="text-xs text-muted-foreground">Top 10 imóveis no histórico disponível</p>
          </div>
          <div className="h-72" aria-label="Gráfico de noites vendidas por imóvel">
            {propMetrics.isLoading ? <Skeleton className="h-full w-full" /> : topNights.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">Sem dados</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topNights} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={140} />
                  <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="nights" name="Noites" fill={DATA_COLORS.primary} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* === Sub-etapa 2.2: Evolução anual / Sazonalidade / Canais / Lead time === */}

      {/* Evolução anual comparativa */}
      <Card className="p-5 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold">Evolução anual comparativa</h3>
            <p className="text-xs text-muted-foreground">Série mensal por ano · histórico completo · base: {dateBasis === "booked_at" ? "data da reserva" : "check-in"}</p>
          </div>
          <Select value={yearMetric} onValueChange={(v) => setYearMetric(v as any)}>
            <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="netRevenue">Receita líquida</SelectItem>
              <SelectItem value="grossRevenue">Receita bruta</SelectItem>
              <SelectItem value="count">Reservas</SelectItem>
              <SelectItem value="nights">Diárias</SelectItem>
              <SelectItem value="avg">Ticket médio</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-80" aria-label="Gráfico de evolução anual">
          {allHistory.isLoading && !allHistory.data ? <Skeleton className="h-full w-full" /> : annualSeries.years.length === 0 ? (
            <div className="h-full grid place-items-center text-sm text-muted-foreground">Sem dados</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={annualSeries.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(v) => yearMetric === "count" || yearMetric === "nights" ? NUM.format(v) : BRL.format(v)}
                />
                <Tooltip
                  formatter={(v: number) => yearMetric === "count" || yearMetric === "nights" ? NUM.format(v) : BRL2.format(v)}
                  contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                />
                <Legend />
                {annualSeries.years.map((y, i) => (
                  <Line
                    key={y}
                    type="monotone"
                    dataKey={String(y)}
                    name={String(y)}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Sazonalidade (heatmap) */}
      <Card className="p-5 shadow-card overflow-hidden">
        <div className="mb-3">
          <h3 className="font-semibold">Sazonalidade</h3>
          <p className="text-xs text-muted-foreground">Receita líquida por mês × ano · intensidade indica volume</p>
        </div>
        {allHistory.isLoading && !allHistory.data ? <Skeleton className="h-48 w-full" /> : seasonality.years.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6">Sem dados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="text-left text-muted-foreground font-normal pr-2"></th>
                  {seasonality.monthLabels.map((m) => (
                    <th key={m} className="text-center text-muted-foreground font-normal">{m}</th>
                  ))}
                  <th className="text-right text-muted-foreground font-normal pl-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {seasonality.years.map((y) => {
                  let yearTotal = 0;
                  const cells = seasonality.monthLabels.map((_, i) => {
                    const key = `${y}-${String(i + 1).padStart(2, "0")}`;
                    const v = yearMonthAgg.get(key)?.net ?? 0;
                    yearTotal += v;
                    return v;
                  });
                  return (
                    <tr key={y}>
                      <td className="pr-2 font-medium tabular-nums">{y}</td>
                      {cells.map((v, i) => {
                        const intensity = seasonality.max > 0 ? v / seasonality.max : 0;
                        const bg = v > 0
                          ? `hsl(var(--primary) / ${(0.08 + intensity * 0.85).toFixed(2)})`
                          : "hsl(var(--muted) / 0.3)";
                        return (
                          <td key={i} className="text-center">
                            <TooltipProvider delayDuration={100}>
                              <UITooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className="h-9 rounded-md grid place-items-center text-[10px] tabular-nums cursor-default"
                                    style={{ background: bg, color: intensity > 0.5 ? "hsl(var(--primary-foreground))" : "inherit" }}
                                  >
                                    {v > 0 ? (v >= 1000 ? `${Math.round(v / 1000)}k` : Math.round(v)) : "·"}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">
                                  <div className="font-medium">{seasonality.monthLabels[i]}/{y}</div>
                                  <div>{BRL2.format(v)}</div>
                                </TooltipContent>
                              </UITooltip>
                            </TooltipProvider>
                          </td>
                        );
                      })}
                      <td className="pl-2 text-right tabular-nums font-medium">{BRL.format(yearTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Distribuição por canal */}
      <div className="grid lg:grid-cols-2 gap-4">
        <ChannelRevenueCard
          rows={historyFiltered as any}
          dateBasis={dateBasis}
          loading={allHistory.isLoading && !allHistory.data}
          rangeLabel="Últimos 12 meses"
        />


        <Card className="p-5 shadow-card">
          <div className="mb-3">
            <h3 className="font-semibold">Lead time</h3>
            <p className="text-xs text-muted-foreground">Distribuição das reservas confirmadas no período</p>
          </div>
          <div className="h-80" aria-label="Histograma de lead time">
            {loading ? <Skeleton className="h-full w-full" /> : leadHistogram.every((b) => b.count === 0) ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">Sem dados de lead time</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadHistogram}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    formatter={(v: number, _n, p: any) => [`${NUM.format(v)} reservas (${(p.payload.pct).toFixed(1)}%)`, "Total"]}
                    contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  />
                  <Bar dataKey="count" name="Reservas" fill={DATA_COLORS.primaryAlt} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Tabela por canal */}
      <Card className="p-5 shadow-card overflow-hidden">
        <div className="mb-3">
          <h3 className="font-semibold">Performance por canal</h3>
          <p className="text-xs text-muted-foreground">Período selecionado</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Canal</TableHead>
                <TableHead className="text-right">Receita líquida</TableHead>
                <TableHead className="text-right">Receita bruta</TableHead>
                <TableHead className="text-right">Reservas</TableHead>
                <TableHead className="text-right">Ticket médio</TableHead>
                <TableHead className="text-right">Lead time (d)</TableHead>
                <TableHead className="text-right">% receita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
              ))}
              {!loading && channelSummary.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Sem dados</TableCell></TableRow>
              )}
              {channelSummary.map((c) => (
                <TableRow key={c.name}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{BRL2.format(c.net)}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{BRL2.format(c.gross)}</TableCell>
                  <TableCell className="text-right tabular-nums">{NUM.format(c.count)}</TableCell>
                  <TableCell className="text-right tabular-nums">{BRL2.format(c.avg)}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.lead > 0 ? c.lead.toFixed(1) : "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.share.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Top imóveis */}

      <Card className="p-5 shadow-card overflow-hidden">
        <div className="mb-3">
          <h3 className="font-semibold">Top imóveis</h3>
          <p className="text-xs text-muted-foreground">Ordenado por receita total</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imóvel</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">Reservas</TableHead>
                <TableHead className="text-right">Diárias</TableHead>
                <TableHead className="text-right">Último check-in</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propMetrics.isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
              ))}
              {!propMetrics.isLoading && topProperties.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Sem dados</TableCell></TableRow>
              )}
              {topProperties.map((p) => (
                <TableRow key={p.property_external_id}>
                  <TableCell className="font-medium">{p.property_name || p.property_external_id}</TableCell>
                  <TableCell className="text-right">{BRL2.format(Number(p.revenue ?? 0))}</TableCell>
                  <TableCell className="text-right">{NUM.format(Number(p.confirmed_count ?? 0))}</TableCell>
                  <TableCell className="text-right">{NUM.format(Number(p.nights ?? 0))}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {p.last_check_in ? format(parseISO(p.last_check_in), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Próximos check-ins */}
      <Card className="p-5 shadow-card overflow-hidden">
        <div className="mb-3">
          <h3 className="font-semibold">Próximos check-ins</h3>
          <p className="text-xs text-muted-foreground">Próximas 20 reservas confirmadas</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Check-in</TableHead>
                <TableHead>Imóvel</TableHead>
                <TableHead>Hóspede</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcoming.isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
              ))}
              {!upcoming.isLoading && (upcoming.data ?? []).length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Sem check-ins futuros</TableCell></TableRow>
              )}
              {(upcoming.data ?? []).map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.check_in ? format(parseISO(r.check_in), "dd/MM/yyyy", { locale: ptBR }) : "—"}</TableCell>
                  <TableCell>{r.property_name || r.property_external_id || "—"}</TableCell>
                  <TableCell>{r.guest_name || "—"}</TableCell>
                  <TableCell><Badge variant="outline">{r.channel || "Direto"}</Badge></TableCell>
                  <TableCell className="text-right">{BRL2.format(Number(r.total_amount ?? 0))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
