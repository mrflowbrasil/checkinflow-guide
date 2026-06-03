## Diagnóstico
O espaço vazio que aparece embaixo dos botões "Abrir demo completa / Criar meu guia grátis" (na seção **Demo real**, `RealDemoLight`) é causado por dois fatores combinados:

1. O grid usa `items-center`, então a coluna da esquerda (texto + botões, muito mais curta) é centralizada verticalmente em relação à coluna do mockup do celular (muito alta, ~700px). Isso deixa um vão grande **abaixo dos botões**.
2. A seção tem `py-16 lg:py-24` e a próxima seção (`BulletsPro`) também usa `py-16 lg:py-24`, somando ainda mais espaço entre as duas.

## Mudanças (apenas `src/pages/LpAnuncio.tsx`, função `RealDemoLight`)

1. **Linha 446** — trocar `items-center` por `items-start` no grid, alinhando a coluna de texto no topo. Isso elimina o vão acima dos botões e o espaço residual fica concentrado abaixo do mockup (que agora também leva o banner de CTA dinâmico, ocupando o espaço).
2. **Linha 441** — reduzir o padding vertical da seção de `py-16 lg:py-24` para `py-12 lg:py-16`, encurtando o topo e a base da seção.
3. Manter todo o restante (cores, conteúdo, banner de CTA dinâmico, mockup) intacto.

## Fora do escopo
- Não mexer em outras seções, no hero, no CTA do iframe nem nos paddings das demais áreas.
- Não alterar tipografia, cores, espaçamentos internos dos cards ou comportamento do banner.
