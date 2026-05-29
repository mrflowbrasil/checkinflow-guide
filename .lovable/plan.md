## Contexto

As "páginas de blog" do projeto são as landing pages SEO em `src/pages/seo/{landings,clusters,extras}.tsx`. Todas renderizam através de `src/components/seo/SeoLandingLayout.tsx`, que já cuida de:

- `<title>`, `<meta description>`, `<link rel="canonical">` (via `Seo.tsx`)
- Open Graph completo (`og:title`, `og:description`, `og:url`, `og:type`, `og:image`, `og:locale`, `og:site_name`) + Twitter Card
- JSON-LD: `SoftwareApplication`, `FAQPage`, `BreadcrumbList`

**Faltando** para performance editorial: `Article` (com `author`, `datePublished`, `dateModified`) e padronizar `og:type="article"` + `article:published_time` / `article:modified_time`.

## O que vou implementar

### 1. Estender `SeoLandingLayout` com metadados de artigo

Adicionar props opcionais com defaults sensatos:

- `datePublished: string` (ISO 8601) — obrigatório por convenção, com fallback `"2026-01-01"` caso não informado para posts legados
- `dateModified?: string` — default = `datePublished`
- `author?: { name: string; url?: string }` — default = `{ name: "Mr Flow", url: "https://hub.mrflow.com.br" }`
- `articleType?: "Article" | "BlogPosting"` — default `"Article"`

Comportamento dentro do layout:

- Trocar `type="website"` por `type="article"` na chamada do `<Seo>` (Open Graph)
- Injetar JSON-LD adicional `Article` no array passado ao `<Seo>`:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "<title>",
    "description": "<description>",
    "mainEntityOfPage": "https://hub.mrflow.com.br<path>",
    "url": "https://hub.mrflow.com.br<path>",
    "datePublished": "...",
    "dateModified": "...",
    "author": { "@type": "Organization", "name": "Mr Flow", "url": "https://hub.mrflow.com.br" },
    "publisher": {
      "@type": "Organization",
      "name": "Mr. Flow Automações e Serviços Digitais LTDA",
      "logo": { "@type": "ImageObject", "url": "<DEFAULT_OG_IMAGE>" }
    },
    "image": "<og image>"
  }
  ```
- Manter `SoftwareApplication`, `FAQPage` e `BreadcrumbList` já existentes.

### 2. Estender `Seo.tsx` com tags de artigo

Quando `type === "article"` e props `datePublished` / `dateModified` / `author` forem passadas, emitir:

- `<meta property="article:published_time" content="..." />`
- `<meta property="article:modified_time" content="..." />`
- `<meta property="article:author" content="Mr Flow" />`

(canonical e og:* já existem; só adicionamos os campos de artigo)

### 3. Preencher datas para os posts atuais

Os 26 posts existentes em `landings.tsx`, `clusters.tsx`, `extras.tsx` recebem `datePublished` e `dateModified` na chamada de `<SeoLandingLayout>`. Vou usar `datePublished="2026-01-15"` e `dateModified="2026-05-29"` (hoje) como baseline uniforme — assim o Google vê data válida e o autor pode evoluir caso a caso depois.

### 4. Regra para novos posts (documentação no projeto)

Criar `src/pages/seo/README.md` com checklist obrigatório para qualquer novo post:

```
Todo novo post SEO em src/pages/seo/* deve usar <SeoLandingLayout> e informar:
- path, title (≤60), description (≤160)
- eyebrow, h1, intro, sections, faq, internalLinks
- datePublished (ISO, ex: "2026-05-29")
- dateModified (ISO, atualizar sempre que editar conteúdo)
- author opcional — default Mr Flow

Schemas garantidos automaticamente pelo layout:
Article + Author + Published/Modified, FAQPage, BreadcrumbList,
SoftwareApplication, Open Graph article, Twitter Card, canonical.
```

E salvar como memória do projeto (`mem://features/seo-blog-posts`) para que toda criação futura siga o padrão sem precisar lembrar manualmente.

## Arquivos alterados

- `src/components/Seo.tsx` — aceitar `datePublished`, `dateModified`, `author`; emitir `article:*` meta tags
- `src/components/seo/SeoLandingLayout.tsx` — props novas + JSON-LD `Article` + `type="article"`
- `src/pages/seo/landings.tsx` — adicionar `datePublished` / `dateModified` nos 6 posts
- `src/pages/seo/clusters.tsx` — idem nos 8 posts
- `src/pages/seo/extras.tsx` — idem nos 10 posts
- `src/pages/seo/README.md` — checklist obrigatório
- `mem://features/seo-blog-posts` + atualização do índice de memória

## Fora do escopo

- Não toco em `index.html` (head sitewide já correto)
- Não mexo no `Sitemap.xml` nem em `robots.txt`
- Não altero `GoogleAnalyticsTracker` nem `MetaPixelTracker`
- Não mudo rotas em `App.tsx`