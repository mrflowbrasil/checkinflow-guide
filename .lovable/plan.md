## Objetivo
Injetar a tag GA4 `G-C0F1061BBE` no projeto e garantir rastreamento de pageviews em todas as rotas (incluindo navegação SPA do react-router-dom).

## Alterações propostas

### 1. Injetar script gtag.js no `index.html`
No `<head>`, adicionar:
- Script `async` para `https://www.googletagmanager.com/gtag/js?id=G-C0F1061BBE`
- Bloco inline `gtag('js', new Date())` + `gtag('config', 'G-C0F1061BBE')`

### 2. Declarar tipos globais do gtag
Adicionar em `src/vite-env.d.ts` (ou `src/types/gtag.d.ts`) as declarações `Window.dataLayer` e `Window.gtag` para evitar erros de TypeScript.

### 3. Criar componente `GoogleAnalyticsTracker`
Novo arquivo `src/components/analytics/GoogleAnalyticsTracker.tsx`:
- Usa `useLocation` do react-router-dom.
- Em `useEffect`, dispara `gtag('event', 'page_view', ...)` sempre que `location.pathname` muda.
- Envia `page_path`, `page_location` e `page_title`.

### 4. Integrar no `App.tsx`
Montar `<GoogleAnalyticsTracker />` dentro do `<BrowserRouter>` (antes ou junto às rotas) para que `useLocation` funcione corretamente.

## Resultado esperado
- Tag GA4 carregada em todas as páginas via `index.html`.
- Pageviews automáticos em navegações SPA.
- Sem erros de TypeScript.
- Sem dependências externas adicionais.