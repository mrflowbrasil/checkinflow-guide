## Objetivo

Recolorir apenas os 4 ícones sobrepostos (wifi, casa+chave, lâmpada, pin de localização) da imagem hero de `/` para `#00FFFF` (ciano puro), preservando integralmente a foto da hóspede e do ambiente.

## Passos

1. Usar `imagegen--edit_image` sobre `src/assets/lp/hero-guest-phone.webp` (a imagem atual da hero) com prompt instruindo:
   - Recolorir somente os 4 ícones vetoriais sobrepostos (wifi top-left, casa-com-chave top-right, lâmpada center-right, pin bottom-left) para ciano sólido `#00FFFF`.
   - Manter o estilo line/outline original, a posição, o tamanho e o leve gradiente — apenas trocar o teal/turquesa atual por #00FFFF.
   - Preservar 100% a fotografia (rosto, sofá, cozinha, almofada, planta) sem retoques.
2. Salvar o resultado em `src/assets/lp/hero-guest-phone.webp` (sobrescrevendo), aspect ratio `16:9` para manter o enquadramento atual (1672×941 ≈ 16:9).
3. Validar visualmente abrindo a imagem gerada antes de finalizar; se algum ícone ficar fora do tom ou a foto for alterada, reiterar com prompt mais específico ou versionar como `hero-guest-phone-v2.webp` e atualizar o import.

## Escopo / não-escopo

- Sem mudanças em `LpAnuncio.tsx` (mesmo path de import, mesmas dimensões 1672×941).
- Sem alteração de CSS/filtros globais — a recoloração fica embutida no asset.
- Não mexer no mockup secundário (`hero-mockup-lifestyle.webp`).

## Riscos

- Modelos de edição podem alterar levemente o rosto/iluminação. Mitigação: prompt explícito de preservação + comparação visual; se necessário, gerar 2 variações e escolher a mais fiel.
- `#00FFFF` puro pode parecer berrante sobre o fundo claro; se o resultado destoar da identidade visual, podemos ajustar para `#00E5FF` ou aplicar leve gradiente — confirmar após ver o resultado.