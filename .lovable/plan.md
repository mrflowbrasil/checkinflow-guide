## Contexto

Hoje existe um único endpoint `integrations-mark-synced` que aceita `status: connected | error | pending`. Ele é usado tanto:

1. Após o teste da API (event `connection`) → para marcar a integração como **conectada**.
2. Após o término do upload de imóveis (event `upload_listings`) → para marcar a importação como **finalizada**.

Isso mistura dois conceitos diferentes:
- **Estado da integração** (credenciais válidas / inválidas)
- **Estado da última importação** (em andamento / concluída / erro)

E cria efeitos colaterais ruins: se o n8n chamar `mark-synced` com `connected` ao terminar uma importação, ele sobrescreve `last_sync_at` corretamente — mas se a importação falhar parcialmente, ou se a UI quiser distinguir "conectado mas nunca importou" de "importação concluída agora", não há como.

## Decisão

Criar um **endpoint dedicado** para finalização de importação, mantendo `integrations-mark-synced` apenas para o handshake de conexão.

```text
n8n event=connection         → POST /integrations-mark-synced     { status: "connected" | "error" }
n8n event=upload_listings    → POST /integrations-mark-import-done { status: "completed" | "error", imported_count?, error? }
```

## Mudanças

### 1. Nova edge function `integrations-mark-import-done`

Mesma autenticação por `X-API-Key` (hash em `tenant_api_keys`). Recebe:

```json
{
  "provider": "stays" | "hostaway",
  "status": "completed" | "error",
  "imported_count": 12,
  "error": "mensagem opcional"
}
```

Comportamento:
- Atualiza `tenant_integrations`:
  - `status` volta para `"connected"` (a integração em si segue válida) **ou** `"error"` se a importação falhou.
  - `last_sync_at = now()` quando `status = completed`.
  - `last_error` recebe a mensagem em caso de erro, ou é limpo em caso de sucesso.
- Retorna `{ ok: true }`.

Isso mantém a UI atual funcionando (badge "Conectado" + "Última sincronização: …") sem precisar de novo enum no front.

### 2. `integrations-mark-synced` — restringir a connection handshake

- Remover o status `pending` da whitelist (não é mais usado por esse endpoint).
- Aceitar apenas `connected | error`.
- Não tocar em `last_sync_at` (esse campo passa a ser exclusivo do endpoint de importação) — opcional, mas deixa a semântica clara.

### 3. Documentação para o n8n

Atualizar o payload do webhook em `integrations-trigger-import` para incluir os dois callbacks no objeto `callback`:

```ts
callback: {
  base_url: `${SUPABASE_URL}/functions/v1`,
  api_key: plainKey,
  endpoints: {
    connection_done: "/integrations-mark-synced",       // event=connection
    import_done:     "/integrations-mark-import-done",  // event=upload_listings
  },
}
```

Assim o fluxo no n8n fica explícito sobre qual endpoint chamar em cada evento.

### 4. Front-end — sem mudanças obrigatórias

`Integrations.tsx` continua lendo `status` e `last_sync_at` da tabela. O polling/realtime já trata transição `syncing → connected`. Nenhuma alteração de UI necessária.

(Opcional futuro: exibir `imported_count` da última importação — exigiria nova coluna em `tenant_integrations`. Não incluído neste plano.)

## Arquivos afetados

- **novo** `supabase/functions/integrations-mark-import-done/index.ts`
- `supabase/functions/integrations-mark-synced/index.ts` (restringir statuses)
- `supabase/functions/integrations-trigger-import/index.ts` (incluir endpoints no payload do webhook)

## Resposta direta à sua pergunta

**Sim, faz sentido separar.** Endpoints distintos deixam a semântica clara, evitam que uma falha de importação derrube o estado de "credenciais válidas", e facilitam evoluir cada fluxo de forma independente (ex.: registrar contagem de imóveis importados sem afetar o handshake de conexão).