## Diagnóstico

Em `src/pages/LpAnuncio.tsx` (linhas 484–486), o mockup do celular usa dimensões fixas que não consideram a altura da viewport:

- Largura: `w-[300px] sm:w-[340px]`
- Altura interna: `h-[620px] sm:h-[700px]`

Somando borda (`border-[10px]`) e padding do container, o mockup ocupa ~720px de altura no breakpoint `sm+`. Em monitores 20" (≈900px úteis com chrome do navegador) e notebooks 15,6" (≈660–720px úteis), o mockup ultrapassa a viewport, forçando o usuário a rolar e nunca vendo-o inteiro junto com o texto ao lado.

## Plano

Tornar as dimensões do mockup responsivas à altura da viewport em desktop, mantendo a proporção atual (~aspect 17:35) e o visual mobile inalterado.

1. **Substituir altura/largura fixas por `clamp()` baseado em `vh`** no container do mockup (linha 484 e 486 de `src/pages/LpAnuncio.tsx`):
   - Mobile (`<lg`): mantém `w-[300px] sm:w-[340px]` e `h-[620px] sm:h-[700px]` como está hoje.
   - Desktop (`lg:`): aplicar
     - `lg:w-[clamp(260px,32vh,340px)]`
     - `lg:h-[clamp(540px,66vh,700px)]`
   - Resultado: em telas de ~720px de altura, mockup ≈ 475px alt × 230px larg; em telas ≥1060px volta ao tamanho máximo atual (700×340). Cabe inteiro ao lado do texto em notebooks e monitores 20".

2. **Ajustar o notch** (linha 485) para escalar junto:
   - Trocar `w-32 h-6` por `w-[40%] h-[3.5%]` para acompanhar proporcionalmente a largura/altura do mockup quando ele encolhe em desktop.

3. **Reduzir gap do grid em desktop** (linha 446), trocando `gap-12` por `gap-8 lg:gap-10`, dando mais respiro horizontal sem afetar mobile.

4. **Garantir alinhamento vertical** — o `items-center` já existente no grid mantém o mockup centralizado verticalmente em relação ao bloco de texto após o redimensionamento.

## Escopo

- Arquivo alterado: `src/pages/LpAnuncio.tsx` (apenas as linhas 446, 484, 485, 486).
- Nenhuma mudança em outras seções, rotas, backend ou estilo global.
- Mobile e tablet permanecem visualmente idênticos.
