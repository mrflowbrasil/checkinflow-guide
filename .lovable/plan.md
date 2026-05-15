## Diagnóstico

O checkout do Stripe usa `lookup_keys` (ex: `pro_monthly`) para resolver o preço — não os valores armazenados no banco. Confirmação:

- **Banco** (`subscription_plans`): Pro mensal = R$ 89,90 ✅
- **Stripe** (lookup_key `pro_monthly`): R$ 49,90 ❌ (preço antigo)

O código em `supabase/functions/create-checkout/index.ts` faz:
```ts
const prices = await stripe.prices.list({ lookup_keys: [priceId] });
```
Então o valor exibido vem 100% do Stripe. Atualizar o banco não altera o Stripe — preços no Stripe são **imutáveis em valor**, é preciso criar novos preços com o mesmo `lookup_key` (o Stripe transfere a chave automaticamente do preço antigo para o novo, e arquiva o antigo).

Suspeito que **todos** os planos pagos estejam desatualizados no Stripe, não só o Pro. Preciso recriar todos.

## Plano

1. **Inspecionar o Stripe** para listar os valores atuais de cada `lookup_key` e confirmar quais estão errados:
   - `starter_monthly`, `starter_yearly`
   - `pro_monthly`, `pro_yearly`
   - `business_monthly`, `business_yearly`
   - `free_monthly` (Single — R$ 8,90)

2. **Recriar os preços desatualizados** via `payments--create_price` com os valores corretos do banco. Mesmo `price_id` (lookup_key) → o Stripe transfere automaticamente a chave para o novo preço e arquiva o antigo. Assinaturas existentes não são afetadas (continuam no preço antigo até o usuário trocar).

3. **Validar** chamando `create-checkout` no preview com cada `priceId` e conferindo que o valor retornado bate com o banco.

4. **Observação importante sobre assinaturas existentes**: o seu teste de upgrade Starter→Pro foi feito via abrir um novo checkout (não via Customer Portal de upgrade). Após o fix, novos checkouts mostrarão o valor correto. Usuários já assinantes do Pro a R$49,90 continuam pagando R$49,90 até cancelarem ou trocarem de plano explicitamente — se quiser migrá-los à força, é um passo adicional (atualizar `subscription.items` no Stripe).

## Detalhes técnicos

Mapeamento que vou aplicar (do banco):

| lookup_key | valor (centavos) |
|---|---|
| free_monthly | 890 |
| starter_monthly | 2990 |
| starter_yearly | 29900 |
| pro_monthly | 8990 |
| pro_yearly | 89900 |
| business_monthly | 19990 |
| business_yearly | 199000 |

Cada `create_price` precisa de `product_id` (o produto Stripe correspondente) — vou descobrir via inspeção no passo 1 ou usar os mesmos IDs do `batch_create_product` original.

Pergunta antes de executar: quer que eu **migre forçadamente** as assinaturas ativas existentes para os novos preços (passo extra), ou deixo só os novos checkouts corretos e os antigos assinantes seguem no preço antigo até trocarem por conta própria?