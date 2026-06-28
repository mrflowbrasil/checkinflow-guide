import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format, parseISO, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Info } from "lucide-react";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const BRL2 = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const NUM = new Intl.NumberFormat("pt-BR");

// Mr Flow harmonic palette — soft & desaturated
const CHANNEL_COLORS: Record<string, string> = {
  "booking.com": "#7FB3D5",          // azul suave
  airbnb: "#F5A78A",                  // coral suave
  direct: "#00FFFF",                  // ciano Mr Flow
  decolar: "#B39DDB",                 // roxo suave
  "google vacation rentals": "#A5D6A7", // verde suave
  vrbo: "#F4C988",                    // âmbar suave
  stays: "#9FD7CE",                   // teal suave
  hostaway: "#C8B6E2",                // lilás suave
  outros: "#CBD5E1",                  // cinza neutro
  unknown: "#E2E8F0",                 // cinza claro
};
const FALLBACK_PALETTE = ["#9FD7CE", "#F4C988", "#C8B6E2", "#FAD2D2", "#BFD8B8", "#D6C6E1"];

function normKey(name: string): string {
  const k = (name || "").toLowerCase().trim();
  if (!k) return "unknown";
  if (k === "booking" || k === "booking.com") return "booking.com";
  if (k === "airbnb") return "airbnb";
  if (k === "direto" || k === "direct") return "direct";
  if (k === "api decolar" || k === "decolar") return "decolar";
  if (k === "api googlevr" || k === "googlevr" || k.includes("google vacation")) return "google vacation rentals";
  if (k === "vrbo") return "vrbo";
  if (k === "stays") return "stays";
  if (k === "hostaway") return "hostaway";
  return k;
}

const FRIENDLY: Record<string, string> = {
  "booking.com": "Booking.com",
  airbnb: "Airbnb",
  direct: "Direto",
  decolar: "Decolar",
  "google vacation rentals": "Google Vacation Rentals",
  vrbo: "VRBO",
  stays: "Stays",
  hostaway: "Hostaway",
  unknown: "Não identificado",
  outros: "Outros",
};
function friendly(key: string): string {
  return FRIENDLY[key] ?? key.replace(/\b\w/g, (c) => c.toUpperCase());
}
function colorFor(key: string, idx: number): string {
  return CHANNEL_COLORS[key] ?? FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length];
}

type Row = {
  status?: string | null;
  channel?: string | null;
  check_in?: string | null;
  booked_at?: string | null;
  sell_price_corrected?: number | null;
  total_amount?: number | null;
  fees_amount?: number | null;
  company_commission?: number | null;
};

type Mode = "stacked" | "grouped" | "share";

interface Props {
  rows: Row[];
  dateBasis: "check_in" | "booked_at";
  loading?: boolean;
  rangeLabel?: string;
}

export function ChannelRevenueCard({ rows, dateBasis, loading, rangeLabel }: Props) {
  const [mode, setMode] = useState<Mode>("stacked");

  const { data, channels, monthTotals, channelTotals, hasUnknown, totalNet } = useMemo(() => {
    const today = new Date();
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(today, i);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    const num = (v: any) => Number(v ?? 0) || 0;
    // per (month, channel) → { net, gross, count }
    const agg = new Map<string, Map<string, { net: number; gross: number; count: number }>>();
    const channelNetAll = new Map<string, number>();
    let totalNet = 0;
    rows.forEach((r) => {
      if (r.status === "canceled") return;
      const basis = dateBasis === "booked_at" ? r.booked_at : r.check_in;
      if (!basis) return;
      const k = String(basis).slice(0, 7);
      if (!months.includes(k)) return;
      const ch = normKey(r.channel || "");
      const gross = num((r as any).total_amount ?? r.sell_price_corrected);
      // Receita líquida vem direto de buy_price (não subtrair taxas/comissão de novo).
      const net = (r as any).buy_price != null
        ? num((r as any).buy_price)
        : gross - num((r as any).total_forward_fee_all ?? (r as any).total_forward_fee ?? r.fees_amount) - num(r.company_commission);
      const m = agg.get(k) ?? new Map();
      const cur = m.get(ch) ?? { net: 0, gross: 0, count: 0 };
      cur.net += net;
      cur.gross += gross;
      cur.count += 1;
      m.set(ch, cur);
      agg.set(k, m);
      channelNetAll.set(ch, (channelNetAll.get(ch) ?? 0) + net);
      totalNet += net;
    });

    // Group channels under 2% as "outros" (but keep "unknown" visible)
    const threshold = totalNet * 0.02;
    const keep = new Set<string>();
    channelNetAll.forEach((v, k) => {
      if (k === "unknown" || v >= threshold) keep.add(k);
    });
    const hasOutros = Array.from(channelNetAll.keys()).some((k) => !keep.has(k));

    // ordered channels by total net desc; "outros" last, "unknown" before outros
    const ordered = Array.from(keep)
      .sort((a, b) => (channelNetAll.get(b) ?? 0) - (channelNetAll.get(a) ?? 0))
      .filter((k) => k !== "unknown");
    if (channelNetAll.has("unknown")) ordered.push("unknown");
    if (hasOutros) ordered.push("outros");

    const channelTotals = new Map<string, { net: number; gross: number; count: number }>();
    ordered.forEach((k) => channelTotals.set(k, { net: 0, gross: 0, count: 0 }));

    const monthTotals = new Map<string, { net: number; gross: number; count: number }>();
    const data = months.map((k) => {
      const m = agg.get(k) ?? new Map();
      const row: Record<string, any> = {
        _key: k,
        label: format(parseISO(`${k}-01`), "MMM/yy", { locale: ptBR }),
        _detail: {} as Record<string, { net: number; gross: number; count: number }>,
      };
      let monthNet = 0;
      let monthGross = 0;
      let monthCount = 0;
      ordered.forEach((ch) => { row[ch] = 0; row._detail[ch] = { net: 0, gross: 0, count: 0 }; });
      m.forEach((v, ch) => {
        const targetKey = keep.has(ch) ? ch : "outros";
        row[targetKey] = (row[targetKey] ?? 0) + v.net;
        const d = row._detail[targetKey] ?? { net: 0, gross: 0, count: 0 };
        d.net += v.net; d.gross += v.gross; d.count += v.count;
        row._detail[targetKey] = d;
        const t = channelTotals.get(targetKey) ?? { net: 0, gross: 0, count: 0 };
        t.net += v.net; t.gross += v.gross; t.count += v.count;
        channelTotals.set(targetKey, t);
        monthNet += v.net; monthGross += v.gross; monthCount += v.count;
      });
      ordered.forEach((ch) => { row[ch] = Math.round(row[ch] ?? 0); });
      row._monthNet = monthNet;
      monthTotals.set(k, { net: monthNet, gross: monthGross, count: monthCount });
      return row;
    });

    return {
      data,
      channels: ordered,
      monthTotals,
      channelTotals,
      hasUnknown: channelNetAll.has("unknown"),
      totalNet,
    };
  }, [rows, dateBasis]);

  // For share mode: convert to percentages
  const shareData = useMemo(() => {
    return data.map((row) => {
      const total = row._monthNet || 0;
      const out: Record<string, any> = { label: row.label, _detail: row._detail, _monthNet: total };
      channels.forEach((c) => {
        out[c] = total > 0 ? Number(((row[c] / total) * 100).toFixed(1)) : 0;
      });
      return out;
    });
  }, [data, channels]);

  const leader = useMemo(() => {
    let bestKey: string | null = null;
    let bestNet = -Infinity;
    channelTotals.forEach((v, k) => {
      if (v.net > bestNet) { bestNet = v.net; bestKey = k; }
    });
    if (!bestKey) return null;
    const share = totalNet > 0 ? (bestNet / totalNet) * 100 : 0;
    return { key: bestKey, net: bestNet, share };
  }, [channelTotals, totalNet]);

  const isEmpty = channels.length === 0 || totalNet === 0;
  const chartData = mode === "share" ? shareData : data;

  const renderTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    // Pull detail from underlying datum
    const detail = payload[0]?.payload?._detail as Record<string, { net: number; gross: number; count: number }> | undefined;
    const monthNet = payload[0]?.payload?._monthNet ?? 0;
    // sort entries by value desc
    const entries = [...payload].sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    return (
      <div className="rounded-lg border border-border/60 bg-background/95 backdrop-blur px-3 py-2 shadow-lg text-xs min-w-[220px]">
        <div className="font-medium mb-1.5 text-foreground">{label}</div>
        <div className="space-y-1">
          {entries.map((e: any) => {
            const k = e.dataKey as string;
            const d = detail?.[k];
            const net = d?.net ?? e.value ?? 0;
            const share = monthNet > 0 ? (net / monthNet) * 100 : 0;
            return (
              <div key={k} className="border-b border-border/30 last:border-0 pb-1 last:pb-0">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-sm" style={{ background: e.color }} />
                  <span className="text-foreground font-medium">{friendly(k)}</span>
                </div>
                <div className="pl-3.5 text-muted-foreground space-y-0.5">
                  <div>Receita líquida: <span className="text-foreground font-medium">{BRL2.format(net)}</span></div>
                  {d?.gross != null && d.gross !== net && (
                    <div>Receita bruta: {BRL2.format(d.gross)}</div>
                  )}
                  {d?.count != null && <div>Reservas: {NUM.format(d.count)}</div>}
                  <div>Participação: {share.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-5 shadow-card">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div>
          <h3 className="font-semibold">Receita líquida por canal</h3>
          <p className="text-xs text-muted-foreground">
            Evolução mensal da receita líquida por origem da reserva · {rangeLabel ?? "Últimos 12 meses"}
          </p>
        </div>
        <ToggleGroup
          type="single"
          size="sm"
          value={mode}
          onValueChange={(v) => v && setMode(v as Mode)}
          className="bg-muted/50 rounded-md p-0.5"
        >
          <ToggleGroupItem value="stacked" className="text-xs h-7 px-2.5">Empilhado</ToggleGroupItem>
          <ToggleGroupItem value="grouped" className="text-xs h-7 px-2.5">Por canal</ToggleGroupItem>
          <ToggleGroupItem value="share" className="text-xs h-7 px-2.5">Participação %</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid lg:grid-cols-[1fr_220px] gap-5">
        <div className="h-80 min-w-0" aria-label="Gráfico de receita líquida por canal">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : isEmpty ? (
            <div className="h-full grid place-items-center text-sm text-muted-foreground text-center px-4">
              Nenhuma receita por canal encontrada para este período.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="22%" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" vertical={false} />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (mode === "share" ? `${v}%` : BRL.format(v))}
                  domain={mode === "share" ? [0, 100] : undefined}
                />
                <Tooltip cursor={{ fill: "hsl(var(--muted) / 0.4)" }} content={renderTooltip} />
                {channels.map((c, i) => {
                  const isLast = i === channels.length - 1;
                  const stackId = mode === "grouped" ? undefined : "ch";
                  return (
                    <Bar
                      key={c}
                      dataKey={c}
                      stackId={stackId}
                      name={friendly(c)}
                      fill={colorFor(c, i)}
                      radius={mode === "grouped" ? [4, 4, 0, 0] : isLast ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                      maxBarSize={mode === "grouped" ? 18 : 42}
                    />
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Side: legend + executive summary */}
        <div className="space-y-4">
          {leader && !isEmpty && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Canal líder no período</div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: colorFor(leader.key, channels.indexOf(leader.key)) }} />
                <span className="font-semibold text-sm">{friendly(leader.key)}</span>
              </div>
              <div className="text-sm">
                <div className="text-foreground font-medium">{BRL2.format(leader.net)}</div>
                <div className="text-xs text-muted-foreground">{leader.share.toFixed(1)}% da receita líquida</div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug pt-1 border-t border-border/40">
                {friendly(leader.key)} lidera a receita líquida no período. Compare com taxas e comissão para avaliar margem.
              </p>
            </div>
          )}

          {channels.length > 0 && (
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Canais</div>
              <ul className="space-y-1.5">
                {channels.map((c, i) => {
                  const t = channelTotals.get(c);
                  const share = totalNet > 0 && t ? (t.net / totalNet) * 100 : 0;
                  return (
                    <li key={c} className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className="inline-block w-2 h-2 rounded-sm shrink-0" style={{ background: colorFor(c, i) }} />
                        <span className="truncate text-foreground">{friendly(c)}</span>
                      </span>
                      <span className="text-muted-foreground tabular-nums shrink-0">{share.toFixed(1)}%</span>
                    </li>
                  );
                })}
              </ul>
              {hasUnknown && (
                <p className="mt-2 flex gap-1 text-[10px] text-muted-foreground leading-snug">
                  <Info className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>"Não identificado" = reservas sem origem identificada no payload importado.</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
