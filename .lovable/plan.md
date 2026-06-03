## Objetivo
Descobrir por que a aba **Usuários** em `/admin` aparece vazia em produção, mesmo com 10 profiles no banco e a edge function respondendo 200.

## Passos

1. **Instrumentar `supabase/functions/admin-list-users/index.ts`**
   - Adicionar `console.log` em pontos-chave:
     - usuário autenticado (id/email) e resultado do `has_role`
     - total devolvido por `admin.auth.admin.listUsers` por página
     - tamanho de `filtered`, `ids` e do array final `result`
     - se `admin.auth.admin.listUsers` retornar `error`, logar e devolver 500 com mensagem (em vez de só lançar)
   - Não muda a forma do retorno; só ajuda a ver nos Edge Function logs o que está acontecendo.

2. **Pedir para você**:
   - Abrir `hub.mrflow.com.br/admin` → aba **Usuários** novamente.
   - Eu leio os logs da função e identifico se:
     - (a) `listUsers` está retornando vazio (problema de service role / paginação), ou
     - (b) o retorno tem usuários mas o frontend não renderiza (aí o problema é build antiga em produção → resolve republicando).

3. **Aplicar a correção real** com base nos logs:
   - Se for (a): ajustar a chamada `listUsers` (ex.: tratar erro, validar `SUPABASE_SERVICE_ROLE_KEY`).
   - Se for (b): orientar republicação para sincronizar `hub.mrflow.com.br` com a versão atual do código.

## Detalhes técnicos
- Arquivo único alterado nessa primeira etapa: `supabase/functions/admin-list-users/index.ts`.
- Logs aparecem em **Edge Function logs** (uso `supabase--edge_function_logs` para ler).
- Nenhuma mudança de schema, RLS, ou frontend nessa etapa — apenas observabilidade.
