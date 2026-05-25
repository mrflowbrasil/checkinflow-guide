## Objetivo

Adicionar uma nova aba **Usuários** no Super Admin que lista todos os usuários da plataforma e permite ao super admin enviar um link de redefinição de senha (por e-mail) para qualquer um deles. Útil para o caso do `alexandrebarbosamaciel@hotmail.com` e qualquer cliente que peça ajuda no futuro.

## Como funciona

A senha nunca é definida diretamente pelo admin (mesmo em Supabase isso exige Service Role e expõe risco de segurança). Em vez disso, o admin clica em **"Enviar link de redefinição"** e o usuário recebe um e-mail com link para escolher a nova senha — fluxo padrão e seguro.

## Mudanças

### 1. Edge Function `admin-list-users` (nova)
- `supabase/functions/admin-list-users/index.ts`
- Valida JWT do chamador, busca o user_id, confere se tem role `super_admin` via `has_role`.
- Se autorizado: usa `supabase.auth.admin.listUsers()` (Service Role) e retorna `[{ id, email, created_at, last_sign_in_at, tenant_name }]`.
- Faz join com `profiles` + `tenants` para incluir o nome do workspace de cada usuário.
- Suporta busca por e-mail via query param `?q=`.

### 2. Edge Function `admin-send-password-reset` (nova)
- `supabase/functions/admin-send-password-reset/index.ts`
- Valida JWT + role `super_admin`.
- Recebe `{ email }` no body.
- Chama `supabase.auth.admin.generateLink({ type: 'recovery', email, options: { redirectTo: '<APP_URL>/reset-password' } })` — isso dispara o e-mail de recovery pelo hook de auth-email já configurado, usando o template `recovery.tsx` existente.
- Retorna `{ ok: true }` ou erro.

### 3. UI: nova aba "Usuários" em `src/pages/SuperAdmin.tsx`
- Adiciona `<TabsTrigger value="users">Usuários</TabsTrigger>` na lista de tabs.
- Novo `TabsContent value="users"` com:
  - Campo de busca por e-mail (debounce 300ms).
  - Tabela: Email · Workspace · Criado em · Último acesso · Ações.
  - Botão por linha: **"Enviar link de redefinição"** (ícone `KeyRound`).
  - Ao clicar: `AlertDialog` de confirmação ("Enviar e-mail de redefinição de senha para X?") → invoca `admin-send-password-reset`.
  - Toast de sucesso/erro. Loader inline no botão durante o envio.
- Usa `useQuery` para carregar `supabase.functions.invoke('admin-list-users', { body: { q } })`.

### 4. Sem mudanças de banco
- Não precisa migration. As policies de `profiles` e `tenants` já permitem leitura para super_admin, e a edge function usa Service Role para listar `auth.users`.
- O template de e-mail `recovery` já existe em `supabase/functions/_shared/email-templates/recovery.tsx` e é disparado automaticamente pelo `auth-email-hook`.

## Arquivos afetados

- `supabase/functions/admin-list-users/index.ts` (novo)
- `supabase/functions/admin-send-password-reset/index.ts` (novo)
- `src/pages/SuperAdmin.tsx` (nova aba + lógica)

## Observação para o caso atual

Após implementado, no Super Admin → Usuários, basta buscar `alexandrebarbosamaciel@hotmail.com` e clicar em "Enviar link de redefinição". Ele recebe o e-mail e define `Abm@2026` (ou qualquer outra senha) pessoalmente — o que é o caminho correto e seguro.
