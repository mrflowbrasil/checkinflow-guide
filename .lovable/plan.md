## Diagnóstico definitivo

A página `/` está renderizando `src/pages/LpAnuncio.tsx`, e os componentes `<Reveal>` existem no código. Porém, no preview atual o DOM estava com `0` elementos `.reveal` detectáveis após o carregamento, e visualmente o hero já aparece totalmente renderizado. A causa mais provável é o hook atual: ele adiciona `.reveal` e `.reveal-in` praticamente no mesmo ciclo de renderização para elementos `immediate`, então o navegador não tem tempo de pintar o estado inicial (`opacity: 0 + translateY`) antes do estado final. Resultado: a animação tecnicamente é aplicada, mas fica imperceptível.

## Plano de correção

1. Ajustar `src/hooks/useReveal.tsx` para separar em dois frames:
   - primeiro aplicar `.reveal`;
   - depois, via `requestAnimationFrame`, aplicar `.reveal-in` quando for `immediate` ou quando o elemento já estiver na viewport.

2. Tornar a entrada mais visível em `src/index.css`:
   - aumentar levemente o deslocamento inicial de `16px` para algo mais perceptível;
   - aumentar a duração de `500ms` para cerca de `700ms`;
   - manter `prefers-reduced-motion` respeitado.

3. Corrigir o aviso de DOM no `Reveal`:
   - impedir que props inválidas como `fetchPriority` vazem para o wrapper `<div>` quando `Reveal` envolve a imagem do hero.

4. Verificar no navegador:
   - em `/`, confirmar que existem elementos `.reveal` e `.reveal-in` no DOM;
   - recarregar a página e observar a entrada do hero;
   - scrollar até seções abaixo e confirmar que cards/seções entram ao alcançar a viewport.

5. Atualizar `public/version.json` para forçar invalidação/cache no preview/publicado.

## Fora do escopo

- Sem alterar layout, copy, cores ou imagens.
- Sem mexer em rotas que não sejam necessárias para o fade-in.
- Sem novas bibliotecas.