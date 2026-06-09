## Objetivo
Permitir que o cliente envie sugestões a partir da tela de edição da propriedade. Um aviso/CTA abre um modal com nome, e-mail e texto livre; o envio dispara o webhook já cadastrado no provider `onboarding` com `tipo: "sugestao"`.

## Onde aparece
Em `src/pages/dashboard/PropertyDetail.tsx`, no cabeçalho da seção "Páginas do guia" (área destacada em verde no print), alinhado à direita do título:

- Texto sutil: **"Sentiu falta de algo? Envie sua sugestão pra gente!"**
- Botão `variant="outline"` com ícone (lucide `MessageSquarePlus`): **"Enviar sugestão"**

Em telas pequenas o bloco quebra abaixo do título.

## Modal (novo componente `SuggestionDialog.tsx` em `src/components/property/`)
Campos:
- **Nome** (`Input`, obrigatório, 2–80 chars) — pré-preenchido com `profile.full_name` quando disponível.
- **E-mail** (`Input type="email"`, obrigatório, validado) — pré-preenchido com o e-mail do usuário logado.
- **Sugestão** (`Textarea`, obrigatório, 5–2000 chars, rows=5).

Validação com `zod` no client. Botões: Cancelar / Enviar (com loading).
Após sucesso: `toast.success("Sugestão enviada! Nosso time irá avaliar e, caso aprovada, a implementação será feita em poucos dias.")` e fecha o modal.

## Backend — nova edge function `suggestion-submit`
Arquivo: `supabase/functions/suggestion-submit/index.ts`.

- `verify_jwt` default (true) — exige usuário autenticado.
- Valida body com zod (`name`, `email`, `message`).
- Resolve `user_id`, `tenant_id`, `full_name` via service role (mesmo padrão de `onboarding-submit`).
- Busca `integration_webhooks` onde `provider = 'onboarding'` e `is_active = true`.
- Faz `POST` no `webhook_url` com payload:
  ```json
  {
    "tipo": "sugestao",
    "user_id": "...",
    "tenant_id": "...",
    "auth_email": "<email do auth>",
    "full_name": "<profiles.full_name>",
    "name": "<campo do form>",
    "email": "<campo do form>",
    "message": "<campo do form>",
    "submitted_at": "<ISO>"
  }
  ```
- Responde `{ ok: true }`. Não persiste em tabela (não é solicitado).

Cliente chama via `supabase.functions.invoke("suggestion-submit", { body: {...} })`.

## Arquivos
- **Criar:** `supabase/functions/suggestion-submit/index.ts`
- **Criar:** `src/components/property/SuggestionDialog.tsx`
- **Editar:** `src/pages/dashboard/PropertyDetail.tsx` (cabeçalho da seção "Páginas do guia" + estado open do dialog)

## Fora de escopo
- Nova tabela para armazenar sugestões (apenas webhook, como pedido).
- Mudança no provider `onboarding` ou criação de provider novo.
