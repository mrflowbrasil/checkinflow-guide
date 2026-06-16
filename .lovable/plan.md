## Estado atual

- O botão **"Importar da Stays / Hub"** abre o `ImportFromStaysDialog`, que **não chama webhook nenhum** — apenas mostra um texto explicativo e redireciona para `/app/integrations`.
- O webhook real de importação fica na página **Integrações**, na função `integrations-trigger-import`, que envia `event: "upload_listings"` para o webhook configurado em `integration_webhooks` por provedor (stays / hostaway).
- A função `properties-api` (usada pelo n8n para criar/atualizar imóveis no callback) **não aceita** os campos `max_guests`, `base_price` e `city`, que são justamente os campos exibidos no Catálogo.

## O que vamos fazer

### 1. Disparar webhook do catálogo a partir do botão

Transformar o botão em um disparo real, reutilizando os webhooks já cadastrados de **stays** e **hostaway** (tabela `integration_webhooks`), mas com um `event` próprio.

- Nova edge function **`catalog-trigger-import`** (espelho enxuto da `integrations-trigger-import`):
  - Identifica o tenant logado.
  - Localiza a integração ativa (`stays` ou `hostaway`) em `tenant_integrations` com `status = 'connected'`.
  - Gera/rotaciona uma API key (nome `Importação Catálogo`) para o n8n usar nos callbacks via `properties-api`.
  - Faz POST no `webhook_url` correspondente ao provider em `integration_webhooks`.
  - Payload com `event: "upload-listings-catalog"` (formato detalhado abaixo).
- `ImportFromStaysDialog`:
  - Manter a explicação, mas trocar o botão final por **"Iniciar importação"** que invoca `catalog-trigger-import`.
  - Se não houver integração conectada, mostrar mensagem e manter o link para `/app/integrations`.
  - Em caso de sucesso, fechar dialog e mostrar toast "Importação iniciada".

### 2. Estender `properties-api` para aceitar campos do catálogo

Atualmente `properties-api` (POST/PUT) ignora `max_guests`, `base_price` e `city`. Vamos adicionar esses três campos ao `propertyPayload` (são colunas existentes em `properties`). Sem isso, o n8n consegue mandar os dados mas o número de hóspedes e o preço não chegam.

### 3. JSON enviado ao webhook (resposta para o usuário)

**Request → webhook do provider (saída de `catalog-trigger-import`):**

```json
{
  "event": "upload-listings-catalog",
  "tenant_id": "<uuid do tenant>",
  "provider": "stays",
  "system_url": "https://<url da integração cadastrada>",
  "authorization": "Basic <credencial do tenant_integrations>",
  "callback": {
    "base_url": "https://<projeto>.supabase.co/functions/v1",
    "api_key": "mrf_live_xxx",
    "endpoints": {
      "upsert_property": "/properties-api"
    }
  }
}
```

**Callback que o n8n deve fazer por imóvel** — `POST {base_url}/properties-api` com header `X-API-Key: <api_key>`:

```json
{
  "external_id": "12345",
  "external_provider": "stays",
  "name": "Apto no B. Universitário",
  "status": "active",
  "city": "Palmas",
  "max_guests": 4,
  "base_price": 250.00,
  "cover_image_url": "https://...jpg",
  "booking_url": "https://...",
  "images": ["https://...", "https://..."],
  "address": "Rua X, 100",
  "latitude": -10.18,
  "longitude": -48.33
}
```

Campos relevantes para o catálogo: **`name`, `city`, `max_guests`, `base_price`, `cover_image_url`, `booking_url`, `external_id`, `external_provider`, `status`**. O resto é opcional.

## Detalhes técnicos

- **Arquivos editados:**
  - `src/components/catalog/ImportFromStaysDialog.tsx` — trocar CTA por disparo real.
  - `supabase/functions/properties-api/index.ts` — aceitar `max_guests`, `base_price`, `city` no upsert.
  - `public/version.json` — bump.
- **Arquivo novo:**
  - `supabase/functions/catalog-trigger-import/index.ts` — registrada em `supabase/config.toml` com `verify_jwt = true`.
- **Sem mudanças de schema** — todas as colunas já existem.
- **Webhooks:** reutilizam linhas existentes da `integration_webhooks` com `provider IN ('stays','hostaway')`. Nada precisa ser cadastrado a mais; o `event` no payload diferencia a chamada do PMS-import tradicional.
