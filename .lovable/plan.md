## Alterar email do usuário existente

Hoje existe apenas **1 usuário** no banco: `vitor@supercelular.com.br` (id `e66125f8...`), já confirmado e ligado ao tenant "Vitor's workspace" como `tenant_owner`.

Sim, dá para trocar o email **sem perder nada** (tenant, imóveis, páginas, blocos continuam intactos — tudo é vinculado pelo `user_id`, não pelo email).

### Opção recomendada: atualizar direto no banco

Como você é o dono do projeto e quer apenas corrigir o email, o caminho mais rápido é rodar um UPDATE em `auth.users` trocando o email e já marcando como confirmado:

```sql
UPDATE auth.users
SET email = 'vitor@mrflow.com.br',
    email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'vitor@supercelular.com.br';
```

Depois disso, no mesmo passo, já promovo a **Super Admin**:

```sql
INSERT INTO public.user_roles (user_id, role, tenant_id)
SELECT id, 'super_admin', NULL
FROM auth.users
WHERE email = 'vitor@mrflow.com.br'
ON CONFLICT DO NOTHING;
```

### O que muda para você

- O login passa a ser **vitor@mrflow.com.br** (mesma senha de antes).
- Tenant, imóveis e configurações **permanecem iguais** (mesmo `user_id`).
- Você ganha acesso à rota **`/admin`** (Painel Super Admin).
- Continua também como `tenant_owner` do workspace original — pode usar `/app` normalmente.

### Detalhes técnicos

- A operação roda como migração SQL (única forma de fazer UPDATE/DELETE neste ambiente).
- Não mexe em `profiles`, `tenants`, `properties` — todos referenciam o `id` do usuário, que não muda.
- Não precisa de novo signup nem confirmação de email.

### Alternativa (se preferir não tocar no banco)

1. Fazer signup novo com `vitor@mrflow.com.br` (cria outro tenant vazio).
2. Eu promovo o novo a Super Admin.
3. Você ignora/deleta o tenant antigo manualmente depois.

Não recomendo, porque cria um workspace duplicado.

### Próximo passo

Aprove o plano e eu rodo a migração com os 2 comandos acima (trocar email + promover a Super Admin) em sequência.