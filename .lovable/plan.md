# Excluir usuário (e workspace) no Super Admin

Adicionar exclusão direta na aba *Usuários* de `/admin`. Sem digitação de e-mail — apenas um `AlertDialog` simples de confirmação, com checkbox para também apagar o workspace.

## O que será feito

### 1. Nova edge function `supabase/functions/admin-delete-user/index.ts`
- CORS + valida JWT no código (padrão das outras admin functions).
- Confere `has_role(caller, 'super_admin')`.
- Body: `{ user_id: string, delete_workspace?: boolean }`.
- Bloqueia auto-exclusão (`caller.id === user_id` → 400).
- Lê `profiles.tenant_id` do alvo.
- `admin.auth.admin.deleteUser(user_id)` — cascateia `profiles`, `user_roles`, `onboarding_profiles`.
- Tenant:
  - `delete_workspace = true`: apaga em ordem (com service_role): `content_blocks` → `property_pages` → `property_details` → `property_images` → `guide_translations` → `property_slug_history` → `properties` → `tenant_api_keys` → `tenant_integrations` → `subscriptions` → `invitations` (do email) → `tenants`.
  - `delete_workspace = false`: apaga `tenants` somente se ficar órfão (sem `profiles` e sem `properties`); caso contrário mantém.
- Loga em `admin_action_log` (`action='delete_user'`, metadata com `tenant_id`, `delete_workspace`, `tenant_deleted`).
- Retorna `{ ok: true, tenant_deleted: boolean }`.

### 2. UI em `src/pages/SuperAdmin.tsx`
- Importar `Trash2` (lucide) e `Checkbox` (já existente em `@/components/ui/checkbox`).
- Estado: `deleteTarget: { id, email, tenant_name } | null`, `deleteWorkspace: boolean` (default `true`).
- Botão **Excluir** (variante `destructive` outline, ícone `Trash2`) na coluna *Ações* da linha, após "Definir senha". Ocultar quando `u.id === user?.id`.
- `AlertDialog` de confirmação:
  - Título: "Excluir usuário?"
  - Descrição: mostra e-mail e workspace; aviso de irreversibilidade.
  - `Checkbox` "Excluir também o workspace e todos os imóveis vinculados" (marcado por padrão).
  - Botões: "Cancelar" / "Excluir definitivamente" (destrutivo).
- On confirm: `supabase.functions.invoke("admin-delete-user", { body: { user_id, delete_workspace } })`. Toast de sucesso (indica se workspace foi removido). Invalida queries `users-search` e `tenants-search`.

### 3. Sem migração de banco
Nenhuma alteração de schema. Cascades existentes em `auth.users` cuidam de `profiles`, `user_roles`, `onboarding_profiles`. A função usa service_role para os deletes do tenant, ignorando RLS.

## Detalhes técnicos
- Novo: `supabase/functions/admin-delete-user/index.ts` (mesmo padrão de `admin-set-user-password`).
- Edits: `src/pages/SuperAdmin.tsx` (botão + dialog + handler + invalidação).
- Auditoria em `admin_action_log` (RLS já permite super_admin inserir/ler).
