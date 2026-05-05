
## Objetivo

Reorganizar os 4 planos com novos preços/limites e aplicar gates (cliente + servidor) para cada feature exclusiva.

## Matriz de planos

| Plano | Preço/mês | Imóveis | Templates | Logo no guia | URL rotativa | Integrações Stays/Hostaway |
|---|---|---|---|---|---|---|
| Free | R$ 0,00 | 1 | 3 (free) | — | — | — |
| Starter | R$ 29,90 | 5 | 3 (free) | — | — | — |
| Pro | R$ 49,90 | 20 | 15 (todos) | sim | sim | — |
| Business | R$ 99,90 | 20 | 15 (todos) | sim | sim | sim |

Anual: aplicar mesmo desconto atual (~17%) sobre o novo mensal.

## Mudanças no banco (migration + UPDATE)

1. **UPDATE `subscription_plans`**: ajustar `price_cents`, `price_yearly_cents`, `property_limit` e `description` dos 4 códigos existentes (free/starter/pro/business). Não mudar `code` nem `position`.
2. **Função SECURITY DEFINER `tenant_has_feature(_tenant_id uuid, _feature text)`** retornando boolean. Mapeia internamente:
   - `pro_templates` → plan_code in ('pro','business')
   - `custom_logo` → plan_code in ('pro','business')
   - `slug_rotation` → plan_code in ('pro','business')
   - `pms_integrations` → plan_code = 'business'
3. **Hardening em `rotate_property_slug`**: adicionar verificação que falha com `feature_not_available_in_plan` quando o tenant da propriedade não tem `slug_rotation`.

## Mudanças no frontend

### `src/lib/templates.ts`
- Substituir `canUseProTemplates` por `templatesAllowedForPlan(planCode)` retornando o número permitido (3 para free/starter, 15 para pro/business) e helpers `isPlanProOrAbove`, `isPlanBusiness`.

### `src/hooks/useTenant.tsx`
- Novo hook `usePlanFeatures()` que devolve `{ proTemplates, customLogo, slugRotation, pmsIntegrations }` derivado de `tenant.plan_code`. Usado em todas as telas.

### `src/pages/dashboard/Templates.tsx`
- Trocar `isPro` por `features.proTemplates`. Mensagem de upgrade passa a citar “Pro ou Business”.

### `src/pages/dashboard/Settings.tsx`
- Card de logo: se `!features.customLogo`, desabilitar o switch “Exibir logo no guia” e o upload, com badge “Disponível no Pro” + link para `/app/billing`.
- Ao salvar, se o plano não permite, forçar `show_logo=false`.

### `src/pages/dashboard/PropertyDetail.tsx` e `src/pages/dashboard/PageEditor.tsx`
- Botão “Gerar novo link / URL rotativa” só aparece se `features.slugRotation`. Caso contrário, mostrar tooltip “Disponível nos planos Pro e Business” + link para upgrade.

### `src/pages/dashboard/Integrations.tsx`
- Se `!features.pmsIntegrations`: cards de Stays/Hostaway viram preview com overlay “Disponível no plano Business” e CTA de upgrade. Bloquear `openDialog`.
- Seção de Chaves de API permanece liberada para todos.

### `src/pages/dashboard/Billing.tsx`
- Atualizar a lista de bullets de cada card para refletir a matriz acima (gerar a lista a partir de uma constante por plano em vez do array hard-coded atual).

### `src/pages/GuestGuide.tsx` e `src/components/guest/GuestLinkExpired.tsx`
- Ao renderizar a logo, exigir também que `tenant.plan_code` esteja em ('pro','business'). Garante que se o cliente baixar de plano, a logo deixa de aparecer mesmo com `show_logo=true`.

## Mudanças nas edge functions (gate server-side)

### `supabase/functions/integrations-connect/index.ts`
- Após resolver `tenantId`, ler `plan_code` em `tenants` e retornar 403 `feature_not_available_in_plan` se `!= 'business'`. Aplicar a mesma checagem em `integrations-trigger-import`, `integrations-mark-synced`, `integrations-mark-import-done`, `integrations-disconnect` (no caso do disconnect, permitir sempre, para limpeza).

## Stripe / preços
- Os `stripe_price_id_monthly/yearly` continuam apontando para os mesmos produtos. Como você não pediu novos preços no Stripe, mantemos os IDs atuais; assinantes existentes seguem com o preço já contratado e novos checkouts usam o que estiver no Stripe. Se quiser que eu também recrie os preços no Stripe com os novos valores (R$ 29,90 / 49,90 / 99,90), me confirme depois — é uma operação separada.

## Resultado esperado
- Cards de Billing mostram as novas features por plano.
- Free/Starter: só veem 3 templates utilizáveis, sem logo, sem URL rotativa, sem integrações.
- Pro: tudo acima + 15 templates, logo, URL rotativa.
- Business: idem Pro + Stays/Hostaway liberados.
- Tentativas via API direta (sem UI) também são bloqueadas pelas funções edge e pela RPC `rotate_property_slug`.
