Sim, é totalmente possível. Basta inverter os componentes associados às rotas no React Router.

## Mudanças

**1. `src/App.tsx`** — inverter os elementos das rotas:
- `/` → `<WelcomeHubLanding />`
- `/welcome-hub` → `<Index />`

Antes:
```tsx
<Route path="/" element={<Index />} />
<Route path="/welcome-hub" element={<WelcomeHubLanding />} />
```

Depois:
```tsx
<Route path="/" element={<WelcomeHubLanding />} />
<Route path="/welcome-hub" element={<Index />} />
```

**2. Links internos** — varrer o código por `to="/welcome-hub"` / `href="/welcome-hub"` e por links que apontam para `/` esperando a home antiga, ajustando conforme a nova realidade (ex.: header, footer, logo, CTAs).

**3. SEO (`index.html` e tags Helmet, se houver)** — atualizar `canonical`, `og:url` e títulos para refletir que o WelcomeHub agora é a raiz `https://hub.mrflow.com.br/`, e a página antiga vive em `/welcome-hub`.

**4. `sitemap.xml` / `robots.txt`** — se existirem, atualizar as URLs.

## Observações

- URLs antigas (`/welcome-hub`) continuarão funcionando normalmente, só passarão a mostrar o conteúdo da antiga home — sem 404.
- Não precisa de redirect no servidor; o SPA fallback do Lovable já cuida.
- Se quiser que `/welcome-hub` redirecione para `/` (em vez de mostrar a antiga home), me avise — é só usar `<Navigate to="/" replace />` no lugar.

Posso aplicar?