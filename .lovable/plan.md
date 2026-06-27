# ETAPA 2 — Frontend do Dashboard de Inteligência

Escopo: consumir as novas colunas da view (`net_amount`, `fees_amount`, `buy_price`, `company_commission`, `sell_price_corrected`, `booked_at`, `lead_time_days`) e reorganizar a página em **12 blocos** com comparações dinâmicas, evolução anual e motor de insights. Sem mudanças no banco.

Para evitar uma única entrega gigantesca, vou dividir em **3 sub-etapas**. Cada uma deixa a página funcionando — você confirma antes da próxima.

---

## Sub-etapa 2.1 — Fundação (hook + filtros + KPIs financeiros)

**`src/hooks/useInteligencia.tsx`**
- Novo `useReservationsAll(filters)` que busca todo o histórico paginado em chunks de 1000 (Supabase tem cap de 1000/req). Cache 5min.
- Novo filtro server-side opcional por `booked_at` (data de reserva) vs `check_in` (data de estada) — controlado por parâmetro `dateBasis`.
- Manter hooks atuais funcionando (sem breaking changes).

**`src/pages/dashboard/Inteligencia.tsx`**
- Barra de filtros expandida:
  - Período: `30d / mês atual / 90d / 6m / 12m / YTD / ano anterior / todo histórico / custom (date range picker)`.
  - Base da data: `Check-in` (padrão) ou `Reserva (booked_at)` com tooltip explicando.
  - Imóvel (mantém).
  - Canal (novo, multiselect).
- KPIs reformulados (linha 1):
  - Receita bruta (`sell_price_corrected`)
  - Receita líquida (`net_amount`)
  - Taxas (`fees_amount`)
  - Comissão (`company_commission`)
- KPIs linha 2:
  - Reservas confirmadas / Diárias / Ticket médio / Lead time médio (`lead_time_days`)
- Cada KPI traz delta vs período anterior espelhado + tooltip com a fórmula.

**Critério de aceite 2.1**: filtros funcionam, KPIs financeiros exibem valores reais e batem com amostra manual em 2-3 reservas.

---

## Sub-etapa 2.2 — Evolução anual + sazonalidade + canais

- **Evolução anual comparativa**: gráfico de linhas com séries por ano (2024 vs 2025 vs 2026), eixo X = mês (Jan–Dez). Métrica selecionável: Receita líquida / Reservas / Diárias / Ticket médio.
- **Sazonalidade (heatmap)**: matriz Ano × Mês com intensidade = receita líquida. Tooltip detalhado.
- **Distribuição por canal**: barras empilhadas por mês (últimos 12) + tabela com receita, reservas, ticket, % do total, lead time médio por canal.
- **Lead time**: histograma (0-7, 8-30, 31-60, 61-90, 90+ dias) com % de reservas em cada faixa.

**Critério de aceite 2.2**: gráficos renderizam com dados do histórico completo, comparação ano a ano visível.

---

## Sub-etapa 2.3 — Imóveis + Insights + Próximas chegadas

- **Performance por imóvel** (tabela expandida): receita bruta, líquida, comissão, taxas, reservas, diárias, ticket médio, lead time médio, ocupação%, ranking; ordenação por coluna.
- **Top/Bottom**: top 5 maior receita líquida + bottom 5 (atenção).
- **Motor de Insights** (cards textuais auto-gerados):
  - Melhor mês do ano atual.
  - Canal de maior crescimento vs período anterior.
  - Imóvel com queda relevante (-20% receita líquida vs período anterior).
  - Tendência de lead time (encurtando / estendendo).
  - Alerta de concentração (se >40% receita vem de 1 canal/imóvel).
- **Próximas chegadas** (mantém, com mais colunas: canal, ticket, lead time).

**Critério de aceite 2.3**: insights aparecem só quando dados suportam, tabela ordenável, sem regressão.

---

## Técnico

- Toda agregação em memória (`useMemo`) sobre o resultado de `useReservationsAll`. Sem novas RPCs.
- Formatadores BRL/percent compartilhados.
- Skeletons em cada bloco; erro isolado por bloco não derruba a página.
- Sem mexer em `templates.ts`, banco, edge functions ou outras telas.

---

Posso começar pela **Sub-etapa 2.1** assim que aprovar?
