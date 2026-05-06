## Correções no Hero da Home (`src/pages/Index.tsx`)

### 1. Badge "Guias digitais para temporada" centralizado acima do banner
- Mover o `<div>` do badge para fora do grid de duas colunas.
- Posicionar como bloco centralizado (`flex justify-center mb-10`) logo acima do `grid lg:grid-cols-2`.
- Remover o `mb-6` atual do badge.

### 2. Texto colado no container — adicionar respiro lateral
- Adicionar padding lateral à seção: trocar `container py-16 lg:py-24` por `container px-6 sm:px-8 lg:px-12 py-16 lg:py-24`.
- Aumentar o `gap` do grid para `gap-12 lg:gap-20` para afastar a coluna de texto da imagem.

### 3. Mockup estourando no hover (corte do zoom)
- **Causa:** `overflow-hidden` no wrapper combinado com `hover:scale-110` corta a imagem nas bordas.
- **Solução:**
  - Remover `overflow-hidden` do wrapper da imagem.
  - Reduzir o zoom para `hover:scale-105` (mais sutil, sem corte).
  - Adicionar `will-change-transform` para suavidade.

### 4. Diminuir tamanho do mockup
- Trocar `max-w-lg` por `max-w-md` para equilibrar visualmente com o texto à esquerda.

### 5. Adicionar exclamação na headline secundária
- Trocar:
  - **De:** `Transforme a estadia do seu hóspede em uma experiência incrível`
  - **Para:** `Transforme a estadia do seu hóspede em uma experiência incrível!`

### 6. Reduzir tamanho e remover exclamação da subleadline
- Trocar a classe `text-base` (16px) por `text-sm` (14px) — redução de ~2pt.
- Trocar:
  - **De:** `Encante desde o primeiro momento com um guia digital completo!`
  - **Para:** `Encante desde o primeiro momento com um guia digital completo`

### Estrutura final (resumo)

```text
<section container px-6 sm:px-8 lg:px-12 py-16 lg:py-24>
  <div flex justify-center mb-10>
    [Badge "Guias digitais para temporada"]
  </div>
  <div grid lg:grid-cols-2 gap-12 lg:gap-20 items-center>
    <div text-left>
      [H1]
      [p text-lg #00FF00 — "Transforme... incrível!"]
      [p text-sm #ffffff — "Encante desde..."]
      [Botão "Começar grátis"]
    </div>
    <div flex justify-center lg:justify-end (sem overflow-hidden)>
      <img max-w-md hover:scale-105 will-change-transform />
    </div>
  </div>
</section>
```

### Arquivo editado
- `src/pages/Index.tsx`
