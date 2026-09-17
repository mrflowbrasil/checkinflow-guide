# Gerenciamento de assinatura nas Configurações

Nova seção "Assinatura" na página `/app/settings`, já que a página de planos saiu do menu.

## O que o usuário vai ver

Um card "Assinatura" com:

- **Plano atual** (nome do plano) e uso de imóveis (ex.: 3/20).
- **Situação**: Ativa, Em teste, Pagamento pendente, ou "Cancelada — acesso até DD/MM/AAAA".
- **Ciclo e próxima cobrança**: mensal ou anual + data da renovação (ou data em que o acesso termina, se já cancelada).
- **Botão "Ver planos / Fazer upgrade"** → leva para a página de planos (`/app/billing`).
- **Botão "Cancelar assinatura"** → abre confirmação explicando que o acesso continua até o último dia do ciclo já pago; após confirmar, mostra a data-limite.
- **Botão "Reativar assinatura"** no lugar do cancelar, quando a assinatura estiver marcada para encerrar no fim do ciclo.
- **Botão "Gerenciar pagamento"** (portal seguro) para trocar cartão e ver faturas — só aparece quando existe assinatura paga.

Quem está em teste grátis, sem assinatura paga, vê o plano atual, a data de término do teste e só o botão de assinar/ver planos.

## Garantia de acesso até o fim do ciclo

O cancelamento é sempre agendado para o fim do período contratado — nada é cortado na hora. O plano e os recursos continuam ativos até a data final, e só então a conta volta ao plano gratuito.

## Detalhes técnicos

- `src/pages/dashboard/Settings.tsx`: novo card "Assinatura" montado a partir de `useTenant`, `usePlanUsage` e uma consulta à tabela `subscriptions` (filtrando `tenant_id` + `environment` via `getStripeEnvironment()`, ordenada por `created_at desc`, `maybeSingle`). Componente novo em `src/components/billing/SubscriptionCard.tsx` para manter a página enxuta.
- Nova Edge Function `cancel-subscription`: valida o JWT, resolve o `tenant_id` pelo perfil, busca a assinatura ativa do tenant no ambiente correto e chama `stripe.subscriptions.update(id, { cancel_at_period_end: true })` usando `createStripeClient` do `_shared/stripe.ts`. Aceita também `{ reactivate: true }` para voltar `cancel_at_period_end` para `false`. Retorna a data de término.
- O webhook `payments-webhook` já trata `customer.subscription.updated` (grava `cancel_at_period_end` e `current_period_end`) e `customer.subscription.deleted` (rebaixa para `free` só quando a Stripe encerra de fato, no fim do ciclo) — nenhuma mudança necessária lá.
- Após cancelar/reativar, invalidar as queries `tenant` e `tenant_subscription` para o card refletir o novo estado.
- Nenhuma mudança de banco de dados é necessária; `subscriptions.cancel_at_period_end` e `current_period_end` já existem.
