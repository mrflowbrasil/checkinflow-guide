## Problema

No `LaunchOffer.handleCta`, quando o usuário não está logado, abrimos o `QuickSignupDialog` ("Comece seu guia grátis") em vez de levar direto para o checkout do Stripe do plano de lançamento. Isso é inconsistente com a proposta dos CTAs "Garantir minha vaga / Garantir 1 ano por R$ 89,90", que devem ir direto para pagamento.

## Solução

Permitir que o checkout embedded do Stripe seja aberto para qualquer visitante (logado ou não), coletando o e-mail no próprio Stripe Checkout. O `userId` vira opcional na criação da sessão.

### Mudanças

1. **`src/components/lp/LaunchOffer.tsx`**
   - Em `handleCta`: remover o bloco que chama `openQuickSignup` quando não há sessão. Sempre abrir o `checkoutOpen` modal com o `StripeEmbeddedCheckout`.
   - Remover import não utilizado de `openQuickSignup`.
   - Se houver sessão, ainda passamos `userId`/`customerEmail` para vincular a compra ao usuário existente. Sem sessão, o Stripe coleta o e-mail e a vinculação é feita posteriormente pelo webhook (via e-mail/`metadata`).

2. **`src/components/billing/StripeEmbeddedCheckout.tsx`** (verificar)
   - Confirmar que `userId` e `customerEmail` já são opcionais. Se não forem, ajustar tipos para aceitar undefined.

3. **`supabase/functions/create-checkout/index.ts`** (verificar)
   - Confirmar que aceita requisição sem `userId`. Se exigir auth/userId, ajustar para permitir checkout anônimo do plano `launch_yearly` (Stripe coleta e-mail; pós-pagamento, webhook cria/associa a conta usando o e-mail informado).

4. **Pós-pagamento (`/lancamento/sucesso`)**: já existe `LaunchSuccess.tsx` — garantir que, se o comprador não tinha conta, o fluxo de criação/vinculação aconteça lá (ou via webhook) usando o e-mail do checkout. (A revisar antes de implementar — pode já estar tratado.)

### Resultado

Clicar em "Garantir minha vaga" / "Garantir 1 ano por R$ 89,90" abre imediatamente o checkout do Stripe (modal embedded), sem passar pelo dialog de cadastro grátis.
