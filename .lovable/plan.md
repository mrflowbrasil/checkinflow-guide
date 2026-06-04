## Objetivo

Quando um usuário cria conta mas não cadastra nenhum imóvel em 24h, disparar automaticamente:
1. Um **email** lembrando-o de cadastrar o primeiro imóvel — agora incluindo o **vídeo do YouTube** "criar imóvel em menos de 5 minutos"
2. Uma chamada ao **webhook de Onboarding** com `tipo: "primeiro-imovel"`

Também adicionar `tipo: "onboarding"` ao payload do webhook já enviado em `onboarding-submit`.

---

## Como inserir o vídeo do YouTube no email

Clientes de email (Gmail, Outlook, Apple Mail) **não executam `<iframe>`/`<video>`**. O padrão é usar uma **thumbnail clicável** que abre o YouTube em nova aba.

Implementação no template:
```tsx
<Link href="https://youtu.be/<VIDEO_ID>">
  <div style={{ position: 'relative' }}>
    <Img
      src="https://img.youtube.com/vi/<VIDEO_ID>/maxresdefault.jpg"
      width="560" alt="Veja como criar seu imóvel em menos de 5 minutos"
      style={{ borderRadius: 12, display: 'block' }}
    />
    {/* play button overlay via Img absoluto */}
  </div>
</Link>
```
Confirmação necessária: **qual é o ID/URL do vídeo do YouTube?**

---

## Arquitetura

```text
auth.users (created_at)
        │ 24h depois, tenant sem properties
        ▼
pg_cron (a cada 15min)  ──►  edge function `first-property-reminder`
                                  ├─► send-transactional-email (template com thumb YouTube)
                                  ├─► POST webhook onboarding (tipo=primeiro-imovel)
                                  └─► insert em first_property_reminders (idempotência)
```

---

## Passos

### 1. Infra de email (pré-requisito)
- `setup_email_infra` + `scaffold_transactional_email` para criar fila, `send-transactional-email`, página de unsubscribe.

### 2. Template `first-property-reminder.tsx`
- PT-BR, tom amigável, brand Mr Flow.
- **Thumbnail do YouTube clicável** (link para `https://youtu.be/<ID>`) com play button sobreposto.
- CTA principal: "Cadastrar meu primeiro imóvel" → `https://hub.mrflow.com.br/app/properties/new`.
- Registrar em `registry.ts`.

### 3. Migration: tabela de controle
```sql
CREATE TABLE public.first_property_reminders (
  user_id uuid PRIMARY KEY,
  sent_at timestamptz NOT NULL DEFAULT now(),
  email_status text,
  webhook_status text
);
GRANT ALL ON public.first_property_reminders TO service_role;
ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
-- sem policies para anon/authenticated
```

### 4. Edge function `first-property-reminder` (verify_jwt=false)
1. Buscar `auth.users` com `created_at` entre **agora-7d** e **agora-24h** (janela curta evita backfill enorme).
2. Filtrar quem não está em `first_property_reminders` e não é `super_admin`.
3. Para cada user, contar `properties` do `tenant_id` (via `profiles`). Se = 0:
   - Invocar `send-transactional-email` (idempotencyKey `first-prop-${user.id}`).
   - POST webhook `provider='onboarding'` com `tipo: "primeiro-imovel"`, `user_id`, `email`, `full_name`, `created_at`.
   - Insert em `first_property_reminders`.
4. Lote máx. 50/execução.

### 5. Atualizar `onboarding-submit`
- Adicionar `tipo: "onboarding"` ao payload do webhook (linha ~107).

### 6. Cron job (via `supabase--insert`, não migration — contém anon key)
```sql
select cron.schedule(
  'first-property-reminder', '*/15 * * * *',
  $$ select net.http_post(
       url := 'https://<project>.supabase.co/functions/v1/first-property-reminder',
       headers := '{"Content-Type":"application/json","apikey":"<ANON_KEY>"}'::jsonb,
       body := '{}'::jsonb
     ); $$
);
```

---

## Garantias de não-impacto

- **Idempotência**: tabela impede envio duplicado.
- **Janela 7d a partir do deploy**: usuários antigos **não** recebem retroativamente (evita "spray" no backlog).
- **Não bloqueia signup**: lógica roda fora do fluxo de cadastro.
- **Falhas isoladas**: email e webhook em try/catch independentes; status registrado.
- **Webhook existente intacto**: só ganha a chave `tipo`, sem mudar URL nem schema.

---

## Pontos a confirmar

1. **URL/ID do vídeo do YouTube** a embutir no email.
2. **Backfill**: confirmar que usuários criados antes do deploy **não** devem receber (recomendado).
3. **Critério "sem imóvel"**: zero properties no tenant do usuário (recomendado).
4. **Super admin**: excluir da régua (recomendado).
