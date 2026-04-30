
# Plano: Integrações nativas (Stays / Hostaway) + API de Propriedades

## Visão geral

Vamos criar 3 blocos que se conectam:

1. **Painel Super Admin** → cadastro das URLs dos webhooks n8n (uma por provedor: `stays`, `hostaway`).
2. **Página de Integrações no app do cliente** (`/app/integrations`) → o cliente conecta a Stays informando URL do sistema, Login e Senha. Disparamos o webhook do n8n (passando `Authorization: Basic base64(login:senha)` + URL do sistema). Hostaway entra como "Em breve" na primeira versão (ou com campos de API key — confirmar com você).
3. **API REST de Propriedades** (Edge Functions) → endpoints `POST` (criar) e `PUT` (atualizar) que o n8n vai chamar de volta para popular a plataforma com os imóveis trazidos da Stays. Autenticação via API key por tenant.

---

## 1. Banco de dados (migrations)

### 1.1 Tabela `integration_webhooks` (super admin)
Configuração global dos endpoints n8n por provedor.

| coluna | tipo | obs |
|---|---|---|
| id | uuid PK | |
| provider | text UNIQUE | `stays` \| `hostaway` |
| webhook_url | text | URL do n8n |
| is_active | boolean | default true |
| created_at / updated_at | timestamptz | |

RLS: apenas `super_admin` lê/escreve. Edge functions usam service role.

### 1.2 Tabela `tenant_integrations`
Conexões de cada tenant com cada provedor.

| coluna | tipo | obs |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK tenants | |
| provider | text | `stays` \| `hostaway` |
| system_url | text | URL do sistema do cliente (Stays) |
| credentials_encrypted | text | login:senha em base64 (armazenado server-side, nunca exposto ao client) |
| status | text | `pending` \| `connected` \| `error` |
| last_sync_at | timestamptz | |
| last_error | text | |
| created_at / updated_at | timestamptz | |
| UNIQUE (tenant_id, provider) | | |

RLS: tenant_owner do próprio tenant lê (sem expor `credentials_encrypted` — cliente lê via view sem essa coluna ou só campos seguros). Edge functions com service role escrevem/leem tudo.

### 1.3 Tabela `tenant_api_keys`
Chave de API por tenant, usada pelo n8n para chamar nossos endpoints REST.

| coluna | tipo | obs |
|---|---|---|
| id | uuid PK | |
| tenant_id | uuid FK | |
| key_hash | text | hash sha256 da chave (não armazenamos a key em claro) |
| key_prefix | text | primeiros 8 chars para identificar visualmente |
| name | text | descrição |
| last_used_at | timestamptz | |
| created_at | timestamptz | |
| revoked_at | timestamptz | |

RLS: tenant_owner vê suas próprias keys (sem hash). Geração feita por edge function que retorna a key em claro **uma única vez**.

### 1.4 Extensão da tabela `properties`
Já existe `external_id`. Adicionar:

- `external_provider` text (`stays`, `hostaway`, `manual`)
- `external_data` jsonb (payload bruto recebido para auditoria/debug)
- UNIQUE parcial `(tenant_id, external_provider, external_id)` quando `external_id` não nulo, para upsert idempotente.

### 1.5 Tabela `property_details` (campos estruturados do guia)
Hoje os dados de check-in, wifi, etc. ficam em `content_blocks` por página. Para o n8n popular de forma simples, criamos uma tabela achatada:

| coluna | tipo |
|---|---|
| property_id | uuid PK FK properties |
| checkin_time | text |
| checkin_instructions | text |
| checkout_time | text |
| checkout_instructions | text |
| lock_code | text |
| wifi_ssid | text |
| wifi_password | text |
| address | text (já existe em properties) |
| latitude / longitude | numeric |
| rules | text |
| parking | text |
| trash | text |
| emergency_contacts | jsonb |
| extras | jsonb (campo aberto para o que vier do PMS) |
| updated_at | timestamptz |

Um trigger pode, opcionalmente, popular blocos de `content_blocks` a partir desses campos quando vazios — mas para a primeira versão deixamos o cliente ver/editar via PageEditor normalmente; o endpoint só precisa persistir os dados.

---

## 2. Edge Functions

Todas em `supabase/functions/`, com CORS local (mesmo padrão das atuais de billing).

### 2.1 `integrations-connect-stays` (chamada pelo cliente logado)
- Body: `{ system_url, login, password }`
- Valida sessão Supabase do usuário, pega `tenant_id` do profile.
- Gera `base64(login:password)`.
- Faz upsert em `tenant_integrations` com `status='pending'`.
- Busca `webhook_url` em `integration_webhooks` onde provider='stays'.
- Faz `POST` ao n8n com payload:
  ```json
  {
    "tenant_id": "...",
    "system_url": "...",
    "authorization": "Basic <base64>",
    "callback": {
      "base_url": "<SUPABASE_URL>/functions/v1",
      "api_key": "<tenant_api_key gerada/recuperada>"
    }
  }
  ```
- Retorna `{ ok: true }` ao frontend.

### 2.2 `integrations-disconnect`
Remove a linha de `tenant_integrations` (ou marca como desconectada). Body: `{ provider }`.

### 2.3 `properties-api` (chamada pelo n8n)
Roteador em uma única função (mais simples para deploy). Autenticação por header `X-API-Key` validado contra `tenant_api_keys.key_hash`.

- `POST /properties-api` → cria propriedade. Body completo (ver seção 3).
- `PUT /properties-api?external_id=...&provider=stays` → atualiza por `external_id`+`provider`. Faz upsert: se não existir, cria.

Lógica:
1. Resolve `tenant_id` pela API key.
2. Valida payload com Zod.
3. Upsert em `properties` (gera `public_slug` se não vier).
4. Upsert em `property_details`.
5. Substitui `property_images` pela lista nova (ou faz merge por URL).
6. Retorna a propriedade criada/atualizada.

### 2.4 `tenant-api-keys` (CRUD básico, opcional na v1)
Endpoints para o cliente listar/criar/revogar suas keys. Para a v1 podemos gerar a key automaticamente no momento da conexão Stays e exibir em `Integrações > Stays > "Sua chave de API"` (mostrada uma vez).

### 2.5 Atualizar `supabase/config.toml`
Marcar `properties-api` com `verify_jwt = false` (autenticação própria via API key). As demais permanecem com JWT.

---

## 3. Body completo do endpoint de propriedades

```jsonc
{
  "external_id": "string (id na Stays)",          // obrigatório p/ upsert
  "external_provider": "stays",                   // obrigatório
  "name": "string",                               // obrigatório
  "description": "string",
  "status": "active | inactive",
  "address": "string",
  "latitude": 0,
  "longitude": 0,
  "booking_url": "https://...",
  "cover_image_url": "https://...",
  "images": ["https://...", "https://..."],
  "details": {
    "checkin_time": "15:00",
    "checkin_instructions": "...",
    "checkout_time": "11:00",
    "checkout_instructions": "...",
    "lock_code": "1234",
    "wifi_ssid": "...",
    "wifi_password": "...",
    "rules": "...",
    "parking": "...",
    "trash": "...",
    "emergency_contacts": [
      { "label": "Anfitrião", "phone": "+55..." }
    ],
    "extras": { /* campo livre */ }
  },
  "raw": { /* opcional: payload bruto do PMS p/ auditoria */ }
}
```

Resposta:
```json
{ "id": "uuid", "public_slug": "...", "created": true, "updated": false }
```

---

## 4. Frontend

### 4.1 Nova página `/app/integrations` (`src/pages/dashboard/Integrations.tsx`)
- Card **Stays**: logo, status (Conectado / Desconectado), botão "Conectar" abre dialog com 3 campos (URL do sistema, Login, Senha) — exatamente como o print. Ao salvar, chama `integrations-connect-stays`. Se conectado: mostra "Última sincronização: X" + botão "Reconectar" e "Desconectar".
- Card **Hostaway**: marcado "Em breve" (a menos que você queira já o mesmo fluxo agora — ver pergunta abaixo).
- Seção **API Key**: mostra prefixo + botão "Gerar nova chave" (a key full aparece uma vez em modal copiável).

### 4.2 Adicionar item "Integrações" no `AppShell` nav
Ícone `Plug` da lucide-react, entre "Imóveis" e "Planos".

### 4.3 Super Admin — nova aba "Integrações"
Em `src/pages/SuperAdmin.tsx`, adicionar `TabsTrigger` "Webhooks". Lista os providers (stays, hostaway), com um Input para `webhook_url` e Switch `is_active`. Save inline.

### 4.4 Validação
Usar Zod em todos os formulários (URL válida, login não vazio, senha mínimo 1 char).

---

## 5. Segurança

- `credentials_encrypted` (base64 da Stays) **nunca** retorna ao client. Política RLS em `tenant_integrations` exclui essa coluna via `GRANT SELECT (col, col, ...)` ou usa view `tenant_integrations_safe`.
- API keys armazenadas como `sha256` hash. Geração: `mrf_live_` + 32 bytes random base64url.
- Endpoint `properties-api` valida API key em tempo constante e atualiza `last_used_at`.
- Rate limit simples in-memory na edge function (mapa por tenant_id, janela 1 min) — aviso de que não é production-grade.
- Webhook URL do n8n só visível para super admin.

---

## 6. Fluxo end-to-end

```text
[Cliente] preenche URL+Login+Senha no /app/integrations
   │
   ▼
[Edge: integrations-connect-stays]
   - upsert tenant_integrations (status=pending)
   - gera/recupera tenant_api_key
   - POST n8n webhook { system_url, authorization, callback{base_url, api_key} }
   │
   ▼
[n8n] consulta API da Stays com Basic auth, lista imóveis
   │  para cada imóvel:
   ▼
[n8n] POST/PUT  <SUPABASE_URL>/functions/v1/properties-api
        Header: X-API-Key: mrf_live_xxx
        Body: { external_id, name, details, images, ... }
   │
   ▼
[Edge: properties-api]
   - valida API key → tenant_id
   - upsert properties + property_details + property_images
   - retorna { id, public_slug }
   │
   ▼
[n8n] (opcional) PATCH em tenant_integrations.status='connected', last_sync_at=now
       (faremos um endpoint pequeno integrations-mark-synced para isso)
```

---

## 7. Perguntas antes de implementar

1. **Hostaway na v1**: implemento o mesmo fluxo (URL + login/senha → webhook próprio em `integration_webhooks` provider=`hostaway`) ou deixo como "Em breve"?
2. **API key**: gero automaticamente ao conectar Stays e mostro 1x em modal, ou prefere uma seção dedicada onde o cliente cria manualmente?
3. **Sincronização incremental**: o `PUT` deve apagar imagens existentes e substituir pela lista nova, ou fazer merge (manter as que o cliente adicionou manualmente)?
4. **Endpoint de status**: quer que o n8n consiga marcar a integração como `connected` / reportar erro via `integrations-mark-synced`? (recomendo sim)

Pode responder essas 4 e eu já implemento tudo de uma vez.
