# Posts SEO (blog)

Todo novo post em `src/pages/seo/*` **deve** ser criado via `<SeoLandingLayout>`
e informar obrigatoriamente:

- `path` — rota canônica (`/slug-do-post`)
- `title` (≤60 caracteres)
- `description` (≤160 caracteres)
- `eyebrow`, `h1`, `intro`, `sections`, `faq`, `internalLinks`
- `datePublished` — ISO 8601, ex.: `"2026-05-29"`
- `dateModified` — ISO 8601, atualizar sempre que o conteúdo mudar
- `author` (opcional) — default `{ name: "Mr Flow", url: "https://hub.mrflow.com.br" }`
- `articleType` (opcional) — `"Article"` (default) ou `"BlogPosting"`

O layout aplica automaticamente, em toda página:

- `Article` JSON-LD com `headline`, `author`, `publisher`, `datePublished`,
  `dateModified`, `mainEntityOfPage`, `image`, `inLanguage`
- `FAQPage` JSON-LD (quando `faq` tem itens — sempre)
- `BreadcrumbList` JSON-LD
- `SoftwareApplication` JSON-LD
- Open Graph completo com `og:type="article"` + `article:published_time` +
  `article:modified_time` + `article:author`
- Twitter Card
- `<link rel="canonical">` apontando para `https://hub.mrflow.com.br${path}`

Não duplique nenhuma dessas tags no componente da página — o layout cuida.
Também não adicione o post fora de `App.tsx` (registrar a rota lá) e
em `public/sitemap.xml`.
