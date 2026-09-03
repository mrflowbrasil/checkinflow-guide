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

  // ===== INSIGHTS 11/12 — Períodos de maior demanda no histórico + sugestão de preço =====
  // Distribui cada reserva noite a noite para medir demanda real por mês e por janela de datas.
  {
    const monthAgg = new Map<number, { nights: number; revenue: number; years: Set<number> }>();
    const dayAgg = new Map<string, { nights: number; revenue: number }>(); // "MM-DD"
    let totalNights = 0;
    let totalRevenue = 0;

    history.forEach((r) => {
      if (!isConfirmed(r)) return;
      if (!r.check_in) return;
      const nights = Math.max(0, Math.round(num(r.nights)));
      if (nights <= 0 || nights > 90) return;
      const g = gross(r);
      if (g <= 0) return;
      const perNight = g / nights;
      const start = new Date(`${String(r.check_in).slice(0, 10)}T00:00:00Z`);
      if (Number.isNaN(start.getTime())) return;
      for (let i = 0; i < nights; i++) {
        const d = new Date(start.getTime() + i * 86400000);
        const m = d.getUTCMonth() + 1;
        const key = `${String(m).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
        const mAgg = monthAgg.get(m) ?? { nights: 0, revenue: 0, years: new Set<number>() };
        mAgg.nights += 1;
        mAgg.revenue += perNight;
        mAgg.years.add(d.getUTCFullYear());
        monthAgg.set(m, mAgg);
        const dAgg = dayAgg.get(key) ?? { nights: 0, revenue: 0 };
        dAgg.nights += 1;
        dAgg.revenue += perNight;
        dayAgg.set(key, dAgg);
        totalNights += 1;
        totalRevenue += perNight;
      }
    });

    const overallAdr = totalNights > 0 ? totalRevenue / totalNights : 0;

    // --- Mês de maior demanda ---
    if (monthAgg.size >= 3 && totalNights >= 30 && overallAdr > 0) {
      const months = Array.from(monthAgg.entries()).map(([m, v]) => ({
        month: m,
        nightsPerYear: v.nights / Math.max(1, v.years.size),
        nights: v.nights,
        adr: v.revenue / v.nights,
        years: v.years.size,
      }));
      const avgNightsPerYear =
        months.reduce((s, m) => s + m.nightsPerYear, 0) / months.length;
      const peak = months.slice().sort((a, b) => b.nightsPerYear - a.nightsPerYear)[0];
      const demandRatio = avgNightsPerYear > 0 ? peak.nightsPerYear / avgNightsPerYear : 1;

      // --- Mês de maior vacância (menor demanda) → sugestão promocional ---
      if (months.length >= 6) {
        const low = months.slice().sort((a, b) => a.nightsPerYear - b.nightsPerYear)[0];
        const vacancyRatio = avgNightsPerYear > 0 ? low.nightsPerYear / avgNightsPerYear : 1;
        if (vacancyRatio <= 0.65 && avgNightsPerYear >= 5) {
          const name = MONTH_NAMES_PT[low.month - 1];
          const gapPct = (1 - vacancyRatio) * 100;
          const suggestedDisc = Math.min(20, Math.max(5, Math.round(gapPct / 4)));
          const suggestedAdr = low.adr > 0 ? low.adr * (1 - suggestedDisc / 100) : overallAdr * (1 - suggestedDisc / 100);

          insights.push({
            id: "low-demand-month",
            category: "Preço",
            priority: vacancyRatio <= 0.45 ? "medium" : "low",
            title: `${name.charAt(0).toUpperCase() + name.slice(1)} é o mês de maior vacância`,
            description: `No histórico completo, ${name} tem ${PCT(gapPct)} menos diárias vendidas que a média dos meses. É o período com maior espaço para ganho de ocupação.`,
            evidence: [
              { label: "Diárias vendidas (média/ano)", value: low.nightsPerYear.toFixed(0) },
              { label: "Média dos meses", value: avgNightsPerYear.toFixed(0) },
              { label: `Diária média em ${name}`, value: BRL2.format(low.adr > 0 ? low.adr : overallAdr) },
              { label: "Desconto sugerido", value: `−${suggestedDisc}%` },
              { label: "Diária promocional", value: BRL2.format(suggestedAdr) },
              { label: "Anos analisados", value: NUM.format(low.years) },
            ],
            recommended_action: `Considere ações promocionais para ${name}: diária promocional em torno de ${BRL2.format(suggestedAdr)} (−${suggestedDisc}%), pacotes fechados, estadia mínima flexível e campanhas antecipadas nos canais. Sugestão baseada no histórico, sem garantia de resultado.`,
            confidence: low.years >= 2 ? "high" : "medium",
            related_metric: "lowDemandMonth",
          });
        }
      }

      if (demandRatio >= 1.2 && peak.nights >= 10) {
        const name = MONTH_NAMES_PT[peak.month - 1];
        const adrGap = peak.adr / overallAdr; // quanto a diária do pico já está acima da média
        const canRaise = adrGap <= 1.15;
        const suggestedPct = Math.min(20, Math.max(5, Math.round((demandRatio - 1) * 40)));
        const suggestedAdr = peak.adr * (1 + suggestedPct / 100);

        insights.push({
          id: "peak-demand-month",
          category: canRaise ? "Preço" : "Sazonalidade",
          priority: canRaise ? "low" : "info",
          title: canRaise
            ? `Oportunidade de aumentar a diária em ${name}`
            : `${name.charAt(0).toUpperCase() + name.slice(1)} é o período de maior demanda`,
          description: canRaise
            ? `No histórico completo, ${name} tem ${PCT((demandRatio - 1) * 100)} mais diárias vendidas que a média dos meses, mas a diária média praticada está próxima da média geral.`
            : `No histórico completo, ${name} concentra a maior ocupação, e a diária média já está acima da média geral.`,
          evidence: [
            { label: "Diárias vendidas (média/ano)", value: peak.nightsPerYear.toFixed(0) },
            { label: "Média dos meses", value: avgNightsPerYear.toFixed(0) },
            { label: `Diária média em ${name}`, value: BRL2.format(peak.adr) },
            { label: "Diária média geral", value: BRL2.format(overallAdr) },
            ...(canRaise
              ? [
                  { label: "Aumento sugerido", value: `+${suggestedPct}%` },
                  { label: "Diária sugerida", value: BRL2.format(suggestedAdr) },
                ]
              : []),
            { label: "Anos analisados", value: NUM.format(peak.years) },
          ],
          recommended_action: canRaise
            ? `Teste reajustar a diária de ${name} para cerca de ${BRL2.format(suggestedAdr)} (+${suggestedPct}%), acompanhando o ritmo de reservas. Sugestão baseada no histórico, sem garantia de resultado.`
            : `Mantenha a política de preços de ${name} e antecipe a abertura de disponibilidade para capturar reservas mais cedo.`,
          confidence: peak.years >= 2 ? "high" : "medium",
          related_metric: "peakDemandMonth",
        });
      }
    }

    // --- Janela de 7 dias com maior demanda (independente do ano) ---
    if (dayAgg.size >= 60 && totalNights >= 60 && overallAdr > 0) {
      const days: { key: string; nights: number; revenue: number }[] = [];
      for (let m = 1; m <= 12; m++) {
        const dim = new Date(Date.UTC(2024, m, 0)).getUTCDate();
        for (let d = 1; d <= dim; d++) {
          const key = `${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const v = dayAgg.get(key);
          days.push({ key, nights: v?.nights ?? 0, revenue: v?.revenue ?? 0 });
        }
      }
      const win = 7;
      let best = { idx: 0, nights: -1, revenue: 0 };
      for (let i = 0; i < days.length; i++) {
        let n = 0;
        let rev = 0;
        for (let k = 0; k < win; k++) {
          const d = days[(i + k) % days.length];
          n += d.nights;
          rev += d.revenue;
        }
        if (n > best.nights) best = { idx: i, nights: n, revenue: rev };
      }
      const avgWindowNights = (totalNights / days.length) * win;
      const ratio = avgWindowNights > 0 ? best.nights / avgWindowNights : 1;
      const winAdr = best.nights > 0 ? best.revenue / best.nights : 0;

      if (ratio >= 1.4 && best.nights >= 10 && winAdr > 0) {
        const fmt = (key: string) => {
          const [mm, dd] = key.split("-");
          return `${dd} de ${MONTH_NAMES_PT[Number(mm) - 1]}`;
        };
        const startKey = days[best.idx].key;
        const endKey = days[(best.idx + win - 1) % days.length].key;
        const adrGap = winAdr / overallAdr;
        const canRaise = adrGap <= 1.2;
        const suggestedPct = Math.min(25, Math.max(5, Math.round((ratio - 1) * 30)));
        const suggestedAdr = winAdr * (1 + suggestedPct / 100);

        insights.push({
          id: "peak-demand-window",
          category: canRaise ? "Preço" : "Sazonalidade",
          priority: canRaise ? "low" : "info",
          title: `Pico de reservas entre ${fmt(startKey)} e ${fmt(endKey)}`,
          description: canRaise
            ? `Essa janela de datas concentra ${PCT((ratio - 1) * 100)} mais diárias que a média do ano, e a diária média cobrada ainda está próxima da média geral.`
            : `Essa janela de datas concentra ${PCT((ratio - 1) * 100)} mais diárias que a média do ano, e a diária média já está acima da média geral.`,
          evidence: [
            { label: "Diárias no período", value: NUM.format(best.nights) },
            { label: "Média equivalente (7 dias)", value: avgWindowNights.toFixed(0) },
            { label: "Diária média no período", value: BRL2.format(winAdr) },
            { label: "Diária média geral", value: BRL2.format(overallAdr) },
            ...(canRaise
              ? [
                  { label: "Aumento sugerido", value: `+${suggestedPct}%` },
                  { label: "Diária sugerida", value: BRL2.format(suggestedAdr) },
                ]
              : []),
          ],
          recommended_action: canRaise
            ? `Considere aplicar tarifa de alta demanda entre ${fmt(startKey)} e ${fmt(endKey)}, em torno de ${BRL2.format(suggestedAdr)} (+${suggestedPct}%), com estadia mínima. Sugestão baseada no histórico.`
            : `Garanta disponibilidade e antecipe a abertura de tarifas entre ${fmt(startKey)} e ${fmt(endKey)}.`,
          confidence: "medium",
          related_metric: "peakDemandWindow",
        });
      }
    }
  }


  // Priority ordering: high > medium > low > info
  const order: Record<InsightPriority, number> = { high: 0, medium: 1, low: 2, info: 3 };
  insights.sort((a, b) => order[a.priority] - order[b.priority]);

  return insights;
}
