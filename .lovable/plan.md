
# Plano: Acesso por Convite + Planos Pagos com Stripe

Vamos construir em **3 fases** independentes, cada uma entregando valor sozinha. Você pode aprovar e implementar tudo de uma vez ou em etapas.

---

## Fase 1 — Fechar signup + Sistema de convites (acesso gratuito)

**Objetivo:** apenas pessoas que você convida podem criar conta. Você gerencia tudo pelo Super Admin.

### O que muda no banco
- Nova tabela `invitations` com: `email`, `token` (UUID único), `plan_code` (qual plano vai receber), `invited_by`, `expires_at`, `accepted_at`, `status`.
- Nova tabela `subscription_plans` (catálogo dos planos): `code` (free/starter/pro/business), `name`, `property_limit`, `stripe_price_id`, `price_cents`, `is_active`.
- Nova coluna `tenants.plan_code` (default `free`) e `tenants.plan_status` (`trialing`/`active`/`past_due`/`canceled`).
- Atualizar `handle_new_user()`: se houver convite válido para o email, marca o convite como aceito e aplica o `plan_code` do convite ao tenant. Se **não houver convite**, bloqueia o cadastro (lança exceção).

### O que muda na UI
- **Página `/auth`**: remover aba "Cadastro". Adicionar nova rota `/invite/:token` que aceita o convite, valida (não expirado, não usado), e mostra formulário de signup pré-preenchido com o email do convite.
- **Super Admin** (`/app/super-admin`):
  - Nova aba/seção "Convites": formulário para enviar convite (email + plano) + lista de convites pendentes/aceitos com opção de revogar/reenviar.
  - Card existente de workspaces ganha coluna **Plano** e ação para **alterar plano manualmente** (cortesia, downgrade, etc).
- **Email do convite**: enviado via edge function usando **Lovable Emails** (built-in, sem precisar configurar Resend) com link `https://hub.mrflow.com.br/invite/{token}`.

### Edge Function
- `send-invitation`: gera token, insere em `invitations`, envia email com o link.

---

## Fase 2 — Limite de imóveis por plano

**Objetivo:** cada plano tem um teto de imóveis. Cliente não consegue criar além do limite.

### Planos sugeridos (você ajusta os valores depois)

| Código | Nome | Limite de imóveis | Preço (a definir) |
|--------|------|-------------------|--------------------|
| `free` | Free (cortesia) | 1 | R$ 0 |
| `starter` | Starter | 5 | a definir |
| `pro` | Pro | 20 | a definir |
| `business` | Business | Ilimitado (999) | a definir |

### Onde aplica
- **`PropertyNew.tsx`**: antes de inserir, conta imóveis do tenant e compara com `property_limit` do plano. Se atingiu, mostra modal "Você atingiu o limite do plano [X]. Faça upgrade para adicionar mais imóveis." com botão para ir à página de Billing.
- **`PropertiesList.tsx`**: mostra contador "3 / 5 imóveis (Plano Starter)" no topo. Botão "Novo imóvel" desabilitado quando atingido o limite.
- **Função SQL** `tenant_property_count(tenant_id)` para evitar bypass via API.
- **Trigger SQL** `before insert on properties`: verifica limite no servidor (segurança real, não só UI).

---

## Fase 3 — Pagamento com Stripe (built-in Lovable)

**Objetivo:** cliente que recebeu convite com plano pago precisa pagar para ativar. Cliente Free pode fazer upgrade.

### Setup
1. Habilitar **Stripe payments built-in** (sem precisar criar conta Stripe externa — Lovable cuida).
2. Criar 3 produtos no Stripe (Starter, Pro, Business) — cada um com preço mensal. Usaremos `batch_create_product`.
3. Salvar `stripe_price_id` na tabela `subscription_plans`.

### Fluxo de checkout
- **Nova página `/app/billing`**:
  - Mostra plano atual + status da assinatura.
  - Se `free` ou expirado: cards dos 3 planos pagos com botão "Assinar".
  - Se pago ativo: botão "Gerenciar assinatura" → abre Customer Portal do Stripe.
- **Edge function `create-checkout`**: cria sessão de checkout Stripe para o `price_id` escolhido, com `success_url=/app/billing?success=1`.
- **Edge function `create-portal`**: abre portal do Stripe (cancelar/trocar plano/atualizar cartão).
- **Edge function `stripe-webhook`** (verify_jwt=false): escuta eventos:
  - `checkout.session.completed` → atualiza `tenants.plan_code` e `plan_status='active'`, salva `stripe_customer_id` e `stripe_subscription_id`.
  - `customer.subscription.updated` → atualiza status.
  - `customer.subscription.deleted` → volta tenant para `plan_code='free'`, `plan_status='canceled'`.
  - `invoice.payment_failed` → marca `plan_status='past_due'`.

### Bloqueio quando inadimplente
- Se `plan_status='past_due'` por mais de X dias OU `canceled` E excede limite Free: tenant continua ativo mas **bloqueia criar/editar imóveis** com banner "Sua assinatura expirou. Regularize para voltar a editar."
- Imóveis publicados continuam acessíveis ao público (não derrubamos o serviço dos hóspedes).

---

## Detalhes técnicos

### Schema novo (resumo SQL)
```sql
-- catálogo de planos
create table subscription_plans (
  code text primary key,            -- free, starter, pro, business
  name text not null,
  property_limit int not null,
  price_cents int not null default 0,
  stripe_price_id text,
  is_active boolean default true
);

-- convites
create table invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token uuid not null unique default gen_random_uuid(),
  plan_code text references subscription_plans(code) default 'free',
  invited_by uuid references auth.users(id),
  expires_at timestamptz default now() + interval '7 days',
  accepted_at timestamptz,
  created_at timestamptz default now()
);

-- extensões em tenants
alter table tenants
  add column plan_code text references subscription_plans(code) default 'free',
  add column plan_status text default 'active',  -- active|trialing|past_due|canceled
  add column stripe_customer_id text,
  add column stripe_subscription_id text,
  add column plan_expires_at timestamptz;
```

### RLS
- `subscription_plans`: leitura pública (`SELECT` para `anon`).
- `invitations`: super admin gerencia tudo; usuário anônimo lê só pelo token (necessário para `/invite/:token` funcionar antes do login).

### Roteamento
- `/invite/:token` — pública, fora do guard de auth.
- `/app/billing` — autenticada, dentro do dashboard.
- `/app/super-admin` ganha aba "Convites".

### Ordem de implementação sugerida
1. Migration (planos + convites + colunas em tenants) + seed dos 4 planos.
2. Atualizar `handle_new_user()` para exigir convite.
3. UI de convites no Super Admin + edge function de envio.
4. Página `/invite/:token`.
5. Limite de imóveis (UI + trigger SQL).
6. Habilitar Stripe + criar produtos.
7. Página `/app/billing` + edge functions de checkout/portal/webhook.

---

## O que **não** vamos fazer agora (deixar para depois)
- Cobrança anual com desconto.
- Trial gratuito de 14 dias (podemos adicionar depois — basta marcar `plan_status='trialing'` e `plan_expires_at`).
- Cupons de desconto.
- Multi-usuário por workspace (hoje 1 dono por tenant).
- Notificações de cobrança falhada por email.

Posso adicionar qualquer um desses depois sem refazer o que construirmos agora.

---

**Pode aprovar?** Se quiser que eu faça apenas a **Fase 1 primeiro** (convites + signup fechado), me avise — assim você já consegue liberar acesso aos primeiros clientes hoje, e implementamos pagamento depois quando os planos estiverem definidos com valores.
