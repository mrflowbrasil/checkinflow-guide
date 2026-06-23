Problema identificado
O checkout da seção de lançamento em src/components/lp/LaunchOffer.tsx usa priceId="launch_yearly" (R$ 89,90/ano). O edge function create-checkout procura esse preço no Stripe por lookup_key, mas ele ainda não existe no catálogo — no dashboard só aparecem os preços do plano Pro regular (R$ 89,90/mês, R$ 899,00/ano etc.).

Solução
Criar o produto e o preço do plano de lançamento via Lovable managed payments, usando o ID que o código já espera. Isso evita alterar o frontend e mantém o checkout embed funcionando.

Passos
1. Verificar status do Stripe payments no projeto (confirmar que está habilitado e em qual ambiente).
2. Criar o produto "Plano Lançamento Welcome Hub" com os dados abaixo.
3. Validar no Stripe (sandbox) que o preço aparece com lookup_key="launch_yearly".
4. Testar o checkout end-to-end no preview da landing, garantindo que o modal embed abre sem erro "Price not found".
5. Ajustar o edge function create-checkout se houver alguma incompatibilidade de metadata/subscription_data para o novo produto.

Dados do produto/preço a criar
- product_id: launch_plan
- product_name: Plano Lançamento Welcome Hub
- product_description: Acesso completo ao Welcome Hub por 1 ano na condição especial de lançamento.
- price_id: launch_yearly
- amount: 8990 (R$ 89,90 em centavos)
- currency: brl
- recurring_interval: year
- quantity_min / quantity_max: 1 (plano flat, uma compra por vez)
- tax_code: txcd_10103001 (SaaS / electronic services)

Observação
Como o Brasil não está entre os países elegíveis para full compliance handling do Stripe, o checkout continuará usando automatic_tax/sem managed_payments. O edge function atual já não define managed_payments, então nenhuma mudança de código é necessária nesse ponto.

Validação
- screenshot do checkout embed abrindo na landing /lp
- confirmação de que o preço foi criado no ambiente sandbox do Stripe
- teste com cartão 4242 4242 4242 4242 opcional, se o usuário quiser validar o fluxo completo