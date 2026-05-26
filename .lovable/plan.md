## O que muda na seção de Planos (`src/pages/WelcomeHubLanding.tsx`)

### 1. Card "Pro" legível, no mesmo padrão dos outros
Hoje o card Pro usa um fundo em gradiente claro (cyan/verde) com textos também claros (`#F8FAFC`, `#CBD5E1`), o que deixa preço e features quase invisíveis.

Vou usar o **mesmo fundo escuro** dos outros cards (`bg-[#111827]`) e marcar o destaque só com:
- Borda cyan + leve glow externo (`border-[#00FFFF]/60` + `shadow-[0_0_40px_-10px_rgba(0,255,255,0.5)]`)
- Tarja "Mais popular" no topo, no estilo da página `app/billing`: pílula com fundo cyan, ícone ✨ e texto escuro, posicionada `-top-3 right-4`.

O texto do badge passa de "Mais escolhido" para **"Mais popular"** para casar com `Billing.tsx`.

### 2. CTAs apontando para o checkout
Hoje todos os botões vão para `/auth`. Vou ajustar para o mesmo destino da página de billing:

- **Single, Starter, Pro, Business** → `/app/billing` (a rota é protegida por `RequireAuth`, então usuário deslogado é levado ao login e depois cai direto na tela de planos onde abre o Stripe Embedded Checkout).
- **Enterprise** → link de WhatsApp comercial `https://wa.me/5521996507509?text=...` (mesmo número/mensagem usados em `Billing.tsx`), abrindo em nova aba.

Observação: não é possível pular o login e abrir o checkout do Stripe direto da landing pública, porque a criação da sessão exige um `tenant_id` autenticado. O fluxo padrão é landing → auth → `/app/billing` → checkout, exatamente como já acontece hoje para usuários logados.

### Arquivos afetados
- `src/pages/WelcomeHubLanding.tsx` (somente o array `plans` e o JSX do card no `PricingSection`)

Nenhuma mudança em backend, rotas ou no fluxo do Stripe.