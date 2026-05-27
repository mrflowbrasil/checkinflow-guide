Inserir o código do Google Tag Manager fornecido pelo usuário no arquivo `index.html`:

1. **<head>** — Adicionar o script do GTM logo após o `<meta charset>`, como recomenda o Google. O script compartilha a mesma `dataLayer` já utilizada pelo GA4 existente.
2. **<body>** — Adicionar o `<noscript>` com iframe do GTM imediatamente após a abertura da tag `<body>`, antes de todo o conteúdo da página.
3. **version.json** — Incrementar a versão (padrão do projeto).

O preconnect para `googletagmanager.com` já existe no `<head>`, então nenhuma alteração adicional de performance é necessária.