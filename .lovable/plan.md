## Diagnóstico

Inspeção dos pesos atuais (assets + bundles) na rota `/` (LpAnuncio) e demais landings:

| Recurso | Peso atual | Problema |
|---|---|---|
| `src/assets/lp/hero-guest-phone.webp` (LCP do `/`) | **1.3 MB** | Imagem do herói carregada `eager` + `fetchpriority="high"`. Domina o LCP. |
| `public/videos/hub-rapido2.mp4` (`/lp`) | **5.8 MB** | `autoPlay` com `preload="metadata"`; quando entra em viewport baixa o arquivo inteiro. |
| `src/assets/preview-cover-vila-serena.webp` | 174 KB | Resolução/qualidade acima do necessário. |
| `src/assets/mockup-home-light.webp` | 119 KB | Mesmo caso. |
| `src/assets/carrossel/hub-3.webp` / `hub-4.webp` | 139 / 124 KB | Carrossel renderiza 4 imagens — pode pesar mais que o necessário. |
| `WelcomeHubLanding` em `src/App.tsx` | bundle inicial | Importado **eager** mesmo só sendo usado em `/lp` — entra no JS inicial da home. |
| `index.html` | — | Falta `<link rel="preload" as="image">` para o LCP. |
| Vários `<img>` na LP | — | Sem `width/height` explícitos em alguns (CLS) e logos parceiros (`airbnb`, `booking`, etc) carregam todos juntos. |

Pontos já bons (manter): rotas com `lazy()`, `decoding="async"` no herói, GA/GTM/Pixel só em produção, `preconnect` configurado, service worker antigo é limpo.

## Mudanças propostas

### 1. Re-encodar imagens grandes (sharp via script único)
- Para cada arquivo abaixo, gerar uma versão otimizada (máx 1280px largura, WebP qualidade ~72, AVIF qualidade ~50 para o herói) e substituir/uploadar:
  - `hero-guest-phone.webp` → alvo ~150–220 KB (WebP) + variante AVIF.
  - `preview-cover-vila-serena.webp` → ~60 KB.
  - `mockup-home-light.webp` → ~50 KB.
  - `carrossel/hub-3.webp` e `hub-4.webp` → ~40–50 KB cada.
- Atualizar `<img>` do herói para usar `<picture>` com `srcset` AVIF + WebP e `sizes="(min-width: 1024px) 50vw, 100vw"`.

### 2. Preload do LCP em `index.html`
- Adicionar `<link rel="preload" as="image" href="<URL hero otimizado>" fetchpriority="high" imagesrcset="..." imagesizes="...">` somente para a rota `/`. Como Vite serve um único `index.html`, usar a URL otimizada do herói (cache do bundler resolve).

### 3. Lazy-load do `WelcomeHubLanding`
- Em `src/App.tsx`, trocar `import WelcomeHubLanding from "./pages/WelcomeHubLanding"` por `lazy()`. A rota `/` usa `LpAnuncio` (já lazy), então a home não precisa carregar JS do `/lp` no bundle inicial.

### 4. Vídeo `hub-rapido2.mp4` (5.8 MB)
- Mover de `public/videos/` para CDN de assets (`lovable-assets create`).
- Gerar uma versão re-encodada menor (resolução 960×540, bitrate ~700kbps, CRF 30) — alvo ~1.5–2 MB.
- Adicionar `poster="..."` (uma imagem leve do primeiro frame) e trocar `autoPlay` por play sob demanda via `IntersectionObserver` (toca quando entra em viewport, pausa quando sai). Mantém percepção de auto-play sem baixar antes de aparecer.

### 5. Higiene de `<img>` na LP
- Garantir `loading="lazy"` + `decoding="async"` + `width`/`height` em todas as imagens fora do viewport inicial (logos de parceiros, mockup lifestyle, cards do carrossel sticky).
- Logos de parceiros: definir `width={120} height={40}` para evitar CLS.

### 6. Suspense fallback sem flicker
- Trocar `<Suspense fallback={null}>` por um fallback mínimo (div com altura reservada) só nas rotas com herói visual, evitando re-layout grande ao terminar de hidratar o chunk lazy.

## Detalhes técnicos

- Script de otimização: `node` + `sharp` rodado uma vez via `code--exec`, gravando os arquivos otimizados de volta nos mesmos paths (para WebP/AVIF locais) e usando `lovable-assets create` para o vídeo.
- AVIF: gerado apenas para o herói (maior ganho); demais ficam só WebP.
- Não tocar em código de domínio, dados, auth ou backend. Mudanças restritas a `src/App.tsx`, `index.html`, `src/pages/LpAnuncio.tsx`, `src/pages/WelcomeHubLanding.tsx`, `src/components/ui/sticky-scroll-cards-section.tsx`, `src/components/ui/image-auto-slider.tsx` e arquivos de assets.

## Resultado esperado

- LCP do `/` deve cair de >2.5s (em 4G simulado) para <1.5s.
- Peso total inicial da home: redução de ~1.3 MB (herói) + JS do `/lp` removido do bundle inicial.
- `/lp` não baixa mais 5.8 MB de vídeo automaticamente; só quando visível e em versão menor (~1.5–2 MB).
- CLS reduzido nos blocos de logos e mockups.

Quer que eu aplique tudo de uma vez ou prefere começar só pelo herói + lazy do WelcomeHubLanding (maior impacto, menor risco) e depois fazer o vídeo numa segunda etapa?