## Problema

As imagens do carrossel são screenshots de celular com proporções um pouco diferentes entre si. O container usa `aspect-[9/16]` + `object-cover`, que **recorta** a imagem para preencher o quadro — por isso uma corta a logo no topo e outra esconde a barra de navegação na base.

## Solução

Trocar o modo de exibição para mostrar a imagem **inteira**, sem cortes, mantendo o visual alinhado entre os slides.

### Alterações em `src/components/ui/image-auto-slider.tsx`

1. **`object-cover` → `object-contain`** na tag `<img>`, garantindo que nenhuma parte do screenshot seja cortada (logo no topo e menu inferior ficam visíveis em todas as imagens).
2. **Fundo do card**: trocar `bg-white/5` por um tom escuro consistente (`bg-[#020617]`) para combinar com o hero e disfarçar eventuais faixas laterais quando a imagem for um pouco mais estreita que `9/16`.
3. **Remover a borda branca** (`border border-white/10`) para um visual mais limpo já que a imagem agora pode não preencher 100% do card.
4. **Manter** `aspect-[9/16]`, alturas responsivas (`h-56 / sm:h-72 / lg:h-96`), o `mask` lateral, `gap-4` e a duração de 50s.

## Observação

Com `object-contain`, se alguma imagem tiver proporção diferente de 9:16 vai aparecer uma fina faixa nas laterais (ou topo/base) na cor de fundo do card — por isso o ajuste do `bg`. Isso é o trade-off necessário para garantir que **nenhum conteúdo do screenshot seja cortado**.

## Arquivos afetados

- **Editar**: `src/components/ui/image-auto-slider.tsx`
