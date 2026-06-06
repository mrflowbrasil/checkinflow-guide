## Diagnóstico

Verifiquei a página `/g/suite-premium-vila-serena-23515a`:

- **Capa**: `agradavel-studio-morumbi-01-21a334-1777995850538.jpeg` — **982 KB**, servida em tamanho original (sem redimensionamento), sem `fetchpriority`, sem `width/height` e com `cache-control: no-cache` (default do Supabase Storage).
- **Blocos de imagem**: 6 dos 8 são `.jpeg/.jpg`. Apenas **2 são `.png`** (provavelmente prints de avaliação Google) — não compensa reupload manual; o ganho real vem do redimensionamento + conversão server-side.
- **Renderer** (`BlockRenderer.tsx`) usa `<img src={url} loading="lazy" />` sem `width/height` nem transform.
- **`index.html`** declara 3 `preconnect` + 1 `dns-prefetch`. Em runtime o GA4 + Pixel adicionam outros origins, gerando o aviso "mais de 4 preconnect".

## Plano

### 1. Helper de imagem do Supabase (`src/lib/supabase-image.ts` — novo)
Função `sbImage(url, { width, quality=75, format='origin' })` que reescreve URLs do tipo `…/storage/v1/object/public/…` para `…/storage/v1/render/image/public/…?width=…&quality=75` — o endpoint render do Supabase serve já redimensionado e otimizado (inclusive PNG vira PNG menor; com `format=origin` o navegador pode aceitar webp via `Accept`). Devolve a URL original se não bater o padrão (não quebra assets externos).

### 2. Capa do guia (`src/pages/GuestGuide.tsx`)
- Trocar `<img src={data.cover_image_url} …>` por `sbImage(url, { width: 1200 })` (mobile carrega via `srcset`: 640w/960w/1280w).
- Adicionar `width`, `height`, `fetchpriority="high"`, `decoding="async"`, manter `object-cover`.
- Preload no `<head>` via Helmet: `<link rel="preload" as="image" href={sbImage(cover,{width:960})} fetchpriority="high" imagesrcset="…" imagesizes="100vw">` — corrige "Detalhamento da LCP".

### 3. Blocos de imagem (`src/components/blocks/BlockRenderer.tsx`)
- Aplicar `sbImage(url, { width: 800 })` no `<img>` do bloco `image`.
- Manter `loading="lazy"` e adicionar `decoding="async"`. (Sem width/height fixos porque a proporção é livre — manter `aspect-ratio` via CSS opcional fica fora do escopo.)

### 4. Preconnects (`index.html`)
- Remover `preconnect` para `connect.facebook.net` (Pixel só carrega em `window.load`, já tarde demais para se beneficiar) e deixar apenas `dns-prefetch`.
- Manter apenas: `preconnect` para `googletagmanager.com` (GTM/GA) e `supabase.co` (dados + imagens). Total = 2 preconnect → encerra o aviso.

### 5. Cache lifetimes (limitação documentada)
O Supabase Storage devolve `cache-control: no-cache` por padrão para arquivos já enviados. **Solução real exige re-upload** com header `cacheControl: '31536000'` — fora do escopo desta task pois afeta o backend de upload, mas vou anotar como follow-up. O endpoint `render/image` também herda esse header, então o ganho do PageSpeed nesse insight só virá quando padronizarmos os uploads (futuro PR).

### Fora de escopo
- "Reflow forçado", "JavaScript legado" (12 KiB), "DOM size", "Terceiros" — exigem mudanças mais profundas (refactor de componente, ajuste de Vite target, etc.). Posso atacar num passo seguinte se quiser.
- Conversão dos 2 PNGs do banco para WebP/JPEG — o render endpoint já reduz drasticamente o peso, não precisa reupload.

## Validação
- Após deploy, rodar PageSpeed novamente na demo: esperar LCP ↓ (capa de ~980 KB para ~120 KB), insight "Melhorar entrega de imagens" zerado, aviso de preconnect resolvido.
