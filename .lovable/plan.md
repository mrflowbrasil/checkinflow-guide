
# Dashboard Inteligente — `/app/inteligencia`

Painel de leitura sobre `reservations_import` via as 3 views já validadas. Multi-tenant via RLS herdada das views (`security_invoker = true`), sem alterações em tabelas ou ingestão.

## 1. Rota e navegação

- `src/App.tsx`: nova rota lazy `inteligencia` dentro de `/app` (`AppShell` + `RequireAuth`).
- `src/components/layout/AppShell.tsx`: novo item de menu **"Inteligência"** (ícone `BarChart3`) logo abaixo de **Dashboard**.
- Acesso condicional: visível apenas quando o tenant tem integração Stays/Hostaway ativa (consulta `tenant_integrations` por `tenant_id`, status `connected`). Sem integração → item escondido e rota redireciona para `/app` com toast "Disponível após conectar Stays ou Hostaway".

## 2. Página `src/pages/dashboard/Inteligencia.tsx`

Layout responsivo (mobile-first, grid 12 colunas no desktop) usando tokens semânticos do `index.css` (sem cores hardcoded).

### 2.1 Header
- Título "Inteligência de reservas" + subtítulo "Dados sincronizados em tempo real do seu PMS".
- Badge com `provider` detectado e timestamp do `MAX(synced_at)` ("Atualizado há 3 min").
- Botão "Atualizar" → invalida queries do react-query.

### 2.2 Filtros (sticky no topo do conteúdo)
- **Período**: presets (Mês atual, Últimos 30 dias, Últimos 12 meses, Ano atual, Customizado com `Calendar` + range).
- **Imóvel**: `Select` populado por `v_dashboard_property_metrics.property_name` (+ "Todos").
- **Canal**: multi-select a partir de `distinct channel` de `v_reservations_dashboard` no período.
- Estado mantido em URL via `useSearchParams` para deep-link.

### 2.3 KPIs (4 cards no topo)
Agregados em SQL sobre `v_reservations_dashboard` filtrado:
1. **Receita confirmada** (R$) — soma `total_amount` com `status != 'canceled'`.
2. **Reservas confirmadas** — contagem.
3. **Diárias vendidas** — soma `nights`.
4. **Ticket médio** — receita / reservas.

Cada card mostra valor principal + comparação vs período anterior equivalente (% e seta).

### 2.4 Gráficos (recharts via `@/components/ui/chart`)
- **Receita mensal** (BarChart 12 meses) — fonte `v_dashboard_monthly_metrics` filtrada por tenant. Tooltip com receita + reservas.
- **Reservas confirmadas vs canceladas** (LineChart mensal sobreposto) — mesma view.
- **Mix por canal** (PieChart) — `count` agrupado por `channel` no período (query em `v_reservations_dashboard`).
- **Ocupação por imóvel** (BarChart horizontal top 10) — `nights` por `property_name` em `v_dashboard_property_metrics`.

### 2.5 Tabela "Top imóveis"
Colunas: imóvel, receita, reservas, diárias, último check-in. Ordenável, paginada (10 por vez). Fonte: `v_dashboard_property_metrics`.

### 2.6 Tabela "Próximos check-ins"
`v_reservations_dashboard` onde `check_in >= today` e `status != 'canceled'`, ordenada asc, limite 20. Colunas: data, imóvel, hóspede, canal, valor.

### 2.7 Estados
- **Loading**: skeletons nos cards/gráficos/tabelas.
- **Empty** (zero reservas no período): ilustração + texto "Sem reservas no período selecionado".
- **Sem integração**: card centralizado "Conecte Stays ou Hostaway para ver seus dados" com CTA para `/app/integrations`.
- **Erro**: card de erro com botão "Tentar novamente".

## 3. Acesso a dados

Hook `src/hooks/useInteligencia.tsx`:
- `useReservationsRange(start, end, propertyId?, channels?)` → `from('v_reservations_dashboard').select(...).gte('check_in', start).lte('check_in', end)` — RLS filtra por tenant automaticamente.
- `useMonthlyMetrics(monthsBack)` → `from('v_dashboard_monthly_metrics')`.
- `usePropertyMetrics()` → `from('v_dashboard_property_metrics')`.
- `useLastSyncedAt()` → `MAX(synced_at)` via RPC simples (`select max(synced_at) from reservations_import` — RLS aplica).
- `useHasReservationsIntegration()` → checa `tenant_integrations` por providers `stays`/`hostaway` e `is_connected`.

Todas as queries usam react-query com `queryKey` incluindo tenant_id + filtros + 60s `staleTime`.

## 4. Permissão por plano

Sem nova trava de plano específica para o dashboard em si (qualquer tenant com integração Stays/Hostaway já está em `pro`/`launch`/`business` por `tenant_has_feature('pms_integrations')`). A visibilidade do menu segue a presença da integração — não duplicamos a checagem de plano aqui.

## Detalhes técnicos

- Sem novas tabelas, sem migrations, sem alterações de RLS.
- Sem mocks. Se a view retornar 0 linhas → estado vazio real.
- Formatação BRL via `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`; datas via `date-fns/format` em pt-BR.
- Acessibilidade: gráficos com `aria-label`, tabelas semânticas, foco visível.
- Performance: lazy import da página; recharts via `ResponsiveContainer`; queries paralelas; nenhuma chamada client-side carrega mais de ~2k linhas (filtro por período sempre aplicado).

## O que NÃO será feito

- Nada de export CSV/PDF, alertas, previsões, ou comparativo entre tenants (super_admin).
- Nada de escrita: dashboard é 100% leitura.
- Nenhuma alteração na função de ingestão ou nas views.

## Pergunta antes de implementar

Confirma estes 3 pontos antes de eu codificar?
1. **Período padrão** ao abrir o dashboard: "Últimos 30 dias" ou "Mês atual"?
2. **Filtro por data**: por `check_in` (default proposto) ou por `synced_at`/data de criação da reserva?
3. **Acesso**: ocultar o menu para quem não tem integração Stays/Hostaway conectada (proposto) ou mostrar sempre e exibir o estado "Conecte uma integração"?
