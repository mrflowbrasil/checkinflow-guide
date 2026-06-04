## Objetivo
Remover a confirmação de email no cadastro. O usuário cria a conta e já pode entrar imediatamente com email+senha (sem precisar clicar em link no email).

## Mudanças

### 1. Backend (Lovable Cloud / Auth)
- Ativar `auto_confirm_email = true` via `supabase--configure_auth`.
  - Efeito: novos usuários nascem com `email_confirmed_at` preenchido, sem envio de email de confirmação e sem bloqueio no login.
  - Mantém `disable_signup = false`, `external_anonymous_users_enabled = false`, `password_hibp_enabled = false` (já desativado).

### 2. Frontend (`src/pages/Auth.tsx`)
- No `handleSignUp`, após sucesso:
  - Trocar o toast atual ("Conta criada! Verifique seu email...") por:
    - `toast.success("Conta criada com sucesso! Faça login com seu email e senha para continuar.")`
  - Continuar trocando para a aba "signin" (`setTab("signin")`).
  - Não fazer login automático — o usuário digita novamente email/senha conforme pedido.
- Manter a mitigação de "sucesso silencioso" (checar `data.user.identities.length === 0`) para emails problemáticos como o caso `supercelular.com.br`, exibindo erro em português.

## Observações
- Templates de email de signup (`supabase/functions/_shared/email-templates/signup.tsx`) e o hook continuam existindo, mas não serão mais disparados para confirmação de cadastro. Recuperação de senha (`recovery`) continua funcionando normalmente.
- Usuários já cadastrados e ainda não confirmados (ex.: `acesso@mrflow.com.br`) precisarão ser confirmados manualmente se quiserem entrar — posso fazer isso via migration/SQL se você quiser (me avise).
