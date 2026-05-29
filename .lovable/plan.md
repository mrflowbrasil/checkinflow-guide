## Objetivo

Garantir que GTM e GA4 só sejam carregados/disparados quando `window.location.hostname === "hub.mrflow.com.br"`. Em qualquer outro host (preview do Lovable, `*.lovable.app`, `localhost`, dev/staging), nada deve ser inicializado nem enviado.

Escopo: apenas GTM e GA4. Meta Pixel fica como está (não foi pedido).

## Mudanças

### 1) `index.html` — gate dos scripts inline

Envolver os dois blocos abaixo num único `if (window.location.hostname === "hub.mrflow.com.br") { ... }` para que nada seja injetado fora do domínio oficial:

- Bloco `Google Tag Manager` (snippet inline que injeta `gtm.js`).
- Bloco `Google Analytics 4`: tanto o `<script async src="...gtag/js?id=G-C0F1061BBE">` (criar via `document.createElement` dentro do guard) quanto o snippet inline com `gtag('js', ...)` e `gtag('config', ...)`.

Também envolver o `<noscript>` do GTM no `<body>` com um pequeno script que só insere o `<iframe>` quando o hostname bate (já que `<noscript>` puro não pode ser condicionado, removeremos o iframe via JS quando o host não for o oficial — ou inseri-lo via JS apenas quando for; optaremos por inserir via JS no host correto).

O `<noscript>` do Meta Pixel permanece inalterado.

### 2) `src/components/analytics/GoogleAnalyticsTracker.tsx` — gate do `page_view`

Adicionar early-return quando `window.location.hostname !== "hub.mrflow.com.br"`, evitando enviar `page_view` em SPA navigation em previews/dev. O check de `typeof window.gtag === "function"` já existe, mas reforçamos com o host para defesa em profundidade.

### 3) Sem mudanças em

- `MetaPixelTracker.tsx` (fora de escopo).
- `src/App.tsx` (os componentes continuam montados; eles é que decidem se disparam).
- Variáveis de ambiente / config Supabase / rotas.

## Como a regra fica

```js
const isProdHost =
  typeof window !== "undefined" &&
  window.location.hostname === "hub.mrflow.com.br";
```

- `hub.mrflow.com.br` → carrega GTM + GA4 e dispara `page_view` por rota.
- Qualquer outro hostname (incluindo `id-preview--*.lovable.app`, `*.lovable.app`, `localhost`, `127.0.0.1`, staging) → nenhum script é injetado e nenhum evento é enviado.

Funciona em todas as rotas da SPA (`/`, `/auth`, landing pages, `/app/*`, `/g/:slug`, etc.) porque:
- O guard em `index.html` decide o carregamento uma vez no boot.
- O `GoogleAnalyticsTracker` está montado no `App` acima das `Routes` e roda em toda navegação client-side, com o mesmo guard de hostname.

## Confirmação pós-implementação

Ao final, vou confirmar exatamente:
- `index.html`: blocos GTM (`<script>` inline do head), GA4 (`<script async ...gtag/js>` + snippet `gtag('config', ...)`) e `<noscript>` do GTM no body — todos passam a depender do hostname.
- `src/components/analytics/GoogleAnalyticsTracker.tsx`: early-return adicional baseado no hostname.