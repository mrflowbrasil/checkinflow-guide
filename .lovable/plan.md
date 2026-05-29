# Nova landing: Checklist 5 Estrelas para Airbnb

Criar uma landing page de captura para o "Checklist Gratuito de Inspeção 5 Estrelas para Airbnb", reaproveitando 100% o layout, header, footer, tipografia, cores e componentes já usados nas demais páginas SEO do Welcome Hub (`SeoLandingLayout`).

## Rota

- URL: `/checklist-inspecao-5-estrelas-airbnb`
- Registrada em `src/App.tsx` com `lazy()` no mesmo padrão das outras (provavelmente em `extras.tsx` como `ChecklistInspecao5Estrelas`).

## Arquivo

Adicionar novo export em `src/pages/seo/extras.tsx` (mesmo padrão dos outros 10 posts do arquivo) usando `<SeoLandingLayout>`. Isso já garante automaticamente, sem código extra:

- Schema Article + FAQPage + BreadcrumbList + SoftwareApplication
- Open Graph article completo + Twitter Card
- Canonical `https://hub.mrflow.com.br/checklist-inspecao-5-estrelas-airbnb`
- robots index,follow (default)
- Header com logo Mr Flow + botão Entrar
- Footer institucional
- Fundo escuro com ShaderBackground + ciano da marca
- `datePublished="2026-01-15"` e `dateModified="2026-05-29"` (convenção do projeto)

## Conteúdo passado ao layout

- `title`: "Checklist Gratuito de Inspeção 5 Estrelas para Airbnb | Mr Flow Welcome Hub"
- `description`: texto da meta fornecido pelo usuário
- `eyebrow`: "Checklist gratuito"
- `h1`: "Checklist Gratuito de Inspeção 5 Estrelas para Airbnb"
- `intro`: subtítulo fornecido
- `sections`: 4 seções com o conteúdo solicitado
  1. "Por que avaliações negativas acontecem?" — 5 cards (Wi-Fi, limpeza, informações, check-in, comunicação) + estatística destacada
  2. "O que você encontrará neste checklist" — lista visual com 9 itens marcados com ✓
  3. "Ideal para" — 6 cards (Airbnb, Booking, casas de temporada, pousadas, flats, imóveis administrados)
  4. "Conheça o Mr Flow Welcome Hub" — explicação + grid de 7 recursos + botão "Conhecer o Welcome Hub" linkando para `/`
- `faq`: 6 perguntas fornecidas
- `internalLinks`: 5 links (`/guia-digital-airbnb`, `/manual-digital-airbnb`, `/guest-app-airbnb`, `/guia-do-hospede`, `/hub-de-boas-vindas`)

## CTA externo (diferencial desta página)

Diferente dos outros posts SEO, o CTA principal precisa apontar para o Gamma:
`https://gamma.app/docs/A-Inspecao-de-5-Estrelas-para-Aluguel-de-Temporada-kuztc01fc70npz6`

O `SeoLandingLayout` atual usa internamente `<Link to="/auth">` no botão do hero e no CTA final, sem prop para customizar. Para não quebrar as outras 24 páginas:

- **Mudança mínima em `SeoLandingLayout.tsx`**: adicionar duas props opcionais — `ctaHref?: string` e `ctaPrimary` já existe. Quando `ctaHref` for passado, renderizar `<a href={ctaHref} target="_blank" rel="noopener">` no botão do hero e no CTA final em vez de `<Link to="/auth">`. Comportamento atual permanece idêntico quando a prop não é informada.

Nesta página passamos `ctaPrimary="Baixar Checklist Gratuitamente"` e `ctaHref="https://gamma.app/docs/..."`.

## Mockup visual do checklist

Como hero visual, adicionar abaixo do botão um card decorativo (puro CSS, sem nova imagem) simulando uma prévia do checklist — cabeçalho, 4-5 linhas com checkbox ✓ e barras de texto, sombra/glow ciano — alinhado à estética glass + ciano já usada. Implementado dentro do `intro` (ReactNode) ou via prop opcional `heroAside` se necessário; preferência por embutir no `intro` para não tocar no layout compartilhado.

Reavaliando: o `intro` aparece acima do botão. Para colocar o mockup ao lado/abaixo sem mexer no layout, embutimos um `<div>` decorativo dentro do `intro` (ReactNode permite isso) ou aceitamos uma segunda alteração mínima no layout: prop opcional `heroAside?: ReactNode` renderizada à direita em `lg:`. Escolha: **embutir no `intro`** (zero impacto nas outras páginas).

## Sitemap

Adicionar `<url><loc>https://hub.mrflow.com.br/checklist-inspecao-5-estrelas-airbnb</loc></url>` em `public/sitemap.xml`.

## Versão

Bump em `public/version.json`.

## Arquivos tocados

- `src/pages/seo/extras.tsx` — novo export `ChecklistInspecao5EstrelasAirbnb`
- `src/App.tsx` — import lazy + `<Route>`
- `src/components/seo/SeoLandingLayout.tsx` — adicionar prop opcional `ctaHref` (retrocompatível)
- `public/sitemap.xml` — nova URL
- `public/version.json` — bump
