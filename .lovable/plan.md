# Causa raiz definitiva

A migration `20260523203136` removeu **todas** as políticas `SELECT` em `storage.objects` (Public read storage, tenant logos, email-assets) e nunca criou substituta para `authenticated`.

O Supabase SDK chama upload como `INSERT ... ON CONFLICT DO UPDATE RETURNING *`. O `RETURNING *` exige permissão de `SELECT` via RLS sobre a linha recém-inserida. Sem nenhuma política SELECT que cubra o objeto, o Postgres aborta com `42501 / new row violates row-level security policy` — mesmo a INSERT WITH CHECK passando.

Por isso o erro só surgiu agora, e por isso aparece como se fosse falha de upload — o objeto até seria gravado, mas o `RETURNING` é bloqueado.

Confirmado nos logs do storage:
```
"code":"42501", "originalError":{"routine":"ExecWithCheckOptions"},
"query":"insert into \"objects\" ... on conflict ... do update ... returning *"
```

E em `pg_policies`: zero policies com `cmd='SELECT'` em `storage.objects`.

# Plano

## 1. Migration corretiva
Restaurar políticas SELECT em `storage.objects` cobrindo os buckets de tenant e os públicos, sem reabrir listagem indevida:

- **SELECT autenticado tenant-scoped** (`property-covers`, `property-gallery`, `block-media`, `tenant-logos`) — permite ler quando o primeiro segmento do path é o `current_tenant_id()` do usuário, ou quando o usuário é `super_admin`. Cobre o `RETURNING *` do upload.
- **SELECT público em `email-assets`** — bucket de assets de e-mail, precisa ser legível por anon para os templates.
- Manter buckets `property-covers` e `property-gallery` como `public:true` (já são); URLs públicas continuam funcionando via endpoint `/object/public/*` sem depender de RLS.

## 2. Validação
- Criar uma nova propriedade com imagem de capa.
- Confirmar `status 200` no `POST /storage/v1/object/property-covers/...`.
- Confirmar criação do registro em `properties` + 24 páginas padrão.

## Arquivos
- novo: `supabase/migrations/<timestamp>_restore_storage_select_policies.sql`
- nenhuma alteração no frontend.
