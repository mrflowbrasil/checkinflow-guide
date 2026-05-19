## Problema

No screenshot, o template **Surf** aparece com fundo escuro/cinza, mas no CSS ele está definido como branco (`--guide-bg: 0 0% 100%`). A causa é o **"Forçar modo escuro" do Chrome no Android** (e comportamento similar em alguns WebViews), que reescreve as cores da página automaticamente quando o usuário tem o tema escuro do sistema ativo.

A solução padrão é declarar explicitamente que a página opera em light mode — o Chrome respeita isso e desativa o auto-dark.

## Mudanças

### 1. `src/index.css` — fixar color-scheme no guide-root

Na regra `.guide-root` (linha 256), adicionar:

```css
.guide-root {
  color-scheme: light;
  ...
}
```

E para o template `dark` (e `arcade`, `coastal_boho`, `jungle` que têm fundo escuro intencional), sobrescrever para `color-scheme: dark` — assim o navegador continua respeitando o design intencional desses.

Resultado: templates claros (Surf, Clean, Luxury, Aegean, Monochrome, etc.) ficam sempre claros, independente do tema do sistema/navegador do hóspede. Templates escuros continuam escuros como projetados.

### 2. `src/pages/GuestGuide.tsx` — meta tag dinâmica

No `useEffect` que já gerencia meta tags por propriedade, adicionar/atualizar um `<meta name="color-scheme" content="light">` (ou `dark` conforme o template) ao montar a página `/g/:slug`, e restaurar ao desmontar. Isso reforça o sinal antes mesmo do CSS carregar e cobre o caso do Chrome para Android, que lê essa meta para decidir se aplica o auto-dark.

Mapeamento template → color-scheme:
- `dark`, `arcade`, `coastal_boho`, `jungle` → `dark`
- todos os demais → `light`

## Notas técnicas

- Nenhuma mudança em lógica de negócio, dados ou backend. Apenas CSS + uma meta tag.
- Não afeta o dashboard (que continua respeitando o tema do sistema), só a rota pública `/g/:slug`.
- Em iOS Safari não há "forçar modo escuro" automático, então o comportamento lá já está correto e não muda.
