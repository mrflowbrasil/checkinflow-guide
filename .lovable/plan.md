## Problema

No mobile, segurar e arrastar a alça (ícone ⋮⋮) dos blocos não funciona porque:

1. O `PointerSensor` do dnd-kit, em alguns navegadores mobile, conflita com o gesto de scroll da página — o toque acaba rolando a tela em vez de iniciar o arrasto.
2. Falta um `TouchSensor` dedicado com atraso de ativação (long-press), que é o padrão recomendado para drag-and-drop em telas touch.
3. As alças de arrastar não definem `touch-action: none`, então o navegador interpreta o toque como pan/scroll antes do dnd-kit assumir.

## Correção

Aplicar a mesma correção nos dois pontos onde há DnD de blocos/páginas:

- `src/pages/dashboard/PageEditor.tsx` (arrastar blocos dentro de uma página)
- `src/pages/dashboard/PropertyDetail.tsx` (reordenar páginas)
- `src/components/blocks/BlockEditor.tsx` (alça do bloco)

### Mudanças

1. Adicionar `TouchSensor` aos `useSensors`, com `activationConstraint: { delay: 200, tolerance: 8 }` (long-press curto, tolera pequeno movimento do dedo).
2. Manter o `PointerSensor` existente para mouse/caneta.
3. Aplicar `touch-action: none` (classe `touch-none` do Tailwind) no botão da alça `GripVertical` em `BlockEditor.tsx` e nas alças equivalentes em `PropertyDetail.tsx`, para impedir que o navegador roube o gesto.

Sem mudanças de UI/visual nem de lógica de negócio — só sensores e uma classe CSS nas alças.

## Resultado esperado

No celular: tocar e segurar (~200ms) a alça de um bloco inicia o arrasto e permite reordenar normalmente; toques fora da alça continuam rolando a página como antes.
