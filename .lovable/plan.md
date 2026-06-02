## Problema
A linha de botões com `lg:flex-1` ficou mais larga que o parágrafo acima, esticando a coluna de texto do grid `[1.05fr_1fr]` e empurrando a imagem para uma largura menor.

## Solução
1. Limitar a linha de botões à mesma largura do parágrafo (`max-w-xl`) — assim o conteúdo da coluna esquerda não fica maior do que antes, e a imagem volta ao tamanho original.
2. Manter os 3 botões em linha no desktop (`lg:flex-nowrap`), mas remover `lg:flex-1` para que os botões não estiquem; deixar apenas padding reduzido (`lg:px-5`) para caberem juntos no `max-w-xl`.
3. Mobile permanece empilhado.

## Arquivo
- `src/pages/LpAnuncio.tsx` — ajustar o container dos botões (~linha 142) adicionando `max-w-xl` e removendo `lg:flex-1` dos botões.