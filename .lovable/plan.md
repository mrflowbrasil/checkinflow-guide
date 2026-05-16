## Auditoria SEO — Mr Flow Welcome Hub

Fiz a varredura de `index.html`, `public/robots.txt`, `public/sitemap.xml`, `src/components/Seo.tsx`, `src/components/seo/SeoLandingLayout.tsx`, `src/App.tsx`, `src/pages/Index.tsx` e dos 14 componentes em `src/pages/seo/landings.tsx` e `src/pages/seo/clusters.tsx`.

### Resultado por checklist

| Item | Status |
|---|---|
| `lang="pt-BR"` no `<html>` | OK (definido em `index.html`) |
| `<title>` único por página | OK — 14 títulos distintos + home |
| `<meta description>` única por página | OK — 15 descrições distintas |
| H1 único por página | OK — cada landing tem 1 H1 só |
| Canonical correta | OK — `Seo.tsx` injeta `https://hub.mrflow.com.br{path}` por rota; `index.html` não tem canonical estática (sem duplicação) |
| `robots index,follow` | OK — `Seo.tsx` define explicitamente em todas as rotas públicas |
| Open Graph (title/description/url/type/locale/site_name) | OK em todas as rotas |
| Twitter Cards | OK — `twitter:card=summary_large_image` sitewide em `index.html`; `twitter:title/description/image` por rota |
| JSON-LD válido | OK — cada landing: `SoftwareApplication` + `FAQPage` + `BreadcrumbList` + `Organization`. Home: `Organization` + `WebSite` |
| `noindex` indevido | Nenhum encontrado nas páginas públicas |
| Canonical quebrado | Nenhum |
| Title/description duplicados | Nenhum |
| Renderização SEO | Helmet via `HelmetProvider` em `main.tsx` — funciona para Googlebot. Limitação documentada: crawlers sem JS (LinkedIn/Slack) veem apenas `index.html` — aceitável, pois há fallback OG sitewide |
| `sitemap.xml` | 16 URLs: home + 14 landings + `/auth`. Todas as 14 páginas auditadas estão presentes |
| `robots.txt` | Permite tudo, bloqueia apenas `/app`, `/admin`, `/invite`; aponta para o sitemap correto |

### Validação das 14 páginas pedidas

Todas as 14 (`/guia-digital-airbnb`, `/manual-digital-airbnb`, `/app-para-anfitriao`, `/hub-de-boas-vindas`, `/guest-app-airbnb`, `/guia-do-hospede`, `/check-in-digital-airbnb`, `/qr-code-para-hospedes`, `/manual-da-casa-airbnb`, `/app-para-hospedes`, `/experiencia-do-hospede`, `/como-reduzir-perguntas-no-whatsapp`, `/como-melhorar-avaliacoes-airbnb`, `/como-organizar-check-in-airbnb`):

- Indexáveis ✓
- Estão no `sitemap.xml` ✓
- Canonical correta apontando para `hub.mrflow.com.br` ✓
- JSON-LD válido (4 schemas por página) ✓

### Conclusão

**Nenhum problema crítico encontrado.** A base SEO está bem implementada. Identifiquei só 2 pontos de polimento opcionais:

### Correções propostas (pequenas, opcionais)

1. **Remover `Organization` JSON-LD duplicado nas landings** — `SeoLandingLayout` injeta `Organization` em cada rota, mas o mesmo schema já está em `index.html` sitewide. Não quebra nada (Google aceita), mas é redundante. Remover do layout deixa o HTML mais limpo.

2. **Adicionar `og:image` e `twitter:image` sitewide como fallback explícito no `Seo.tsx`** — hoje as landings não passam `image`, então dependem apenas do `og:image` de `index.html`. Helmet pode acabar suprimindo isso em alguns parsers. Solução: no `Seo.tsx`, usar a imagem do logo Welcome Hub como default quando `image` não for passada — garante que toda página tenha imagem social válida.

### Relatório final que entregarei

- **O que estava errado:** nada crítico. Dois pontos de polimento (Organization duplicado, og:image default ausente nas landings).
- **O que será corrigido:** os 2 itens acima.
- **O que ainda precisa de atenção:** nenhum item de SEO técnico. Recomendações futuras de conteúdo/links externos ficam fora do escopo desta auditoria.

### Detalhes técnicos das correções

- `src/components/seo/SeoLandingLayout.tsx`: remover o objeto `orgLd` e tirar do array passado ao `<Seo jsonLd={[...]}/>`.
- `src/components/Seo.tsx`: importar o asset `mrflow-logo-white.png` (ou usar a URL pública do GCS já presente em `index.html`) e usar como default de `image` quando não informado. Manter `image` opcional na interface, mas sempre renderizar `og:image`/`twitter:image`.

Nenhuma mudança em rotas, sitemap, robots ou index.html é necessária.