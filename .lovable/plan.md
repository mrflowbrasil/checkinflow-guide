## Contexto
Na página `/` (`src/pages/LpAnuncio.tsx`), a ordem atual das seções é:

```text
Hero → VideoCriacao → AntesDepois → Beneficios ("Menos mensagens repetidas…") → RealDemoLight → BulletsPro → Gatilhos → CtaFinal
```

A `RealDemoLight` (demo real do guia) deve aparecer **antes** de `Beneficios`.

## Problema de cor
Hoje as seções têm estes fundos:

- `AntesDepois`: `bg-white` (com bordas `border-y`)
- `Beneficios`: sem `bg` (herda o fundo creme/off-white da página)
- `RealDemoLight`: `bg-white` (com bordas `border-y`)

Se simplesmente movermos `RealDemoLight` para entre `AntesDepois` e `Beneficios`, teremos **dois blocos brancos colados** (AntesDepois + RealDemoLight), sem respiro visual.

## Solução

### 1. Reordenar em `LpAnuncio()` (linhas ~89-96)
Nova ordem:

```text
Hero → VideoCriacao → AntesDepois → RealDemoLight → Beneficios → BulletsPro → Gatilhos → CtaFinal
```

### 2. Trocar o fundo da `RealDemoLight` para um tom intermediário
Trocar `bg-white border-y border-slate-200/70` por um fundo cremoso suave que harmonize com a paleta da página (já usa `#FAFAF7` e `#F3EBDD`):

```text
bg-gradient-to-b from-[hsl(186_100%_97%)] via-white to-[#FAF8F2] border-y border-[hsl(186_100%_32%)]/15
```

Resultado das transições verticais:
- `AntesDepois` (branco puro) → `RealDemoLight` (ciano-creme suave) → `Beneficios` (creme da página) → `BulletsPro` (creme da página)

A borda superior ciano-clara da `RealDemoLight` reforça o corte com o branco da `AntesDepois`, e a base cremosa funde-se naturalmente com a `Beneficios`.

### 3. Nenhuma outra alteração
- Beneficios, BulletsPro, Hero etc. ficam intactos.
- IDs (`#demo`) e o `scrollToDemo` continuam funcionando, só mudam de posição na página.
- O link "Ver guia demo como hóspede" dentro da `Beneficios` continuará rolando para `#demo` — só que agora a demo está acima, então o scroll vai para cima (comportamento ainda correto).

## Arquivo afetado
- `src/pages/LpAnuncio.tsx` — duas mudanças pontuais (ordem de render + classe de fundo de `RealDemoLight`).
