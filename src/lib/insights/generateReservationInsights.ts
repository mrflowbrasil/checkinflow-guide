// Deterministic insights generator for Mr Flow Inteligência.
// Reads ONLY data already loaded by the dashboard (filtered by tenant + UI filters).
// No AI calls, no mock data, no fabricated numbers.

export type InsightCategory =
  | "Receita"
  | "Preço"
  | "Canal"
  | "Imóvel"
  | "Sazonalidade"
  | "Cancelamento"
  | "Lead time"
  | "Oportunidade"
  | "Atenção"
  | "Operação";

export type InsightPriority = "high" | "medium" | "low" | "info";
export type InsightConfidence = "high" | "medium" | "low";

export interface InsightEvidence {
  label: string;
  value: string;
}

export interface Insight {
  id: string;
  category: InsightCategory;
  priority: InsightPriority;
  title: string;
  description: string;
  evidence: InsightEvidence[];
  recommended_action: string;
  confidence: InsightConfidence;
  related_metric?: string;
  related_property?: string | null;
  related_channel?: string | null;
}

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const BRL2 = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const NUM = new Intl.NumberFormat("pt-BR");
const PCT = (v: number) => `${v.toFixed(1)}%`;

const MONTH_NAMES_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

const num = (v: any) => Number(v ?? 0) || 0;
const isConfirmed = (r: any) => r.status !== "canceled";

function gross(r: any) { return num(r.total_amount ?? r.sell_price_corrected); }
function fees(r: any) { return num(r.total_forward_fee_all ?? r.total_forward_fee ?? r.fees_amount); }
function commission(r: any) { return num(r.company_commission); }
function net(r: any) { return r.buy_price != null ? num(r.buy_price) : gross(r) - fees(r) - commission(r); }

export interface GenerateInput {
  current: any[];           // filtered current period rows
  previous: any[];          // filtered previous period rows (mirrored)
  history: any[];           // full history filtered by property/channel (basis-aware)
  dateBasis: "check_in" | "booked_at";
}

export function generateReservationInsights({ current, previous, history, dateBasis }: GenerateInput): Insight[] {
  const insights: Insight[] = [];

  const confirmedCurrent = current.filter(isConfirmed);
  const confirmedPrev = previous.filter(isConfirmed);

  // ----- Aggregates current period -----
  const grossCur = confirmedCurrent.reduce((s, r) => s + gross(r), 0);
  const netCur = confirmedCurrent.reduce((s, r) => s + net(r), 0);
  const feesCur = confirmedCurrent.reduce((s, r) => s + fees(r), 0);
  const commCur = confirmedCurrent.reduce((s, r) => s + commission(r), 0);
  const countCur = confirmedCurrent.length;
  const grossPrev = confirmedPrev.reduce((s, r) => s + gross(r), 0);

  // ===== INSIGHT 8 — Variação vs período anterior =====
  if (grossPrev > 0 && countCur > 0) {
    const variation = ((grossCur - grossPrev) / grossPrev) * 100;
    if (Math.abs(variation) >= 5) {
      const up = variation > 0;
      insights.push({
        id: "period-variation",
        category: "Receita",
        priority: up ? "low" : "high",
        title: up
          ? "Receita cresceu em relação ao período anterior"
          : "Receita caiu em relação ao período anterior",
        description: up
          ? `A receita bruta aumentou ${PCT(Math.abs(variation))} em comparação com o período anterior equivalente.`
          : `A receita bruta recuou ${PCT(Math.abs(variation))} em comparação com o período anterior equivalente.`,
        evidence: [
          { label: "Período atual", value: BRL.format(grossCur) },
          { label: "Período anterior", value: BRL.format(grossPrev) },
          { label: "Variação", value: `${up ? "+" : "−"}${PCT(Math.abs(variation))}` },
        ],
        recommended_action: up
          ? "Analise quais canais e imóveis puxaram esse crescimento para reforçar o que está funcionando."
          : "Identifique canais e imóveis com maior queda para reagir antes que o efeito se amplie.",
        confidence: "high",
        related_metric: "grossRevenue",
      });
    }
  }

  // ===== INSIGHT 6 — Taxas/comissão elevadas =====
  if (grossCur > 0) {
    const burden = ((feesCur + commCur) / grossCur) * 100;
    if (burden >= 20) {
      insights.push({
        id: "fees-burden",
        category: "Receita",
        priority: burden >= 30 ? "high" : "medium",
        title: "As taxas representam uma parcela relevante da receita",
        description: `No período selecionado, taxas e comissões somam ${PCT(burden)} da receita bruta.`,
        evidence: [
          { label: "Taxas", value: BRL.format(feesCur) },
          { label: "Comissão", value: BRL.format(commCur) },
          { label: "Receita bruta", value: BRL.format(grossCur) },
        ],
        recommended_action: "Compare canais por receita líquida, não apenas por receita bruta, para entender margem real.",
        confidence: "high",
        related_metric: "fees",
      });
    }
  }

  // ===== INSIGHT 7 — Lead time =====
  const leadRows = confirmedCurrent.filter((r) => r.lead_time_days != null);
  if (leadRows.length >= 5) {
    const leadAvg = leadRows.reduce((s, r) => s + num(r.lead_time_days), 0) / leadRows.length;
    if (leadAvg < 7) {
      insights.push({
        id: "lead-time-low",
        category: "Lead time",
        priority: "medium",
        title: "Reservas estão entrando com pouca antecedência",
        description: `O lead time médio do período está abaixo de 7 dias (${leadAvg.toFixed(1)} dias).`,
        evidence: [
          { label: "Lead time médio", value: `${leadAvg.toFixed(1)} dias` },
          { label: "Reservas analisadas", value: NUM.format(leadRows.length) },
        ],
        recommended_action: "Considere ações comerciais antecipadas (campanhas, descontos early-bird) para reduzir dependência de reservas de última hora.",
        confidence: "medium",
        related_metric: "leadTime",
      });
    } else if (leadAvg > 20) {
      insights.push({
        id: "lead-time-high",
        category: "Lead time",
        priority: "info",
        title: "Hóspedes estão reservando com boa antecedência",
        description: `O lead time médio está em ${leadAvg.toFixed(1)} dias, favorecendo planejamento operacional.`,
        evidence: [
          { label: "Lead time médio", value: `${leadAvg.toFixed(1)} dias` },
        ],
        recommended_action: "Aproveite a previsibilidade para ajustar preços e estoque com mais segurança.",
        confidence: "medium",
        related_metric: "leadTime",
      });
    }
  }

  // ===== Agrupamento por canal =====
  const byChannel = new Map<string, { gross: number; net: number; count: number }>();
  confirmedCurrent.forEach((r) => {
    const ch = r.channel || "Direto";
    const cur = byChannel.get(ch) ?? { gross: 0, net: 0, count: 0 };
    cur.gross += gross(r);
    cur.net += net(r);
    cur.count += 1;
    byChannel.set(ch, cur);
  });

  // INSIGHT 2 — Canal dominante
  if (byChannel.size > 0 && grossCur > 0) {
    const sorted = Array.from(byChannel.entries()).sort((a, b) => b[1].gross - a[1].gross);
    const [topCh, topAgg] = sorted[0];
    const share = (topAgg.gross / grossCur) * 100;
    if (share >= 25) {
      insights.push({
        id: "channel-leader",
        category: "Canal",
        priority: share >= 60 ? "medium" : "info",
        title: `${topCh} lidera a receita no período`,
        description: `O canal ${topCh} representa ${PCT(share)} da receita confirmada no período selecionado.`,
        evidence: [
          { label: "Receita do canal", value: BRL.format(topAgg.gross) },
          { label: "Reservas", value: NUM.format(topAgg.count) },
          { label: "Participação", value: PCT(share) },
        ],
        recommended_action: share >= 60
          ? "A concentração nesse canal é alta. Vale acompanhar e diversificar para reduzir risco."
          : "Compare o custo do canal com a receita líquida para avaliar margem.",
        confidence: "high",
        related_metric: "channelRevenue",
        related_channel: topCh,
      });
    }
  }

  // INSIGHT 3 — Canal com ticket médio maior
  if (countCur >= 5) {
    const globalAvg = grossCur / countCur;
    const candidates = Array.from(byChannel.entries())
      .filter(([, v]) => v.count >= 5)
      .map(([name, v]) => ({ name, avg: v.gross / v.count, count: v.count }))
      .sort((a, b) => b.avg - a.avg);
    if (candidates.length > 0) {
      const best = candidates[0];
      if (best.avg > globalAvg * 1.15) {
        insights.push({
          id: "channel-best-ticket",
          category: "Canal",
          priority: "low",
          title: `${best.name} tem ticket médio acima da média`,
          description: `O canal ${best.name} apresenta ticket médio superior à média geral no período analisado.`,
          evidence: [
            { label: `Ticket médio (${best.name})`, value: BRL2.format(best.avg) },
            { label: "Ticket médio geral", value: BRL2.format(globalAvg) },
            { label: "Reservas no canal", value: NUM.format(best.count) },
          ],
          recommended_action: "Considere fortalecer disponibilidade, fotos e descrições dos imóveis nesse canal.",
          confidence: "medium",
          related_metric: "channelAvg",
          related_channel: best.name,
        });
      }
    }
  }

  // ===== Agrupamento por imóvel =====
  const byProp = new Map<string, { name: string; gross: number; net: number; count: number; nights: number }>();
  confirmedCurrent.forEach((r) => {
    const id = r.property_external_id || r.property_name || "—";
    const name = r.property_name || r.property_external_id || "—";
    const cur = byProp.get(id) ?? { name, gross: 0, net: 0, count: 0, nights: 0 };
    cur.gross += gross(r);
    cur.net += net(r);
    cur.count += 1;
    cur.nights += num(r.nights);
    byProp.set(id, cur);
  });

  // INSIGHT 4 — Imóvel líder
  if (byProp.size > 0) {
    const sorted = Array.from(byProp.values()).sort((a, b) => b.gross - a.gross);
    const top = sorted[0];
    if (top.gross > 0) {
      insights.push({
        id: "property-leader",
        category: "Imóvel",
        priority: "info",
        title: `${top.name} lidera a receita`,
        description: "Este imóvel gerou a maior receita no período selecionado.",
        evidence: [
          { label: "Receita", value: BRL.format(top.gross) },
          { label: "Reservas", value: NUM.format(top.count) },
          { label: "Diárias vendidas", value: NUM.format(top.nights) },
        ],
        recommended_action: "Use este imóvel como referência para comparar preço, fotos, descrição e canais dos demais.",
        confidence: "high",
        related_metric: "propertyRevenue",
        related_property: top.name,
      });
    }

    // INSIGHT 9 — Concentração de receita em poucos imóveis
    if (sorted.length >= 4) {
      const totalGross = sorted.reduce((s, p) => s + p.gross, 0);
      const top3 = sorted.slice(0, 3).reduce((s, p) => s + p.gross, 0);
      const share = totalGross > 0 ? (top3 / totalGross) * 100 : 0;
      if (share >= 60) {
        insights.push({
          id: "revenue-concentration",
          category: "Imóvel",
          priority: "medium",
          title: "Receita concentrada em poucos imóveis",
          description: `Os 3 principais imóveis representam ${PCT(share)} da receita do período.`,
          evidence: [
            { label: "Top 3", value: BRL.format(top3) },
            { label: "Total", value: BRL.format(totalGross) },
            { label: "Imóveis analisados", value: NUM.format(sorted.length) },
          ],
          recommended_action: "Monitore a dependência desses imóveis e busque melhorar a performance dos demais.",
          confidence: "medium",
          related_metric: "propertyConcentration",
        });
      }
    }

    // INSIGHT 5 — Imóveis abaixo da média
    if (byProp.size >= 4) {
      const arr = Array.from(byProp.values()).filter((p) => p.count >= 2);
      if (arr.length >= 3) {
        const avgNights = arr.reduce((s, p) => s + p.nights, 0) / arr.length;
        const below = arr.filter((p) => p.nights < avgNights * 0.5).sort((a, b) => a.nights - b.nights);
        if (below.length > 0) {
          const example = below[0];
          insights.push({
            id: "property-underperform",
            category: "Imóvel",
            priority: "medium",
            title: "Alguns imóveis estão abaixo da média de diárias vendidas",
            description: `${below.length} imóvel(is) com volume de diárias bem inferior à média do período.`,
            evidence: [
              { label: "Exemplo", value: example.name },
              { label: "Diárias do imóvel", value: NUM.format(example.nights) },
              { label: "Média de diárias", value: avgNights.toFixed(1) },
            ],
            recommended_action: "Revise fotos, descrição, preço e disponibilidade nos canais para esses imóveis.",
            confidence: "medium",
            related_metric: "propertyNights",
            related_property: example.name,
          });
        }
      }
    }
  }

  // ===== INSIGHT 1 — Melhor mês histórico (sazonalidade) =====
  if (history.length > 0) {
    const byMonthOfYear = new Map<number, number>(); // 1..12 → net
    history.forEach((r) => {
      if (!isConfirmed(r)) return;
      const basis = dateBasis === "booked_at" ? r.booked_at : r.check_in;
      if (!basis) return;
      const m = Number(String(basis).slice(5, 7));
      if (!m) return;
      byMonthOfYear.set(m, (byMonthOfYear.get(m) ?? 0) + net(r));
    });
    if (byMonthOfYear.size >= 3) {
      const sorted = Array.from(byMonthOfYear.entries()).sort((a, b) => b[1] - a[1]);
      const [bestMonth, bestVal] = sorted[0];
      const total = sorted.reduce((s, [, v]) => s + v, 0);
      const share = total > 0 ? (bestVal / total) * 100 : 0;
      if (bestVal > 0 && share >= 12) {
        const name = MONTH_NAMES_PT[bestMonth - 1];
        insights.push({
          id: "best-month",
          category: "Sazonalidade",
          priority: "low",
          title: `${name.charAt(0).toUpperCase() + name.slice(1)} é o mês mais forte do histórico`,
          description: `Os dados mostram que ${name} concentra os maiores picos de receita líquida no histórico disponível.`,
          evidence: [
            { label: `Receita líquida em ${name}`, value: BRL.format(bestVal) },
            { label: "Participação no histórico", value: PCT(share) },
          ],
          recommended_action: `Planeje campanhas e ajustes de preço antes do próximo ${name}. Com base no histórico, não é garantia de resultado.`,
          confidence: "medium",
          related_metric: "seasonality",
        });
      }
    }
  }

  // ===== INSIGHT 10 — Reservas futuras reserved =====
  const todayISO = new Date().toISOString().slice(0, 10);
  const futureReserved = history.filter(
    (r) => r.status === "reserved" && r.check_in && String(r.check_in) >= todayISO,
  );
  if (futureReserved.length > 0) {
    insights.push({
      id: "future-reserved",
      category: "Operação",
      priority: "medium",
      title: "Existem reservas futuras ainda como reserved",
      description: "Foram encontradas reservas futuras ainda marcadas como reserved.",
      evidence: [
        { label: "Reservas reserved", value: NUM.format(futureReserved.length) },
      ],
      recommended_action: "Verifique se essas reservas precisam ser confirmadas, acompanhadas ou atualizadas no PMS.",
      confidence: "high",
      related_metric: "reservedStatus",
    });
  }

  // Priority ordering: high > medium > low > info
  const order: Record<InsightPriority, number> = { high: 0, medium: 1, low: 2, info: 3 };
  insights.sort((a, b) => order[a.priority] - order[b.priority]);

  return insights;
}
