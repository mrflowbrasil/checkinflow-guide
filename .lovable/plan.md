## Objetivo

Adicionar uma nova seção **Planos** na home (`src/pages/Index.tsx`) replicando a funcionalidade de `/app/billing` (toggle Mensal/Anual + cálculo de preço por imóvel + 5 planos) **mas estilizada na identidade visual clara da `/lp`** (fundo creme `#FAFAF7`, ciano `hsl(186 100% 32%)`, cards brancos arredondados, sombras suaves) — criando uma "ilha" clara dentro da home dark.

> Observação: a `/lp` hoje **não tem** uma seção de planos. Estou interpretando "identidade visual da mesma seção da `/lp`" como **a estética geral da `/lp`** (paleta clara, ciano, cards `rounded-2xl`, badges de borda ciano, CTAs `ctaPrimary`/`ctaSecondary`). Se você quis dizer outra coisa, me avise antes de eu construir.

## Mudanças

### 1. Novo componente `PlanosSection` em `src/pages/Index.tsx`

Inserido entre o bloco **Features** e o `<footer>`, com `id="planos"`.

Estrutura:

```text
[Container claro — bg #FAFAF7, borda arredondada top/bottom, padding generoso]
  [Badge "Planos" — borda ciano, fundo branco]
  H2 (slate-900): Mais paz para você. Mais clareza para o hóspede.
                  Por menos que um cafezinho por imóvel.
  Sub (slate-600): Comece com 30 dias grátis, sem cartão de crédito.
                   Teste sem compromisso e continue apenas se fizer
                   sentido para sua operação.

  [Toggle Mensal | Anual (−17%)]

  [Grid 5 cards: Single · Starter · Pro · Business · Enterprise]

  Nota: pagamentos via Stripe, cancele quando quiser.
```

Por card:
- Nome + descrição curta
- Preço mensal/anual conforme toggle
- Equivalente mensal (no anual)
- Economia % no anual
- **Preço por imóvel** (Starter/Pro/Business)
- Lista de features (mesmo conteúdo de `PLAN_FEATURES` em `Billing.tsx`)
- CTA: "Começar grátis" (Single) / "Assinar" (demais) → `/auth`
- Enterprise: card especial com "Sob consulta" + botão WhatsApp (`5521996507509`)
- Pro: badge "Mais popular" com destaque ciano
- Single: badge "30 dias grátis"

### 2. Fonte dos dados

**Hardcoded** em uma constante `LP_PLANS` no topo de `Index.tsx`, espelhando os valores atuais da tabela `subscription_plans`:

```text
free       Single     1      R$  8,90/mês    R$  89,00/ano
starter    Starter    5      R$ 29,90/mês    R$ 299,00/ano
pro        Pro       20      R$ 89,90/mês    R$ 899,00/ano
business   Business  50      R$199,90/mês    R$1.990,00/ano
enterprise Enterprise —      Sob consulta
```

Motivo: a home é pública/anônima e a tabela `subscription_plans` não tem GRANT para `anon`. Hardcoded evita expor a tabela publicamente, elimina loading state e descacopla a LP do backend. Os valores mudam raramente; atualização futura = editar `LP_PLANS`.

### 3. Identidade visual

- Faixa da seção: `bg-[#FAFAF7] text-slate-900` para quebrar o tema dark da home (transição suave acima/abaixo com gradiente).
- Cards: `rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)]`.
- Card Pro (destaque): borda + glow ciano `shadow-[0_25px_70px_-25px_hsl(186_100%_32%/0.45)]`.
- Card Enterprise: gradiente sutil creme→branco com toque ciano + ícone `Building2`.
- Toggle: `Tabs` do shadcn, com `TabsTrigger` ativo em ciano.
- CTA primário: ciano sólido (mesmo padrão `ctaPrimary` da `/lp`). CTA secundário em branco com borda ciano.
- Badges: "Mais popular" (ciano), "30 dias grátis" (cinza neutro com ícone `Gift`).

### 4. Detalhes técnicos

Arquivo único alterado: `src/pages/Index.tsx`
- Imports adicionais: `Tabs/TabsList/TabsTrigger`, `Badge`, `Card`, `useState`, ícones `Check`, `Crown`, `Building2`, `Gift`, `MessageCircle`.
- Helper local `formatBRL(cents)` + cálculo `perPropertyCents = base / property_limit`.
- Constante `LP_PLANS` com 5 planos.
- Componente `PlanosSection()` no fim do arquivo.
- Inserir `<PlanosSection />` em `<Index>` antes do `<footer>`.

Nenhuma alteração em rotas, backend, RLS, `LpAnuncio.tsx`, ou `Billing.tsx`.

## Fora de escopo

- Não adiciono link "Planos" no header da home (você não pediu desta vez; posso adicionar depois se quiser).
- Não criamos checkout direto pela home — o CTA leva para `/auth`.
- Não sincronizamos preços com o banco em tempo real.