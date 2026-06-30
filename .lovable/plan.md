## Ajustes nos detalhes decorativos do template Boho Fun

### 1. Capa: degradê não aplica no guia público (bug)

A query do `GuestGuide.tsx` seleciona apenas alguns campos do `tenants` e **não inclui** `cover_transition`, `button_shape` e `button_border`. Por isso o valor salvo no painel nunca chega no guia público — sempre cai no default `"line"`.

**Correção**: adicionar `button_shape, button_border, cover_transition` ao `select` de `tenants!inner(...)` em `src/pages/GuestGuide.tsx`.

### 2. Home: decorações dentro da área dos 9 botões

Hoje as decorações são `::before/::after` no `.guide-root`:
- `::before` (topo direito) fica atrás da capa → não aparece.
- `::after` (rodapé esquerdo) só aparece com scroll, longe dos botões.

**Correção**: ancorar as decorações em um wrapper novo `.guide-home-decor` que envolve a seção do kicker + grid de 9 botões (em `GuestGuide.tsx` e em `TemplatePreviewDialog.tsx`). Mover os pseudo-elementos do Boho Fun para esse wrapper:
- `::before` no canto superior direito do wrapper (acima do grid, abaixo do kicker, sem cobrir os botões — usa `top: -10px; right: -30px`).
- `::after` no canto inferior esquerdo do wrapper (ao lado/abaixo da última linha de botões).
- Manter `overflow: visible` no wrapper, pequena opacidade e `z-index: 0` com `.guide-home-decor > * { position: relative; z-index: 1; }`.

Assim os ornamentos ficam visíveis na primeira dobra, junto ao grid, sem serem cobertos pela capa.

### 3. Páginas internas: topo coberto e rodapé fora da 1ª dobra

A folha decorativa superior nas páginas internas hoje é renderizada no `.guide-root` e fica encoberta pelo header sticky do `SheetContent` (a "máscara" indicada na imagem 3). A folha inferior só aparece bem no fim do scroll.

**Correção** em `src/components/guest/GuestPagePreview.tsx`:
- Adicionar um container `.guide-inner-decor` envolvendo o conteúdo da página (após o header sticky).
- Mover a decoração superior para esse container, **abaixo** da altura do header sticky (`top: 16px; right: -30px`, escala menor: ~140px) — evita a máscara mostrada na imagem.
- Tornar a decoração inferior um padrão repetido verticalmente: usar `background-repeat: repeat-y` num pseudo-elemento posicionado em `left: -20px; top: 40vh; bottom: 0; width: 120px; background-size: 120px auto` — assim a cada "frame de tela" descendo aparece uma nova cópia da folhagem, garantindo que apareça já na primeira dobra e se repita em páginas longas.
- Mesma lógica espelhada à direita opcionalmente (menor opacidade) para páginas muito longas — manter discreto.

### 4. Aplicar mudanças também no preview do template

`src/components/templates/TemplatePreviewDialog.tsx` precisa receber:
- O wrapper `.guide-home-decor` na `HomePreview`.
- O wrapper `.guide-inner-decor` na `PagePreview`.
- Hardcode `data-cover-style` continua, mas o gradiente agora será visualmente verificável.

### Arquivos alterados

- `src/index.css` — mover regras `::before/::after` do Boho Fun de `.guide-root.guide-template-boho_fun` para `.guide-root.guide-template-boho_fun .guide-home-decor` e `.guide-inner-decor`; adicionar variante repetida (`repeat-y`) para o padrão lateral interno.
- `src/pages/GuestGuide.tsx` — incluir `button_shape, button_border, cover_transition` no `select`; envolver kicker + grid em `<div className="guide-home-decor relative">`.
- `src/components/guest/GuestPagePreview.tsx` — envolver conteúdo em `<div className="guide-inner-decor relative">`.
- `src/components/templates/TemplatePreviewDialog.tsx` — aplicar os mesmos wrappers no preview.

### Resultado esperado

- Folhas/ornamentos do Boho Fun visíveis na primeira tela, ao redor do grid de 9 botões.
- Nas páginas internas, decoração superior não é mais cortada pelo header e folhagem lateral se repete conforme o usuário rola, garantindo presença em qualquer altura de conteúdo.
- Capa com transição em degradê funciona corretamente para tenants que escolheram essa opção.
