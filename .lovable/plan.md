Atualização da página de Planos e Cobrança

## Resumo

Atualizar a estrutura de pricing para 5 planos (Single, Starter, Pro, Business, Enterprise), mantendo visual moderno/clean atual, identidade visual, permissões e a marcação "Mais popular" no Pro. O Enterprise terá tratamento premium e CTA de contato comercial.

## 1. Banco de dados (migração)

Atualizar a tabela `subscription_plans`:

- `**free` → renomear para Single (mantém o `code='free'` internamente para não quebrar FKs/lógica existente)**
  - `name = 'Single'`
  - `description = 'Host individual'`
  - `price_cents = 890` (R$ 8,90/mês)
  - `price_yearly_cents = 8900` (R$ 89,00/ano)
  - `property_limit = 1`
- `**starter**`
  - `description = 'Pequenas operações'`
  - mantém `price_cents = 2990`, `price_yearly_cents = 29900`, `property_limit = 5`
- `**pro**`
  - `description = 'Operação profissional'`
  - `price_cents = 8990` (era 4990)
  - `price_yearly_cents = 89900` (era 49900)
  - mantém `property_limit = 20`
- `**business**`
  - `description = 'Administradora'`
  - `price_cents = 19990` (era 9990)
  - `price_yearly_cents = 199000` (era 99900)
  - `property_limit = 50` (era 999999)
- **Novo `enterprise**` (`position = 5`)
  - `name = 'Enterprise'`, `description = 'Rede / grande operação'`
  - `price_cents = 0`, `price_yearly_cents = 0`
  - `property_limit = 999999`
  - `is_active = true`
  - `stripe_price_id_monthly = NULL`, `stripe_price_id_yearly = NULL` (CTA é "Falar com comercial", sem checkout)

Observação: como `business` deixa de ser ilimitado, qualquer tenant `business` que hoje tenha >50 imóveis continua existindo sem bloqueio retroativo (a checagem só impede novas criações). Isso é coerente com o comportamento atual de `usePlanUsage`/`UpgradePromptDialog`.

## 2. Stripe (atualizar via Lovable Cloud)

Atualizar/criar prices no Stripe correspondendo aos novos valores:

- `single_monthly` (R$ 8,90), `single_yearly` (R$ 89,00) — novos
- `pro_monthly` R$ 89,90 e `pro_yearly` R$ 899,00 — substituir
- `business_monthly` R$ 199,90 e `business_yearly` R$ 1.990,00 — substituir
- Starter mantém valores atuais
- Enterprise: sem price (CTA externo)

A coluna `stripe_price_id_*` da tabela `subscription_plans` será atualizada para refletir os novos `lookup_key` quando recriados. Trial de 30 dias para Single será configurado via `subscription_data.trial_period_days = 30` no `create-checkout` (apenas quando o priceId for `single_*`).

## 3. Frontend — `src/pages/dashboard/Billing.tsx`

Sem mudar a arquitetura, ajustar:

- **Grid responsivo para 5 planos**:
  - mobile: 1 coluna · sm: 2 · lg: 3 · xl: 5
  - `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4`
- `**PLAN_FEATURES**`: adicionar entradas para `single` (mesmas features do antigo free) e `enterprise` (suporte prioritário, onboarding assistido, condições personalizadas, escalabilidade ilimitada).
- **Texto auxiliar "R$ X por imóvel"**: calcular `price_cents / property_limit` para Starter, Pro e Business e exibir abaixo do preço, em `text-xs text-muted-foreground`.
- **Preço mensal equivalente no anual**: quando `interval === "year"`, mostrar logo abaixo do preço grande: "Equivalente a R$ X,XX/mês" (= `price_yearly_cents/12`).
- **Card Single**:
  - badge `"30 dias grátis"` no topo (estilo `secondary`)
  - CTA: `"Começar grátis"`
- **Card Pro**: mantém badge `Sparkles "Mais popular"` (já implementado).
- **Card Enterprise** (visual premium):
  - borda gradiente sutil (ex: `border-primary/40 bg-gradient-to-br from-card to-primary/5`)
  - ícone Crown/Building2 no topo
  - preço: `"Sob consulta"` (texto, não número)
  - descrição auxiliar: "Planos personalizados para grandes operações"
  - CTA distinto: variante `default` com ícone, texto `"Falar com comercial"`, abrindo `mailto:comercial@mrflow.com.br` (ou WhatsApp — confirmar abaixo) em nova aba; nunca chama `setCheckoutPriceId`.
  - lista de benefícios com ícones (Headphones, Rocket, Settings, TrendingUp).
- **Hierarquia visual e espaçamento**:
  - aumentar `space-y` interno do card
  - preço em `text-3xl`/`text-4xl` com `font-bold tracking-tight`
  - descrição em `text-sm text-muted-foreground` com `min-h` para alinhar entre cards
  - separador sutil entre preço e lista de features
- **Filtro do mapa de checkout**: o Enterprise é ignorado pelo botão "Assinar" (sem `priceId`), e o botão de mailto é renderizado condicionalmente quando `plan.code === 'enterprise'`.

## 4. Edge function — `supabase/functions/create-checkout/index.ts`

Adicionar `subscription_data.trial_period_days = 30` quando o `priceId` começar com `single_` (somente Single tem trial). Demais planos seguem fluxo atual.

## 5. Webhook — `supabase/functions/payments-webhook/index.ts`

Adicionar mapeamento `if (priceId.startsWith("single")) return "free";` mantendo `code='free'` no banco para o plano Single (já que renomeamos só o `name`). Nenhuma outra mudança de lógica.

## Pontos fora do escopo (não serão alterados)

- Permissões/feature gates de Starter/Pro/Business (`has_plan_feature`, `usePlanFeatures`).
- Estrutura da tabela `subscriptions`, `tenants`.
- Templates, integrações, demais páginas do dashboard.

## Pergunta antes de implementar

1. CTA "Falar com comercial" do Enterprise:  link de WhatsApp: 5521996507509