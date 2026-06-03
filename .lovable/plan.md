## Diagnóstico

O mockup foi reduzido em desktop via `clamp()` aplicado direto na largura/altura do iframe (linhas 484–486 de `src/pages/LpAnuncio.tsx`). Como o iframe carrega a página real do guest em modo mobile-first, quando ele é reduzido para ~260px de largura, o **conteúdo interno** (header com logo, título, botões) é renderizado a 260px e fica espremido — a logo encosta no título, botões ficam estreitos. O Tailwind do guest assume ~375px como largura mobile padrão.

A correção da etapa anterior reduziu o "vidro" do mockup, mas também encolheu o conteúdo, criando o problema atual.

## Plano

Manter o iframe sempre em **largura/altura nativas de mobile** (375 × 800px) e usar `transform: scale()` para encolher o mockup inteiro proporcionalmente em desktop, preservando o layout interno como num celular real.

### Mudanças em `src/pages/LpAnuncio.tsx` (linhas 481–496)

1. **Wrapper externo** com `aspect-ratio` reservando o espaço escalado, para não quebrar o grid.

2. **Mockup em tamanho fixo "real"**: `w-[375px] h-[800px]` (frame interno do iframe). Borda externa (`border-[10px]`) e `rounded-[3rem]` mantêm o visual atual.

3. **Iframe** volta a `w-full h-full` sobre 375×800 — sem clamp — então renderiza a página como um celular de verdade.

4. **Escala responsiva via CSS variable + `transform: scale(var(--mockup-scale))`** com `transform-origin: top center`:
   - Mobile/tablet (`<lg`): `--mockup-scale: 0.8` em telas estreitas para casar com o tamanho atual de ~300/340px.
   - Desktop (`lg:`): `--mockup-scale: clamp(0.55, calc(66vh / 820), 0.95)`.
   - Resultado em viewport de 673px alt (como o atual do usuário): escala ≈ 0.54 → mockup ≈ 202×432px com conteúdo renderizado em 375px e proporcional.
   - Em telas de ≥1080px alt: volta perto de 0.95 (≈ 356×760).

5. **Container reserva espaço real**: usar `style={{ width: 'calc(375px * var(--mockup-scale))', height: 'calc(820px * var(--mockup-scale))' }}` no wrapper, com o mockup absoluto dentro escalado. Assim o grid mede o tamanho final correto e nada vaza.

6. **Notch** volta a `w-32 h-6` (tamanho fixo, escala junto com o transform).

7. **Gap do grid** mantém `gap-8 lg:gap-10`.

### Resultado

- O conteúdo dentro do iframe sempre renderiza em 375px (largura mobile real) → logo, título e botões com proporção correta.
- O mockup inteiro encolhe/cresce proporcionalmente conforme a altura da viewport.
- Cabe inteiro em notebooks 15,6" e monitores 20" sem espremer nada.

## Escopo

- Arquivo alterado: `src/pages/LpAnuncio.tsx` apenas (linhas 481–496).
- Sem mudanças em backend, rotas ou outras seções.
- Mobile e tablet permanecem visualmente próximos do atual.
