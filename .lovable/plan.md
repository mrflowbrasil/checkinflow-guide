## Mini onboarding pós-cadastro

Capturar dados do perfil do cliente logo após criar a conta gratuita, salvar no banco e disparar um webhook configurável (para n8n → WhatsApp de boas-vindas).

### Comportamento (Opção B – obrigatório, mas pode pular)

- Após o primeiro login, se o cliente ainda não preencheu o onboarding, abre um **modal "Complete seu cadastro"** sobre o dashboard.
- Botões: **Concluir** (salva + dispara webhook + fecha) e **Pular por agora** (fecha sem salvar).
- Se pular: o modal reaparece nos próximos logins até ser preenchido. Não bloqueia o uso do app.
- Banner discreto no topo do dashboard com "Complete seu perfil" enquanto pendente.

### Formulário

Campos (todos obrigatórios para Concluir, exceto onde indicado):

1. **Estado** — `<Select>` com as 27 UFs brasileiras.
2. **Celular (WhatsApp)** — input com máscara `(99) 99999-9999`, validação E.164.
3. **Quantos imóveis você tem?** — `<Select>`: 1, 2–5, 6–10, 11–20, 21–50, 50+.
4. **Usa algum sistema (PMS)?** — `<Select>`: Stays, Hostaway, Hospedin, Omnibees, Cloudbeds, Hsystem, Outros, Nenhum.
   - Se **Outros** → aparece input "Qual sistema?" (texto livre, obrigatório).

### Persistência (Opção A – banco + webhook)

Nova tabela `onboarding_profiles`:
- `user_id` (PK, FK lógica para auth.users)
- `tenant_id`
- `state` (UF, 2 chars)
- `whatsapp` (texto)
- `properties_count` (texto, ex: "2-5")
- `pms` (texto)
- `pms_other` (texto, nullable)
- `completed_at`, `created_at`, `updated_at`

RLS:
- Usuário lê/insere/atualiza apenas seu próprio registro (`user_id = auth.uid()`).
- Super admin acessa tudo.

### Webhook (Opção A – mesma seção de Webhooks de integração)

- Adicionar uma linha `provider = 'onboarding'` em `integration_webhooks` (seed via migration).
- Aparece automaticamente no painel **Super Admin → Webhooks de integração** já existente (`WebhooksAdmin.tsx`), sem precisar criar UI nova.
- Edge function `onboarding-submit`:
  1. Valida JWT do usuário.
  2. Valida payload com zod.
  3. Faz `upsert` em `onboarding_profiles`.
  4. Busca a URL ativa do provider `onboarding` e dispara POST com:
     ```json
     {
       "user_id", "tenant_id", "email", "full_name",
       "state", "whatsapp", "properties_count", "pms", "pms_other",
       "completed_at"
     }
     ```
  5. Falha de webhook **não** bloqueia o usuário (log apenas); resposta ao front é sucesso assim que o banco salva.

### Arquivos a criar/editar

**Novos:**
- `supabase/functions/onboarding-submit/index.ts` — edge function (valida JWT, upsert, dispara webhook).
- `src/components/onboarding/CompleteProfileDialog.tsx` — modal com formulário (react-hook-form + zod).
- `src/hooks/useOnboardingStatus.tsx` — query que verifica se o usuário já completou.

**Editados:**
- `src/components/layout/AppShell.tsx` — montar o dialog + banner quando pendente.
- Migration: criar `onboarding_profiles` + RLS + seed do provider `onboarding` em `integration_webhooks`.

### Fluxo técnico resumido

```text
Login → AppShell monta
      → useOnboardingStatus consulta onboarding_profiles
      → se vazio: abre CompleteProfileDialog (com botão "Pular")
      → Concluir → POST /onboarding-submit
                 → upsert banco
                 → POST webhook (n8n) em background
                 → fecha modal, invalida query
```

### Configuração no admin

Super Admin → aba Webhooks → linha "onboarding" → cola URL do n8n → ativa. Pronto.
