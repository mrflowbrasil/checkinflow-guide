
# Estrutura de ingestão de reservas (Stays / Hostaway via n8n)

Objetivo: preparar somente a camada de ingestão e leitura. Nenhum dashboard, nenhum mock, nenhuma alteração em `profiles`, `tenants`, `properties`, `tenant_integrations`, `subscriptions`.

## 1. Migration — tabela `public.reservations_import`

Cria a tabela conforme spec, com FK para `tenants`, índices auxiliares, RLS ligado e GRANTs corretos.

Colunas:
- `id uuid pk default gen_random_uuid()`
- `tenant_id uuid not null references public.tenants(id) on delete cascade`
- `provider text not null` (esperado: `stays` | `hostaway`)
- `external_id text not null`
- `payload jsonb not null`
- `synced_at timestamptz default now()`
- `created_at timestamptz default now()`

Constraints / índices:
- `unique (tenant_id, provider, external_id)` — necessário para o upsert do n8n.
- Index em `(tenant_id, provider)` e em `(tenant_id, synced_at desc)` para acelerar as views.

GRANTs (obrigatórios na mesma migration):
- `GRANT SELECT ON public.reservations_import TO authenticated;` (frontend só lê, e apenas do próprio tenant via RLS)
- `GRANT ALL ON public.reservations_import TO service_role;` (edge function escreve)
- Sem grant para `anon`.

RLS:
- `ENABLE ROW LEVEL SECURITY`.
- Policy SELECT: `tenant_id = public.current_tenant_id() OR public.has_role(auth.uid(),'super_admin')`.
- Sem policies de INSERT/UPDATE/DELETE — escrita só via service_role na edge function.

## 2. Views (todas mantêm `tenant_id`, todas leem `payload jsonb`)

Como o schema do `payload` ainda não foi formalmente fixado, as views vão usar **expressões tolerantes** que cobrem os formatos mais comuns de Stays e Hostaway, com `COALESCE` entre nomes equivalentes. Quando o n8n começar a enviar dados reais, basta ajustar os campos extraídos sem mexer na tabela.

Campos normalizados que cada view expõe (extraídos de `payload`):
- `reservation_id` (`payload->>'id'` / `external_id`)
- `status` (`confirmed`, `canceled`, `pending`…): `COALESCE(payload->>'status', payload->>'reservationStatus')`
- `check_in date`: `COALESCE(payload->>'checkInDate', payload->>'arrivalDate', payload->>'checkIn')::date`
- `check_out date`: análogo
- `nights int`: `COALESCE((payload->>'nights')::int, check_out - check_in)`
- `total_amount numeric`: `COALESCE((payload->>'totalPrice')::numeric, (payload->'price'->>'total')::numeric, (payload->>'amount')::numeric)`
- `currency text`
- `property_external_id text`: `COALESCE(payload->>'listingMapId', payload->>'propertyId', payload->>'listingId')`
- `guest_name text`, `channel text` (Airbnb/Booking/Direct…)

### 2.1 `public.v_reservations_dashboard`
Uma linha por reserva (`reservations_import`) com `tenant_id`, `provider`, `external_id`, todos os campos normalizados acima, mais `synced_at`. Esta é a view base que as outras duas consomem.

### 2.2 `public.v_dashboard_monthly_metrics`
Agregação por `tenant_id` × `mes (date_trunc('month', check_in))`:
- `revenue` = soma de `total_amount` em reservas não canceladas
- `nights` = soma de `nights`
- `confirmed_count`, `canceled_count`
- `avg_ticket`

### 2.3 `public.v_dashboard_property_metrics`
Agregação por `tenant_id` × `property_external_id`:
- `revenue`, `nights`, `confirmed_count`, `canceled_count`, `last_check_in`
- LEFT JOIN opcional com `public.properties` por `(tenant_id, external_id)` para trazer `name` (somente leitura, não altera a tabela).

Views ficam acessíveis ao frontend via PostgREST, herdando a RLS da tabela base (são views simples sem `security definer`). Grants: `GRANT SELECT ON <view> TO authenticated`.

## 3. Edge Function `ingest-reservations-import`

Arquivo: `supabase/functions/ingest-reservations-import/index.ts`.
Config em `supabase/config.toml`: `verify_jwt = false` (chamada por n8n, não por usuário Supabase).

Fluxo:
1. Se `req.method !== 'POST'` → 405.
2. Ler header `x-mrflow-secret`. Comparar com `Deno.env.get('MRFLOW_RESERVATION_INGEST_SECRET')` em tempo constante. Ausente/incorreto → 401. Não vaza qual dos dois.
3. Parse JSON. Validar:
   - `tenant_id`: presente, string, UUID válido (regex) → senão 400.
   - `provider`: string não-vazia → senão 400.
   - `external_id`: string não-vazia → senão 400.
   - `payload`: objeto JSON (não array, não null) → senão 400.
   - `synced_at`: opcional; se vier, precisa ser ISO parseável → senão 400.
4. Criar client com `SUPABASE_SERVICE_ROLE_KEY` (server-side, nunca exposto).
5. `SELECT 1 FROM tenants WHERE id = tenant_id` → se não existir, 404 `{ error: 'tenant_not_found' }`.
6. `upsert` em `reservations_import` com `onConflict: 'tenant_id,provider,external_id'`, gravando os 5 campos (+ `synced_at` = recebido ou `now()`).
7. Sucesso → 200 `{ success: true, external_id, action: 'upserted' }`.
8. Qualquer exceção → 500 `{ error: 'internal_error' }` e `console.error` com detalhe.

CORS: liberar apenas `POST, OPTIONS` (suficiente para n8n; frontend não chama).

## 4. Secret

Solicitar via `add_secret`:
- `MRFLOW_RESERVATION_INGEST_SECRET` — valor gerado pelo usuário (ou vamos gerar automaticamente com `generate_secret`, 48 chars, se ele preferir — pergunto antes de prosseguir).

## 5. Entrega final ao usuário (após o build)

Vou responder com:
- URL final da função: `https://<project-ref>.functions.supabase.co/ingest-reservations-import`.
- Nome exato do secret: `MRFLOW_RESERVATION_INGEST_SECRET`.
- Configuração do node HTTP Request no n8n:
  - Method: POST
  - URL acima
  - Headers: `Content-Type: application/json`, `x-mrflow-secret: {{ $env.MRFLOW_RESERVATION_INGEST_SECRET }}`
  - Body (JSON): `{ tenant_id, provider, external_id, payload, synced_at }`
- Exemplo de teste com `curl` usando uma reserva mínima.

## O que NÃO será feito agora
- Nenhum dashboard / página `/app/inteligencia`.
- Nenhuma alteração em `profiles`, `tenants`, `properties`, `tenant_integrations`, `subscriptions`.
- Nenhum dado de teste ou mock inserido.

## Pergunta antes de implementar
Você prefere **gerar o valor do `MRFLOW_RESERVATION_INGEST_SECRET` automaticamente** (string aleatória de 48 chars, retornada para você copiar no n8n) ou **definir o valor manualmente** via formulário seguro?
