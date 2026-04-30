## Problema

Quando o link de convite é compartilhado em apps como WhatsApp/Telegram, o preview mostra a marca **Lovable** ("Build for the web 20x faster") em vez da identidade do **Mr Flow Welcome Hub**.

Há **duas causas distintas** atuando ao mesmo tempo:

### 1. Domínio errado no link compartilhado
O link da imagem usa `007ed216-cdf8-4b08-a3dc-f2ec2c83a0a2.lovableproject.com` — este é o **domínio sandbox de preview da Lovable**, que serve metadados genéricos da Lovable para crawlers de redes sociais (independentemente do que está no `index.html` do projeto).

Os links de convite precisam ser gerados com o **domínio publicado**: `https://hub.mrflow.com.br/invite/{token}` (ou `https://checkinflow-guide.lovable.app/invite/{token}` como fallback).

### 2. Meta tags com texto/autor genéricos
No `index.html` atual:
- `<meta name="author" content="Lovable" />`
- `<meta name="twitter:site" content="@Lovable" />`
- Description em inglês: "GuestFlow Hub is a mobile-first SaaS platform..."

Esses precisam ser atualizados para Mr Flow / Welcome Hub em português.

---

## Plano de Correção

### Passo 1 — Atualizar meta tags em `index.html`

Trocar para identidade Mr Flow:
- `author` → `Mr Flow`
- `twitter:site` → `@mrflow` (ou remover se não houver perfil)
- `description` (e `og:description`/`twitter:description`) → texto em português alinhado à marca, ex: *"Welcome Hub by Mr Flow — encante seu hóspede com um guia digital completo da sua hospedagem."*
- Manter `og:title` / `twitter:title` como `"Mr Flow • Welcome Hub"` (mais claro que "Hub de Boas Vindas")
- Manter a `og:image` atual (logo Welcome Hub) — já está correta

### Passo 2 — Garantir que o link de convite use o domínio correto

Investigar onde o link `https://.../invite/{token}` é gerado/copiado no painel admin (provavelmente em `src/pages/SuperAdmin.tsx` onde os convites são criados/listados) e garantir que ele use:

```text
https://hub.mrflow.com.br/invite/{token}
```

em vez de `window.location.origin` (que no preview/sandbox retorna o domínio `lovableproject.com`).

Estratégia recomendada: criar uma constante `PUBLIC_APP_URL` que prioriza o domínio customizado. Ex:

```ts
const PUBLIC_APP_URL = "https://hub.mrflow.com.br";
const inviteLink = `${PUBLIC_APP_URL}/invite/${token}`;
```

### Passo 3 — Validar

Após publicar, testar colando o link `https://hub.mrflow.com.br/invite/{token}` no WhatsApp e validar o preview correto. Crawlers podem cachear previews antigos — se necessário, usar o [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) para forçar re-scrape.

---

## Detalhes técnicos

**Arquivos a editar:**
- `index.html` — atualizar meta tags (autor, descrições, twitter:site, título OG)
- `src/pages/SuperAdmin.tsx` (a confirmar na implementação) — trocar `window.location.origin` por constante com domínio público nos pontos onde o link de convite é montado/copiado

**Importante:** O preview que aparece em apps de mensagem é controlado pelo HTML servido na URL específica. O domínio `*.lovableproject.com` (sandbox) **sempre** mostra metadados da Lovable — é por isso que o link precisa apontar para `hub.mrflow.com.br`.
