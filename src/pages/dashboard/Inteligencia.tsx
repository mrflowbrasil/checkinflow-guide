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
  useMonthlyMetrics,
  usePropertyMetrics,
  useLastSyncedAt,
  useUpcomingCheckins,
  type DateBasis,
} from "@/hooks/useInteligencia";

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
  const netRevenue = confirmed.reduce((s, r) => s + num(r.net_amount ?? r.sell_price_corrected ?? r.total_amount), 0);
  const fees = confirmed.reduce((s, r) => s + num(r.fees_amount), 0);
  const commission = confirmed.reduce((s, r) => s + num(r.company_commission), 0);
  const nights = confirmed.reduce((s, r) => s + num(r.nights), 0);
  const count = confirmed.length;
  const avg = count > 0 ? grossRevenue / count : 0;
  const leadRows = confirmed.filter((r) => r.lead_time_days != null);
  const leadAvg = leadRows.length > 0 ? leadRows.reduce((s, r) => s + num(r.lead_time_days), 0) / leadRows.length : 0;
  return { grossRevenue, netRevenue, fees, commission, nights, count, avg, canceled: rows.length - count, leadAvg };
}

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--muted-foreground))", "hsl(var(--destructive))"];

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
          hint="Receita após dedução de taxas e ajustes (net_amount)."
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
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
                  <Line type="monotone" dataKey="confirmed" name="Confirmadas" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="canceled" name="Canceladas" stroke="hsl(var(--destructive))" strokeWidth={2} />
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
                  <Pie data={channelMix} dataKey="value" nameKey="name" outerRadius={90} label>
                    {channelMix.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
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
            <h3 className="font-semibold">Ocupação por imóvel</h3>
            <p className="text-xs text-muted-foreground">Top 10 por diárias vendidas</p>
          </div>
          <div className="h-72" aria-label="Gráfico de ocupação por imóvel">
            {propMetrics.isLoading ? <Skeleton className="h-full w-full" /> : topNights.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">Sem dados</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topNights} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={140} />
                  <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="nights" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

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
