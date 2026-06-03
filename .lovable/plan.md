## Objetivo
Substituir a faixa estática de logos por um carrossel infinito com as 8 logos enviadas, todas em escala de cinza, e alinhar a tipografia do título com o restante da página.

## Mudanças

### 1. Upload das 8 logos para o CDN (Lovable Assets)
Subir cada arquivo de `/mnt/user-uploads/` via `lovable-assets create`, salvando os pointers em `src/assets/lp/logos/`:
- airbnb.png, booking.png, tripadvisor.png, vrbo.png, stays.png, hostaway.png, omnibees.png, hospedin.png

Após o upload, os arquivos originais permanecem somente em `/mnt/user-uploads/` (não copiamos binários para o repo).

### 2. Refazer `TrustLogos` em `src/pages/LpAnuncio.tsx`
Substituir o bloco atual (linhas ~1114-1145) por um carrossel infinito:

- **Container**: `bg-gray-50/80 border-y border-slate-200/60 py-8 lg:py-10 overflow-hidden`.
- **Título**: trocar a fonte custom (`Helvetica Neue`) por classes alinhadas ao restante da LP — `font-sans text-[11px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-slate-500`, centralizado, com `mb-6`.
- **Track**: wrapper `overflow-hidden` com máscara lateral (`mask-image: linear-gradient(...)` para fade nas bordas) e um `flex gap-12 lg:gap-16 w-max` com a lista de logos duplicada (`[...logos, ...logos]`) para loop perfeito.
- **Animação**: `@keyframes mrflow-logos-scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }`, aplicada com `animation: mrflow-logos-scroll 40s linear infinite`. Pausa no hover (`hover:[animation-play-state:paused]`).
- **Logos**: `<img>` com `h-7 sm:h-8 lg:h-9 w-auto object-contain` + `grayscale opacity-60 hover:opacity-100 transition` para uniformizar o tom de cinza independente da cor original (Airbnb vermelho, Vrbo azul, Omnibees amarelo, Hospedin roxo, Booking azul, Tripadvisor colorido → todas viram cinza via filtro CSS).
- Remover todos os wordmarks em texto puro que existem hoje.

### 3. CSS do keyframe
Definir o keyframe dentro de uma tag `<style>` inline no próprio componente `TrustLogos` (mesmo padrão de `ImageAutoSlider`), evitando mexer em `index.css`/`tailwind.config.ts`.

## Fora do escopo
- Não alterar `Depoimentos`, hero, ou qualquer outra seção.
- Não modificar `index.css`/Tailwind config.
- Não mexer em outras páginas SEO que possam ter faixas similares.
