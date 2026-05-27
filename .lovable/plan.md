## Diagnóstico

Análise feita no código e nos assets do projeto. Principais problemas detectados (alinhados com o relatório anexado):

### 1. JavaScript bloqueante / bundle inchado
- `src/App.tsx` importa **estaticamente 35+ páginas** (dashboard inteiro, landings SEO, editor, jsPDF, recharts, embla, react-easy-crop, dnd-kit, stripe). Tudo isso vai no bundle inicial da home, mesmo sem o usuário entrar no dashboard.
- Resultado: JS muito maior que o necessário → bate no aviso "Uso de JavaScript e CSS de bloqueio" e "Compactação de JS".

### 2. Imagens grandes / não otimizadas
- `public/1cf79061-…jpg`, `2b8b8106-…jpg`, `393a68b5-…jpg`, `4f67f9e6-…jpg` → ~**2,8 MB** somados, em JPG dentro de `/public`.
- `src/assets/preview-cover-vila-serena.jpg` = **983 KB** (já existe versão `.webp` de 178 KB que não está sendo usada).
- `src/assets/welcome-hub-phone-mockup.png` = **380 KB** (existe `welcome-hub-phone-original-v2.webp` = 158 KB).
- Causa o aviso "Otimização de imagens".

### 3. LCP sem preload + sem `<link rel="preconnect">`
- Sem `preconnect` para `fonts.googleapis.com`, `www.googletagmanager.com`, `connect.facebook.net`.
- Sem `preload` da imagem do hero (mockup do celular), que é o LCP da home.

### 4. Scripts de terceiros no `<head>` síncronos
- GA4 já é `async`, ok.
- Meta Pixel é injetado pelo snippet (assíncrono na prática), mas o IIFE roda no parsing do HTML. Pode ser movido para depois do `load` para liberar o caminho crítico.

### 5. Shader WebGL sempre rodando
- `src/components/ui/shader-background.tsx` tem `const reduced = false;` hardcoded → ignora `prefers-reduced-motion` e mantém `requestAnimationFrame` rodando mesmo com a aba em background, consumindo CPU/GPU.

### 6. Cache do navegador (relatado no print)
- "Aproveitamento de cache" — depende dos headers de hospedagem (Lovable já serve com cache nos assets do `dist/`). Vou verificar se há arquivos em `/public/` sendo referenciados sem hash que poderiam ir pra `src/assets` para ganhar hash + cache imutável.

---

## Plano de mudanças

### A. Code-splitting de rotas (maior ganho)
Em `src/App.tsx`:
- Manter import direto só de `WelcomeHubLanding` (landing pública atual em `/`) e `NotFound`.
- Trocar todas as outras páginas para `React.lazy(() => import(...))`.
- Envolver `<Routes>` num `<Suspense fallback={null}>` (ou um spinner leve).
- Esperado: bundle inicial da home cai drasticamente (provavelmente >60%), removendo recharts, jspdf, dnd-kit, stripe, embla do caminho crítico.

### B. Otimização de imagens
- Remover/substituir os 4 JPGs grandes em `/public` (1cf7…, 2b8b…, 393a…, 4f67…). Primeiro verificar se ainda são referenciados; se sim, gerar versões `.webp` e atualizar referências.
- Em `WelcomeHubLanding.tsx`: trocar `welcome-hub-phone-mockup.png` por `welcome-hub-phone-original-v2.webp` (já existe).
- Garantir que onde `preview-cover-vila-serena.jpg` é usada seja usada a versão `.webp`.
- Adicionar `width`/`height` explícitos no `<img>` do hero para evitar CLS.

### C. Otimização do caminho crítico (`index.html`)
- Adicionar:
  ```html
  <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>
  <link rel="preconnect" href="https://connect.facebook.net" crossorigin>
  <link rel="dns-prefetch" href="https://www.facebook.com">
  ```
- Adiar a inicialização do Meta Pixel para após o evento `load` (mantendo `fbq('track','PageView')` na primeira renderização, mas sem bloquear o parsing).

### D. Shader background
Em `src/components/ui/shader-background.tsx`:
- Respeitar `window.matchMedia('(prefers-reduced-motion: reduce)')` (definir `reduced` corretamente).
- Pausar o `requestAnimationFrame` quando a aba estiver oculta (`document.visibilitychange`) ou quando o canvas sair do viewport (`IntersectionObserver`).

### E. Verificações finais
- Rodar `npm build` e conferir tamanhos dos chunks via output do Vite.
- Validar que rotas `lazy` carregam sem quebrar (testar `/`, `/auth`, `/app`).

---

## Detalhes técnicos

Os assets `.webp` já existem para os principais mockups, então a troca é só de import. Os JPGs em `/public/` parecem ser uploads antigos — vou rodar `rg` para confirmar uso antes de remover.

O ganho estimado:
- **JS inicial**: -60% a -70% (após lazy de dashboard + SEO landings)
- **Imagens**: ~3 MB a menos no carregamento inicial se algum dos JPGs grandes estiver em uso
- **LCP**: melhoria com preconnect + uso de WebP no hero
- **CPU em idle**: shader respeitando reduced-motion e visibilidade

Nada de mudanças em backend, RLS, ou design — apenas otimizações estruturais de frontend.
