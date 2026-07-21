
## Contexto verificado

Os 4 workspaces (`sergio-lima`, `maria`, `fernando-araujo-pires`, `gerson-scheffer`) estão no plano `free` (Single, R$ 8,90/mês, 1 imóvel), com `is_active = true`, `plan_status = active`, sem registro em `subscriptions` (nunca pagaram) e cada um tem 1 imóvel cadastrado. Hoje o guia público deles está no ar porque **não existe mecanismo de trial no banco** — a coluna `plan_expires_at` fica nula para free e nada é checado em `is_property_active`.

## Parte 1 — Ação imediata nos 4 workspaces

Desativar apenas o link público, mantendo login no painel:

- Adicionar coluna `properties.public_disabled_reason text` (nullable) para deixar explícito o motivo (`trial_expired`) e permitir mensagem específica no `GuestGuide`.
- Atualizar `properties.status = 'inactive'` e `public_disabled_reason = 'trial_expired'` para os imóveis dos 4 tenants listados.
- Ajustar `is_property_active()` já cobre isso (checa `status = 'active'`), então o guia passará a exibir "link expirado".
- Ajustar `GuestLinkExpired.tsx` (ou o componente equivalente disparado pelo `GuestGuide`) para, quando `public_disabled_reason = 'trial_expired'`, mostrar uma mensagem específica: "O período de teste deste guia terminou. O anfitrião precisa reativar o plano para voltar ao ar."
- Login no painel do tenant continua funcionando (`tenants.is_active` permanece `true`), então cada dono pode pagar e reativar sem perder dados.

## Parte 2 — Regra de trial de 30 dias no sistema

### Esquema

- Adicionar em `public.tenants`:
  - `trial_started_at timestamptz` (default `now()`)
  - `trial_ends_at timestamptz` (default `now() + interval '30 days'`)
  - `trial_status text` default `'active'` — valores: `active`, `expired`, `converted`, `waived`.
- Backfill: para tenants existentes no plano `free` sem assinatura, preencher `trial_started_at = created_at` e `trial_ends_at = created_at + 30 days`. Se já expirou (created_at < now() - 30d), marcar `trial_status = 'expired'`.
- Tenants com `plan_code != 'free'` **ou** com `subscriptions.status IN ('active','trialing','past_due')` recebem `trial_status = 'converted'` e não são afetados.
- Super admins e `plan_code = 'launch'` recebem `trial_status = 'waived'`.

### Ativação/desativação automática

Função `public.enforce_trial_expiration()` (SECURITY DEFINER) que, para cada tenant com `trial_status = 'active' AND trial_ends_at < now() AND plan_code = 'free' AND` sem `subscription` ativa:
- Marca `trial_status = 'expired'`.
- Atualiza `properties` do tenant: `status = 'inactive'`, `public_disabled_reason = 'trial_expired'`.

Agendar via `pg_cron` para rodar 1x/dia (`0 3 * * *` — 03:00 UTC). Usar `supabase--insert` para o `cron.schedule` (contém URL/keys específicos do projeto — não vai para migration).

### Reativação automática ao pagar

No webhook `payments-webhook/index.ts`, quando `upsertSubscription` marca `plan_code` como `active/trialing/past_due`:
- Setar `tenants.trial_status = 'converted'`.
- Reativar imóveis: `UPDATE properties SET status = 'active', public_disabled_reason = NULL WHERE tenant_id = X AND public_disabled_reason = 'trial_expired'`.

### UI mínima (painel do tenant)

- Em `DashboardHome.tsx` (ou `AppShell`): banner amarelo quando `trial_status = 'active'` mostrando "Seu teste grátis termina em X dias" com CTA para `/app/billing`.
- Banner vermelho quando `trial_status = 'expired'`: "Seu teste terminou. Os links dos hóspedes estão offline até você ativar um plano."
- Expor `trial_ends_at` e `trial_status` no hook `useTenant`.

## Detalhes técnicos (para revisão)

- Migração 1 (schema): `ALTER TABLE properties ADD COLUMN public_disabled_reason text`; `ALTER TABLE tenants ADD COLUMN trial_started_at`, `trial_ends_at`, `trial_status`. Backfill inline no mesmo migration. Criar `enforce_trial_expiration()`.
- Migração 2 (data via insert tool): desativar os 4 imóveis específicos + backfill do trial status conforme regras acima.
- Migração 3 (via insert tool): `cron.schedule('enforce-trial-expiration', '0 3 * * *', ...)` chamando a função SQL diretamente (não precisa de edge function).
- Frontend: `useTenant` retorna novos campos; novo `TrialBanner.tsx`; atualização de `GuestLinkExpired` para variante `trial_expired`.
- Webhook: adicionar reativação de imóveis + `trial_status='converted'` em `payments-webhook`.

## Fora do escopo

- Não desativar login/painel dos tenants expirados (fica só o link público offline).
- Não enviar e-mails de aviso automáticos (pode ser proposto num próximo passo).
- Não mexer no plano `launch` nem em `pro/business/starter`.
