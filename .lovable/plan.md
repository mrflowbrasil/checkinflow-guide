
## Objetivo

1. Adicionar um botão **"Ver"** em todos os cards de template para abrir uma prévia realista (modelo de exemplo) sem precisar aplicar o template.
2. Mudanças visuais mais marcantes por template (fundo, botões, ícones, fonte) — incluindo aplicar a **cor secundária como fundo** quando fizer sentido.
3. Liberar o botão "Ver" funcional **apenas** para os templates que você aprovar via imagem. Os demais ficam com o botão desabilitado ("Em breve").
4. Implementar agora o design final do **Clean** (com base na imagem enviada).

## O que muda na página `/app/templates`

- Cada card ganha um botão pequeno **"Ver"** no canto inferior direito do mini-preview.
- Clique no "Ver" abre um **dialog full-screen** (mockup de celular) renderizando uma propriedade fictícia ("Suíte Premium - Vila Serena") com o template aplicado — usando o mesmo layout de `GuestGuide` (hero, logo, "HUB DE BOAS VINDAS", grid de 9 ícones, botão "Reservar").
- Templates ainda não desenhados: botão "Ver" aparece como `disabled` com tooltip "Prévia em breve".
- O fluxo de "aplicar template" continua igual (clicar no card abre o `AlertDialog` de confirmação). O "Ver" não aplica nada.

## Design final — Template **Clean** (baseado na imagem)

Tokens (`src/index.css` → `.guide-template-clean`):
- `--guide-bg`: branco neutro (`0 0% 100%`)
- `--guide-fg`: navy escuro `#0F1E3D`
- `--guide-card`: cinza muito claro `210 20% 97%` (cards levemente destacados do fundo)
- `--guide-muted`: cinza médio
- `--guide-heading-font`: `"Inter"` (mantido)
- `--guide-radius`: `0.875rem` (cards um pouco mais quadrados que hoje)

Ajustes no `GuestGuide.tsx` para todos os templates (não só Clean):
- A área abaixo do hero passa a usar `hsl(var(--guide-bg))` em vez de herdar branco do `body`. Isso já vem do `.guide-root`, mas vou garantir que o container `max-w-md` herde corretamente (sem fundo branco fixo) — assim cada template controla esse fundo via `--guide-bg`.
- Para templates com `--guide-bg` claro (Clean, Studio, Aegean, Surf, Monochrome), fundo branco/quase-branco (como na imagem).
- Para templates onde faz sentido usar a **secundária como fundo da seção dos cards** (ex.: Luxury creme, Boho Fun bege, Serene Coast areia), o `--guide-bg` já será definido com a cor secundária do template — atualizo cada `.guide-template-*` para refletir isso.

Especificamente para Clean (que é o aprovado agora):
- Fundo da seção: branco puro.
- Cards: `bg #F4F6F8`, sombra suave, ícones `#0F1E3D` em traço fino (Lucide já é assim).
- Título de seção "HUB DE BOAS VINDAS": `#0F1E3D`, peso 600, `letter-spacing: 0.25em`.
- Botão "Reservar": fundo `#0F1E3D`, texto branco, uppercase, tracking largo (já está assim).

Para os demais templates: nesta task **só ajusto os tokens de fundo** para que cada um use a sua cor secundária/identidade como fundo da página (resolvendo o "tudo branco abaixo dos botões"). O design fino de cada um (cards, ícones, fontes radicais) será feito conforme você for enviando as imagens — nesse momento a gente também libera o "Ver" para aquele template.

## Implementação técnica

Arquivos a alterar:

1. **`src/lib/templates.ts`**
   - Adicionar campo `previewReady: boolean` em cada `TemplateDef`. Inicialmente `true` apenas para `clean`; demais `false`.

2. **`src/components/templates/TemplatePreviewDialog.tsx`** (novo)
   - Dialog responsivo mostrando um "mockup" no tamanho de celular (max-w ~ 380px, altura ~ 80vh, scroll interno).
   - Renderiza uma cópia simplificada da home do guia (hero com imagem stock, logo redonda fake, título, endereço, "HUB DE BOAS VINDAS", grid 3x3 com `getPageIcon`, botão "Reservar Novamente"), tudo dentro de `<div className={'guide-root guide-template-${tpl.key}'}>` para que os tokens CSS atuem.
   - Usa cores `tpl.primary` / `tpl.secondary` para botão e ícones, espelhando `GuestGuide.tsx`.
   - Inclui também uma "página interna" navegável (clicar num ícone abre `GuestPagePreview` com blocks fictícios: texto, lista, dica, botão) para mostrar o estilo dos componentes internos.

3. **`src/pages/dashboard/Templates.tsx`**
   - No `TemplateCard`, adicionar botão "Ver" (variant `secondary`, size `sm`, ícone `Eye`) sobreposto no canto do `MiniPreview`.
   - `onClick` do botão chama `e.stopPropagation()` e abre o `TemplatePreviewDialog`. Se `tpl.previewReady === false`, botão renderiza `disabled` com `title="Prévia em breve"`.
   - Estado local: `previewing: TemplateDef | null`.

4. **`src/index.css`**
   - Atualizar `.guide-template-clean` com os novos tokens.
   - Para os outros templates: ajustar `--guide-bg` para usar a cor secundária / cor de identidade quando o atual estiver "branco genérico" demais. Sem mexer em fontes/raios desta vez (preserva o que já está bom).

5. **`src/pages/GuestGuide.tsx`**
   - Garantir que o container externo dos cards não force `bg-background`/branco; deixar o `--guide-bg` valer. (Conferir e remover qualquer override.)

## Fluxo a partir daqui

- Você manda a imagem de cada template pronto.
- Para cada um eu: (a) atualizo os tokens CSS daquele `.guide-template-*`, (b) marco `previewReady: true` em `templates.ts`, (c) ajusto detalhes do mock se necessário.

## Pontos de decisão

- O preview usa uma **propriedade fictícia padrão** (não a do usuário). Mais rápido e consistente entre templates. Se preferir que use a 1ª propriedade real do tenant (com capa, logo e páginas dele), me avise — dá mais trabalho mas fica mais "real".
- O botão "Ver" aparecerá **em todos os cards**, mas desabilitado para templates ainda não desenhados, conforme você pediu.
