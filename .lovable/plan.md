## Ajustes em `src/pages/WelcomeHubLanding.tsx`

### 1. "WELCOME HUB" abaixo da logo (header)
Trocar o `<a>` do header (linhas 45-48) para empilhar logo + label:
- `flex items-center gap-3` → `flex flex-col items-start leading-none`
- Manter `<MrFlowLogo forceDark className="h-9 w-auto" />`
- Mover o `<span>` "Welcome Hub" para abaixo, com `mt-1 text-[9px] tracking-[0.25em] text-[#CBD5E1] uppercase` (remover `hidden sm:inline` para aparecer sempre, ou manter; sugestão: deixar visível em todos os breakpoints).

### 2. Cor da palavra "experiência digital" → `#00ff00`
Linha 170: trocar `text-[#00FFFF]` por `text-[#00FF00]` apenas no `<span>` dessa frase. Demais elementos cyan permanecem.

### 3. Mockup maior + chips parcialmente sobre a imagem
No bloco do hero (linhas 188-200):
- Aumentar o tamanho da imagem: `max-w-[520px]` → `max-w-none w-[110%] sm:w-full` (ou simplesmente remover o `max-w-[520px]` e usar `w-full` para preencher toda a coluna). Aumentar também a `min-h` do container de `min-h-[480px]` para `min-h-[560px]` para acomodar.
- Reposicionar os 4 `FloatingChip` para ficarem sobrepostos à imagem, não nas bordas externas:
  - `top-6 -left-2` → `top-10 left-4`
  - `top-1/3 -right-2` → `top-1/4 right-2`
  - `bottom-20 -left-4` → `bottom-24 left-2`
  - `bottom-6 -right-2` → `bottom-10 right-6`
- Remover `hidden lg:flex` do `FloatingChip` (linha 149) e trocar por `hidden md:flex` para que os chips apareçam também em tablets, mantendo escondidos só no mobile (onde sobrepor não funciona bem).
- Garantir que os chips fiquem acima da imagem: já têm `z-10`; adicionar `z-0` explicitamente na `<img>` para clareza.

### 4. Observação sobre qualidade da imagem
A imagem atual (`src/assets/welcome-hub-phone-mockup.png`) foi gerada com fundo transparente a partir do upload original. Ao aumentar para ~520-620px, pode haver leve perda de nitidez, mas ainda deve ficar aceitável. **Se após o ajuste a imagem aparecer pixelada, o usuário pode enviar um mockup em resolução maior** que substituiremos no mesmo caminho (`src/assets/welcome-hub-phone-mockup.png`) — sem outras mudanças no código.

### Escopo
- Arquivo único: `src/pages/WelcomeHubLanding.tsx`.
- Sem mudanças em rotas, dados, design system global ou backend.
