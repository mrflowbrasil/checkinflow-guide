# Plano — Rotação manual da API Key de integração

## Objetivo

Eliminar a rotação automática da `tenant_api_keys` ao (re)conectar Stays/Hostaway e ao disparar importação. A chave só deve ser substituída quando o cliente clica explicitamente em **"Gerar nova chave"** na tela de Integrações.

Isso resolve o caso ABMnb (n8n parou após reconexão porque a chave antiga foi revogada e o n8n não foi atualizado com a nova).

---

## Mudanças

### 1. `supabase/functions/integrations-connect`
- Remover o bloco que revoga a chave existente e cria outra quando `existingKey` já existe.
- Comportamento novo:
  - Se **não existe** chave ativa para o tenant → gerar uma (única vez na vida do tenant) e enviar no `callback.api_key` do webhook.
  - Se **já existe** chave ativa → **não rotacionar**; enviar `callback.api_key = null` (ou omitir o campo) e adicionar `callback.api_key_status = "existing"` para o n8n saber que deve reutilizar a chave já configurada.
- Manter o restante (upsert da integração, disparo do webhook, tratamento de erro).

### 2. `supabase/functions/integrations-trigger-import`
- Remover a rotação da chave (bloco `genApiKey` + revoke + insert).
- Mesma lógica do connect: só gera se o tenant nunca teve chave. Caso contrário envia `api_key: null` e `api_key_status: "existing"`.

### 3. `src/pages/dashboard/Integrations.tsx`
Já existe seção de API Keys com botão de criar/revogar. Acrescentar comunicação clara para o caso PMS:
- Ao reconectar Stays/Hostaway, mostrar aviso no diálogo: *"Sua API Key atual será mantida. Se precisar de uma nova, gere manualmente em 'Chaves de API' depois."*
- Não há mudança funcional no botão "Nova chave" — ele já chama `tenant-api-keys` (POST), que continua sendo o único caminho de criação manual.

### 4. Documentação para o n8n (no `ApiReference.tsx`)
Adicionar nota: *"A API Key enviada no webhook de conexão só vem preenchida na primeira conexão do tenant. Em reconexões, o campo virá `null` — mantenha o valor já configurado no fluxo."*

---

## Detalhes técnicos

**Payload novo do webhook (connect e import):**
```json
{
  "event": "connection" | "upload_listings",
  "tenant_id": "...",
  "provider": "stays",
  "system_url": "...",
  "authorization": "Basic ...",
  "callback": {
    "base_url": "https://.../functions/v1",
    "api_key": "mrf_live_..." | null,
    "api_key_status": "new" | "existing"
  }
}
```

**Sem migração de DB.** Tabela `tenant_api_keys` permanece igual; apenas para de receber revokes automáticos.

**Caso ABMnb (one-off, fora do plano):** atualizar manualmente o nó HTTP no n8n com a chave ativa atual `mrf_live_aba4OLr…` antes/depois do deploy.

---

## Riscos

- Fluxos n8n existentes que dependiam de receber a chave a cada reconexão precisarão ser ajustados para tratar `api_key: null`. Hoje só há fluxos para Stays/Hostaway e ambos passarão a usar a chave configurada no nó HTTP.
- Se um cliente perder a chave (não copiou na criação), terá que clicar em "Gerar nova chave" e atualizar o n8n — comportamento esperado e desejado.
