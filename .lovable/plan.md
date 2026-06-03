## Objetivo
Replicar o bloco de bônus exclusivos + frase de garantia na landing page pública (`src/pages/LpAnuncio.tsx`), logo abaixo da grid de planos, dentro de `PlanosSection`. Hoje esse bloco só existe em `/app/billing` (área logada), por isso o visitante não o vê.

## Onde inserir
Em `src/pages/LpAnuncio.tsx`, dentro de `PlanosSection`, entre o fechamento da grid de planos (linha 1074) e o disclaimer da Stripe (linha 1076).

## Conteúdo do bloco

1. **Título (H3)**: "Criando seu guia digital hoje, você ganha 2 bônus exclusivos:"
2. **Subtítulo**: "Incentivos especiais para profissionalizar sua hospedagem ainda esta semana."
3. **Grid 2 colunas** (1 col mobile) com dois cards de bônus:
   - **Bônus 1 — Script de Mensagens Prontas para WhatsApp** (ícone `MessageSquare`): texto sobre modelos de mensagens prontas (boas-vindas, pré-check-in, regras, avaliação 5 estrelas) — preço riscado "De R$ 47,00" + badge "por R$ 0,00".
   - **Bônus 2 — Guia Prático de Automação para Anfitriões** (ícone `Zap`): texto sobre uso inteligente do WhatsApp na operação de temporada — preço riscado "De R$ 97,00" + badge "por R$ 0,00".
   - Cada card com CTA "Criar Meu Guia Grátis" → `Link to="/auth"`.
4. **Card de garantia** com ícone `Lock`:
   > "🔒 Risco Zero para começar: Crie sua conta no Plano Single e aproveite 30 dias totalmente grátis com todas as funcionalidades liberadas. Sem pegadinhas, sem contratos e sem precisar de cartão de crédito no cadastro. Se sua operação crescer e você precisar de mais imóveis, mude de plano quando quiser."

## Estilo (consistente com a LP)

- Cards de bônus: `rounded-2xl bg-white border-2 border-[hsl(186_100%_32%)]/25 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)]` com um leve tom de destaque (`bg-gradient-to-br from-white to-[hsl(186_100%_32%)]/5`) — segue a paleta turquesa já usada nos cards de plano.
- Card de garantia: tom slate suave, `bg-slate-50 border-slate-200`.
- Botões: mesma classe dos CTAs primários da LP (`bg-[hsl(186_100%_32%)] hover:bg-[hsl(186_100%_27%)] text-white h-12 rounded-xl font-semibold`).
- Espaçamento: `mt-12 space-y-8` para separar bem da grid de planos sem perder relação visual.

## Fora do escopo

- Não alterar a grid de planos, preços, intervalo mensal/anual, nem o disclaimer da Stripe.
- Não remover/duplicar nada em `/app/billing` (permanece como está).
- Sem mudanças de backend.
