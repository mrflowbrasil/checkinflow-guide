As logos parecem pequenas porque os arquivos são quadrados 500×500 com muito espaço em branco ao redor, e estão sendo renderizadas com altura `h-8 / h-9 / h-10` (32–40px). Como o conteúdo visual ocupa só ~50% do quadrado, a logo "real" aparece com ~16–20px.

## Alteração

Em `src/pages/LpAnuncio.tsx` (linha 1229), aumentar a altura do `<img>` no carrossel de parceiros:

- De: `h-8 sm:h-9 lg:h-10`
- Para: `h-16 sm:h-20 lg:h-24` (64 / 80 / 96px)

Também atualizar os atributos `width={120} height={40}` → `width={96} height={96}` para refletir o aspect ratio quadrado real e evitar CLS.

Opcionalmente reduzir o `gap` entre logos de `gap-12 lg:gap-16` para `gap-8 lg:gap-12` para compensar o aumento e manter densidade visual agradável.

Resultado: logos ~3× maiores, ocupando presença similar à referência típica de "as featured in".
