
## Diagnóstico do caso (alexandrebarbosamaciel@hotmail.com)

Verifiquei o `email_send_log` e os logs de auth:

- **3 e-mails de recovery enviados com sucesso** nas últimas horas (status `sent`, sem erros).
- **Sem registro na lista de supressão** (`suppressed_emails` vazio).
- O hook Lovable Emails respondeu `200` em todas as tentativas.

**Conclusão:** o problema **não está no nosso sistema** — os e-mails saíram normalmente. O Hotmail/Outlook está classificando como spam ou bloqueando na entrada. Causas comuns:
1. Cliente não checou **Lixo Eletrônico / Spam / Outros**.
2. Hotmail/Outlook bloqueia agressivamente domínios novos sem reputação.
3. Filtro corporativo / antivírus do cliente.

## LGPD — pode o admin alterar a senha?

**Pode**, desde que com salvaguardas:

| Requisito LGPD | Implementação |
|---|---|
| Base legal | Execução de contrato / suporte ao titular |
| Finalidade específica | Restrita a casos de falha de entrega de e-mail |
| Registro/auditoria | Tabela `admin_action_log` (quem, quando, qual usuário, motivo) |
| Comunicação ao titular | E-mail automático informando que a senha foi alterada pelo suporte |
| Princípio da segurança | Senha temporária + força troca no próximo login |

A prática é aceitável como **fallback excepcional**, não como rotina.

## Plano de implementação

### 1. Diagnóstico (orientação imediata ao cliente)
Pedir ao cliente para:
- Checar pastas **Lixo Eletrônico**, **Outros** e **Promoções** no Outlook/Hotmail
- Adicionar `notify@hub.mrflow.com.br` (ou domínio remetente atual) aos **Contatos Seguros**
- Tentar redefinir novamente

### 2. Auditoria no banco

Nova tabela `admin_action_log` para registrar toda ação sensível do Super Admin:

```
id, admin_user_id, action ('password_set' | 'password_reset_sent' | ...),
target_user_id, target_email, reason, metadata jsonb, created_at
```

Com RLS: somente `super_admin` pode ler/inserir.

### 3. Edge function `admin-set-user-password`

Nova função em `supabase/functions/admin-set-user-password/index.ts`:

- Valida que o caller é `super_admin` (mesmo padrão de `admin-send-password-reset`).
- Recebe `{ userId, email, password, reason }`.
- Valida senha: mínimo 8 caracteres, com pelo menos 1 letra e 1 número.
- **Exige `reason` obrigatório** (mínimo 10 caracteres).
- Chama `admin.auth.admin.updateUserById(userId, { password })`.
- **Notifica o titular**: dispara um e-mail "Sua senha foi alterada pelo suporte" via `enqueue_email` (queue `transactional_emails`) ou, na ausência, via `resetPasswordForEmail` como fallback informativo.
- Registra em `admin_action_log` com `action='password_set'`, `reason`, IP do admin.
- Retorna `{ ok: true }`.

### 4. UI no Super Admin → aba Usuários

Para cada usuário, ao lado de "Redefinir senha" (atual), adicionar botão **"Definir senha temporária"** (ícone `KeyRound` ou `Lock`, variante `outline` com tom destrutivo sutil).

Ao clicar, abre `AlertDialog` com:
- Aviso LGPD explícito ("Use somente como fallback. O titular será notificado por e-mail.").
- Campo **Nova senha** (com botão "Gerar senha aleatória").
- Campo **Motivo** (obrigatório, textarea — ex.: "Cliente não recebe e-mail de redefinição").
- Confirmação dupla: checkbox "Confirmo que tentei o fluxo de redefinição padrão antes".
- Botão "Definir senha" só habilita com todos os campos preenchidos.

Após sucesso: toast "Senha definida e usuário notificado por e-mail" + a senha temporária é mostrada **uma única vez** com botão "Copiar" e aviso "Esta senha não será exibida novamente — envie por canal seguro".

### 5. (Opcional) Log visível no Super Admin

Pequena seção "Ações administrativas recentes" exibindo as últimas 20 entradas de `admin_action_log` — útil para auditoria interna.

## Detalhes técnicos

- **Senha gerada**: 12 caracteres, mix de maiúsculas/minúsculas/dígitos/símbolos (`crypto.getRandomValues`).
- **Não armazenamos a senha em lugar nenhum** — vai direto para o Supabase Auth e é exibida apenas no momento da criação.
- **Edge function** segue o mesmo padrão de `admin-send-password-reset` (validação JWT + `has_role` + service role para `auth.admin`).
- **E-mail de notificação ao titular**: assunto "Sua senha foi alterada por um administrador", corpo informando data/hora e instruindo a contatar suporte se não reconhecer a ação. Usa o template transacional Lovable Emails.

## Arquivos a alterar/criar

- **Migração**: criar `admin_action_log` + RLS
- **Nova edge function**: `supabase/functions/admin-set-user-password/index.ts`
- **UI**: editar `src/pages/SuperAdmin.tsx` (aba Usuários, novo dialog)
- **(Opcional)** template transacional de "senha alterada pelo suporte"
