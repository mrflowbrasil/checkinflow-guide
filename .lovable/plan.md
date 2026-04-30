## Objetivo

Fazer a tela `/app/integrations` refletir a mudança de status (`pending` → `connected`/`error`) automaticamente, sem precisar de refresh manual, usando **Supabase Realtime** como mecanismo principal e **polling** como fallback.

## Mudanças

### 1. Banco de dados (migração)

Habilitar realtime para a tabela `tenant_integrations`:

```sql
ALTER TABLE public.tenant_integrations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_integrations;
```

Isso permite que o frontend receba eventos de `UPDATE` em tempo real quando o n8n chamar `integrations-mark-synced`.

### 2. Frontend — `src/pages/dashboard/Integrations.tsx`

Adicionar dois mecanismos complementares dentro do componente:

**a) Subscription Realtime** (via `useEffect`):
- Inscrever no canal `postgres_changes` filtrado por `tenant_id` do usuário (obtido via `useTenant`).
- Em cada evento `UPDATE` na `tenant_integrations`, invalidar a query `["tenant_integrations"]` para o React Query refazer o fetch.
- Cleanup: remover o canal no unmount.

**b) Polling como fallback** (via opção do `useQuery`):
- Adicionar `refetchInterval` dinâmico: se algum integration estiver com status `pending` ou `syncing`, refetch a cada **3 segundos**; caso contrário, desliga (`false`).
- Adicionar `refetchOnWindowFocus: true` (já é o default, mas explicitar reforça o UX).

Resultado: assim que o n8n confirmar a conexão, o badge muda de "Sincronizando…" para "Conectado" em tempo real (via realtime); e mesmo que o WebSocket caia, o polling de 3s garante que a UI atualize em poucos segundos enquanto o status estiver pendente.

### 3. Toast de feedback (opcional, mesma tela)

Quando o realtime detectar que o status mudou de `pending` para `connected` ou `error`, exibir um toast:
- `connected` → `toast.success("Conexão estabelecida com sucesso.")`
- `error` → `toast.error("Falha ao conectar. Verifique as credenciais.")`

Para isso, manter em `useRef` o status anterior por provider e comparar no callback do realtime.

## Arquivos afetados

- **Nova migração SQL** (habilitar realtime na tabela)
- `src/pages/dashboard/Integrations.tsx` (subscription + polling + toast de transição)

## Observações

- Nenhuma mudança nas edge functions é necessária — o n8n continua chamando `integrations-mark-synced` exatamente como hoje.
- O polling só fica ativo quando há integração em estado transitório, então não há custo extra em tela ociosa.
- A RLS atual da `tenant_integrations` (`Tenant views own integrations`) já garante que o realtime entregue só os eventos do tenant do usuário.