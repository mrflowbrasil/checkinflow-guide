
# Promoção a Super Admin + Orientação sobre Tenants

## 1. Pré-requisito: criar o usuário

O usuário `vitor@mrflow.com.br` **ainda não existe** no banco. A plataforma usa **self-signup**, então:

1. Acesse `/auth` na preview
2. Clique em "Criar conta"
3. Cadastre `vitor@mrflow.com.br` com a senha desejada
4. O sistema automaticamente cria:
   - 1 perfil (`profiles`)
   - 1 workspace/tenant (`tenants`) — chamado "Vitor's workspace"
   - 1 role `tenant_owner` ligando o usuário ao tenant

Me avise quando o cadastro estiver feito (ou confirme se quer usar o `vitor@supercelular.com.br` que já existe).

## 2. Promoção a Super Admin

Após o usuário existir, vou rodar um INSERT na tabela `user_roles`:

```sql
INSERT INTO public.user_roles (user_id, role, tenant_id)
SELECT id, 'super_admin', NULL FROM auth.users WHERE email = 'vitor@mrflow.com.br';
```

Isso dá acesso à rota `/admin` (Painel Super Admin), onde ele consegue:
- Ver todos os tenants cadastrados
- Ativar/desativar qualquer tenant
- Visualizar imóveis de qualquer tenant

## 3. Como tenants são criados (entender o modelo)

**Importante:** No MVP, **tenants NÃO são criados manualmente pelo Super Admin**. O modelo é **self-signup**:

```text
Cliente acessa /auth
       ↓
Faz signup (email + senha)
       ↓
Trigger handle_new_user() dispara automaticamente
       ↓
Cria: profile + tenant + role 'tenant_owner'
       ↓
Cliente entra em /app e começa a cadastrar imóveis
```

Cada usuário que se cadastra = 1 novo tenant (workspace isolado).

### O que o Super Admin faz em `/admin`?

- **Monitora** todos os tenants criados via signup
- **Bloqueia** tenants problemáticos (toggle `is_active`)
- **Audita** imóveis de qualquer cliente

### O que o Tenant Owner (cliente) faz em `/app`?

- Cadastra imóveis em `/app/properties/new`
- Edita o guia (blocos) em `/app/properties/:id/pages/:key`
- Personaliza branding em `/app/settings`
- Compartilha link público + QR Code com hóspedes

## 4. (Opcional — fase 2) Super Admin criar tenants manualmente

Se quiser que o Super Admin **crie tenants manualmente** (sem precisar do cliente fazer signup), posso adicionar em `/admin`:
- Botão "Novo Tenant"
- Form: nome do workspace + email do owner + senha temporária
- Edge function que cria o auth.user + tenant + role via service role key
- Email automático com credenciais pro cliente

Isso **não está no MVP atual**. Me diga se quer que eu inclua.

## Próximos passos

1. Você cria o usuário `vitor@mrflow.com.br` via `/auth`
2. Me avisa
3. Eu rodo o INSERT que promove a Super Admin
4. Você acessa `/admin` e vê o painel
