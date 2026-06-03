## Objetivo
Adicionar um bloco de bônus exclusivos e ajustar o fechamento da página de planos (`Billing.tsx`) para maximizar senso de urgência e valor da oferta.

## Mudanças

### 1. Bloco de Bônus Exclusivos
Inserir nova seção após a grid de planos e antes do parágrafo de disclaimer, com:
- **Título (H3)**: "Criando seu guia digital hoje, você ganha 2 bônus exclusivos:"
- **Subtítulo**: "Incentivos especiais para profissionalizar sua hospedagem ainda esta semana."
- **Layout**: Grid de 2 colunas (1 coluna em mobile) com os dois cards de bônus.

### 2. Cards de Bônus
Utilizar o componente `Card` existente com destaque sutil via `border-primary/20` e `bg-primary/5` (ou similar via tokens semânticos), mantendo consistência com o design system.

**Card 1 — Script de Mensagens:**
- Título: "🎁 Bônus 1: Script de Mensagens Prontas para WhatsApp"
- Descrição: "Chega de pensar no que escrever. Copie e cole modelos exatos de mensagens de boas-vindas, pré-check-in, regras finas e pedido de avaliação 5 estrelas que geram a melhor experiência para o hóspede. (De R$ 47,00 por R$ 0,00)."
- CTA: botão "Criar Meu Guia Grátis" → redireciona para `/auth`

**Card 2 — Guia de Automação:**
- Título: "🎁 Bônus 2: Guia Prático de Automação para Anfitriões"
- Descrição: "Um material digital passo a passo ensinando como usar o WhatsApp de forma inteligente na sua operação de temporada, economizar horas de suporte manual e fechar mais reservas diretas. (De R$ 97,00 por R$ 0,00)."
- CTA: botão "Criar Meu Guia Grátis" → redireciona para `/auth`

### 3. Frase de Garantia e Segurança
Inserir logo abaixo dos cards, com ícone de cadeado (`Lock` do Lucide) e texto:
> "🔒 Risco Zero para começar: Quer testar a plataforma antes de decidir? Crie sua conta no Plano Single e aproveite 30 dias totalmente grátis com todas as funcionalidades liberadas. Sem pegadinhas, sem contratos e sem precisar de cartão de crédito no cadastro. Se sua operação crescer e você precisar de mais imóveis, mude de plano quando quiser."

### 4. Espaçamento e Hierarquia
- Adicionar `space-y-8` (ou equivalente) entre a grid de planos, o bloco de bônus e a frase de garantia.
- Manter o disclaimer final de pagamentos via Stripe intacto.

## Fora do escopo
- Não alterar a grid de planos, os preços, os CTAs dos cards de plano nem o comportamento do checkout.
- Não modificar outras páginas ou componentes.