## Diagnóstico
Auditei os assets de imagem do projeto. Os maiores ofensores estão na rota `/` (LpAnuncio):

| Arquivo | Tamanho | Dimensões | Uso real |
|---|---|---|---|
| `src/assets/lp/hero-mockup-lifestyle.jpg` | **1.5 MB** | 896×1200 | Sticker de **150px** no hero |
| `src/assets/hero-mockup-lifestyle.jpg` | **1.3 MB** | 1024×1024 | Sticker pequeno em `/lp` |
| `src/assets/lp/hero-guest-phone.jpg` | 129 KB | 1920×1080 | **Imagem LCP do hero** (renderizada ~600px) |
| `public/*.webp` (4 cards) | 65–114 KB | 1376×768 | Cards renderizados ~600px |
| `src/assets/welcome-hub-phone-original.png` | 565 KB | — | **Não usado** |
| `src/assets/welcome-hub-phone-original-v2.webp` | 155 KB | — | **Não usado** |

Total bruto hoje: ~4.5 MB de imagens; após otimização esperamos **~400 KB** (redução ~90%).

Além disso, a imagem LCP do hero (`hero-guest-phone.jpg`) está com `loading` padrão e sem `fetchpriority`/`preload` — atrasa o LCP.

## Plano de otimização

### 1. Recompressão e redimensionamento (sharp via script único)
Para cada asset abaixo, gerar versão `.webp` na largura útil máxima (2× do tamanho renderizado, para retina) e substituir os imports no código.

| Arquivo origem | Saída | Largura alvo | Qualidade |
|---|---|---|---|
| `src/assets/lp/hero-mockup-lifestyle.jpg` | `.webp` | 320 px | 80 |
| `src/assets/hero-mockup-lifestyle.jpg` | `.webp` | 320 px | 80 |
| `src/assets/lp/hero-guest-phone.jpg` | `.webp` | 1200 px | 78 |
| `public/{4f67…,393a…,1cf7…,2b8b…}.webp` | sobrescrever | 1000 px | 78 |

Os arquivos `.webp` derivados das duas `hero-mockup-lifestyle.jpg` ficarão ao lado dos originais; depois removo os `.jpg` antigos.

### 2. Remover assets não usados
- `src/assets/welcome-hub-phone-original.png` (565 KB)
- `src/assets/welcome-hub-phone-original-v2.webp` (155 KB)

### 3. Atualizar imports
- `src/pages/LpAnuncio.tsx`: trocar `hero-mockup-lifestyle.jpg` → `.webp`; trocar `hero-guest-phone.jpg` → `.webp`.
- `src/pages/WelcomeHubLanding.tsx`: trocar `hero-mockup-lifestyle.jpg` → `.webp`.

### 4. Priorizar o LCP do hero (`/`)
Em `src/pages/LpAnuncio.tsx`, na `<img>` do `heroImg`:

- Adicionar `loading="eager"`, `fetchpriority="high"`, `decoding="async"`.

Não vou adicionar `<link rel="preload">` em `index.html` porque o asset tem hash do Vite e o caminho não é estável — o `fetchpriority="high"` no `<img>` já garante priorização sem o risco de preload quebrado.

### 5. Verificação
- Rodar o script e listar tamanhos finais.
- Conferir que os imports ainda resolvem e não sobra referência ao `.jpg` removido (`rg`).

## Arquivos afetados
- `src/assets/lp/hero-mockup-lifestyle.jpg` → substituído por `.webp`
- `src/assets/hero-mockup-lifestyle.jpg` → substituído por `.webp`
- `src/assets/lp/hero-guest-phone.jpg` → substituído por `.webp`
- `public/4f67f9e6-9ac6-4147-bfc3-24da30575b55.webp` (e os outros 3) → reotimizados in-place
- `src/assets/welcome-hub-phone-original.png` e `-v2.webp` → removidos
- `src/pages/LpAnuncio.tsx` e `src/pages/WelcomeHubLanding.tsx` → imports + atributos do `<img>` do hero

Nada de mudança visual: dimensões finais renderizadas permanecem idênticas.
