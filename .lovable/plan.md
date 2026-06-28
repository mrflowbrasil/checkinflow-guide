## Diagnóstico

A tenant **ABMnb's workspace** (`plan_code = business`) tem 17 registros em `tenant_api_keys`. Todas as chaves — inclusive as duas atualmente ativas (`mrf_live_J1IsFYn` e `mrf_live_3IkN6mg`) — foram criadas **antes** da introdução do `key_ciphertext`, então `has_cipher = false` em todas.

Fluxo atual em `integrations-connect` e `integrations-trigger-import`:

1. Chamam `getLatestRecoverableTenantApiKey()`.
2. A função pega a chave ativa mais recente, tenta `decryptApiKey(null)` → retorna `null`.
3. Retorna `{ apiKey: null, apiKeyStatus: "unrecoverable" }`.
4. As edge functions devolvem **HTTP 409** com `unrecoverableApiKeyPayload(...)`.
5. O frontend mostra o toast genérico do supabase-js: **"Edge Function returned a non-2xx status code"** e **nenhum webhook é disparado**.

Ou seja: ABMnb está travada porque não existe nenhuma chave recuperável, mas a regra atual proíbe revogar/rotacionar as antigas — então o código simplesmente falha.

## Decisão

Manter a regra "não revogar chaves existentes" (automações externas continuam usando as antigas), mas permitir que o sistema **gere automaticamente uma nova chave recuperável** quando não houver nenhuma com `key_ciphertext`. A nova chave passa a ser a "última ativa" e é o que é enviado nas próximas chamadas/webhooks. As chaves antigas continuam válidas até o usuário revogar manualmente.

Isso destrava ABMnb (e qualquer outra tenant antiga) sem quebrar fluxos n8n existentes.

## Mudanças

### 1. `supabase/functions/_shared/tenant-api-keys.ts`
- Em `getLatestRecoverableTenantApiKey`, quando a chave mais recente existir mas `decryptApiKey` retornar `null`, **não** devolver `unrecoverable`. Em vez disso, chamar `createTenantApiKey(admin, tenantId, "Integração (auto)")` e retornar a nova chave com `apiKeyStatus: "new"`.
- Manter `unrecoverableApiKeyPayload` exportado por compatibilidade, mas ele deixa de ser acionado neste caminho.

### 2. `supabase/functions/integrations-connect/index.ts` e `integrations-trigger-import/index.ts` e `catalog-trigger-import/index.ts`
- Como agora `getLatestRecoverableTenantApiKey` sempre devolve `apiKey != null` (cria se preciso), o branch `if (!keyResult.apiKey) return 409` vira inalcançável; mantemos como guard defensivo apenas, mas o fluxo normal segue e dispara o webhook.
- Incluir no JSON de retorno `api_key` (apenas quando `apiKeyStatus === "new"`) para o frontend exibir uma única vez.

### 3. `src/pages/dashboard/Integrations.tsx`
- No `submit()` (conectar), se a resposta vier com `api_key` e `api_key_status === "new"`, abrir o mesmo dialog de "Chave criada" já existente (`setRevealedKey(...)`) com aviso de que uma nova chave foi gerada automaticamente porque a anterior não pôde ser recuperada, instruindo a atualizar o n8n.
- Invalidar `tenant_api_keys` para refletir a nova chave na lista.

### 4. Plan gating (correção paralela)
- `integrations-connect` hoje permite só `pro`/`business`. Acrescentar `launch` para alinhar com `usePlanFeatures` e com a decisão anterior de liberar Stays/Hostaway no plano Lançamento.

## Validação

1. Reabrir o dialog "Conectar Stays" na conta ABMnb → enviar credenciais.
2. Esperar resposta 200, ver dialog com a nova api-key revelada uma única vez.
3. Conferir em `tenant_integrations` que `status` saiu de `pending` para `syncing/connected` após o webhook do n8n.
4. Conferir em `tenant_api_keys` que a nova chave tem `key_ciphertext != null` e as antigas continuam sem `revoked_at` setado pelo sistema.
5. Disparar "Importar de Stays" e confirmar que o webhook é executado.
