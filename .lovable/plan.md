Plano de correção para o degradê da capa

O problema atual é de conceito e estrutura: o CSS aplica um overlay escuro dentro da imagem da capa, mas a linha dura que aparece no Android está na transição entre a imagem e a seção bege do guia. Como o degradê está preso dentro do container da imagem, ele não consegue “fundir” a capa com o fundo do template.

Implementação proposta:

1. Separar dois efeitos diferentes
- Manter um overlay escuro leve sobre a imagem apenas para legibilidade do título.
- Criar um segundo degradê específico para transição capa → fundo do template.
- Esse degradê deve usar a cor real do template (`--guide-bg`) e não apenas preto/transparente.

2. Ajustar a estrutura do hero no guia público
- Adicionar classes semânticas no hero, por exemplo:
  - `guide-hero`
  - `guide-cover-media`
  - `guide-cover-readability`
  - `guide-cover-transition`
- A transição em degradê ficará posicionada no rodapé do hero e poderá avançar visualmente sobre a área seguinte, sem ficar cortada pelo `overflow-hidden` da imagem.

3. Corrigir o CSS do modo “Linha” vs “Degradê”
- `line`: mantém a separação atual, com corte mais direto entre capa e conteúdo.
- `gradient`: aplica uma faixa de transição mais alta, com múltiplos stops, indo da imagem para `hsl(var(--guide-bg))`.
- A transição será aplicada por seletor no root:
  - `.guide-root[data-cover-style="gradient"] .guide-cover-transition`
  - `.guide-root[data-cover-style="line"] .guide-cover-transition`

4. Garantir compatibilidade Android/iPhone
- Evitar `mask-image`, filtros e variáveis CSS aninhadas que já falharam em Android/Chrome.
- Usar apenas `linear-gradient()` simples com `hsl(var(--guide-bg) / alpha)`, que é suportado nos navegadores modernos.
- Adicionar um fallback com `background-color: hsl(var(--guide-bg))` no final da faixa para eliminar linha dura.

5. Aplicar também no preview dos templates
- Atualizar `TemplatePreviewDialog.tsx` para usar a mesma estrutura do guia real.
- Isso evita o painel mostrar uma prévia diferente do link público.

6. Verificar bordas dos botões junto com a correção
- Reforçar os seletores de forma/borda depois dos overrides dos templates.
- Validar que `data-btn-border="outline"` gera `border-width: 1.5px` nos cards e CTA.

7. Validação antes de finalizar
- Testar o link público do Vila Serena em viewport mobile equivalente ao print.
- Confirmar no DOM/computed style:
  - root com `data-cover-style="gradient"`
  - `.guide-cover-transition` com `background-image: linear-gradient(...)`
  - cor final do degradê igual ao fundo do template Boho Fun
  - cards com borda quando configurado
- Comparar visualmente: a linha horizontal entre foto e fundo bege deve desaparecer ou ficar suavizada.

Arquivos previstos:
- `src/pages/GuestGuide.tsx`
- `src/components/templates/TemplatePreviewDialog.tsx`
- `src/index.css`

Resultado esperado:
- No Android e iPhone, o modo “Degradê” deixa de parecer uma linha reta e passa a fundir a capa com o fundo do template.
- O comportamento fica consistente entre guia público e prévia de template.
- As bordas dos botões continuam respeitando a personalização salva.