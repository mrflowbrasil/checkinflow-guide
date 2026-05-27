## Objetivo
Instalar o Meta Pixel (Facebook) com ID `1411641184313501` no projeto e garantir rastreamento de PageView em todas as rotas SPA.

## Alterações propostas

### 1. Injetar script Meta Pixel no `index.html`
No `<head>`, adicionar o script base do `fbevents.js` e chamada `fbq('init', '1411641184313501')`.
No `<body>`, adicionar a tag `<noscript><img ... /></noscript>` de fallback.

### 2. Declarar tipos globais do fbq
Adicionar em `src/vite-env.d.ts` a declaração `Window.fbq` para evitar erros de TypeScript.

### 3. Criar componente `MetaPixelTracker`
Novo arquivo `src/components/analytics/MetaPixelTracker.tsx`:
- Usa `useLocation` do react-router-dom.
- Em `useEffect`, dispara `fbq('track', 'PageView')` sempre que `location.pathname` muda.

### 4. Integrar no `App.tsx`
Montar `<MetaPixelTracker />` junto ao `<GoogleAnalyticsTracker />` dentro do `<BrowserRouter>`.

## Resultado esperado
- Meta Pixel carregado em todas as páginas via `index.html`.
- PageViews automáticos em navegações SPA.
- Sem erros de TypeScript.
- Sem dependências externas adicionais.