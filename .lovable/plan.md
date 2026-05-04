## Novo endpoint: listar imóveis (GET)

Adicionar suporte a `GET` na edge function existente `properties-api`, mantendo a mesma autenticação por `X-API-Key` (que já resolve o `tenant_id` do tenant dono da chave).

### Endpoint

```
GET https://pgdfcufjdyhmaqikwbdq.supabase.co/functions/v1/properties-api
Header: X-API-Key: mrf_live_...
```

### Parâmetros de busca (query string, todos opcionais)

- `external_id` — filtra por ID externo (ex.: `GQ01G`)
- `external_provider` — `stays` | `hostaway` (default: sem filtro)
- `status` — `active` | `inactive`
- `created_from` — ISO date (`2026-01-01` ou `2026-01-01T00:00:00Z`)
- `created_to` — ISO date
- `search` — busca textual no `name` (ilike)
- `limit` — default 100, máx 500
- `offset` — default 0

> Observação sobre `tenant_id`: a função **não aceita `tenant_id` como parâmetro** por segurança — o tenant é sempre derivado da `X-API-Key`. Cada chave só enxerga os imóveis do próprio tenant. (Se quiser um modo "admin global" para o n8n consultar qualquer tenant, posso adicionar suporte a uma chave de service-role separada — me avise.)

### Resposta

```json
{
  "total": 42,
  "count": 20,
  "limit": 20,
  "offset": 0,
  "items": [
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "name": "Ed. Manoel Cordeiro - Stúdio Meu Aconchego II",
      "external_id": "GQ01G",
      "external_provider": "stays",
      "status": "active",
      "address": "...",
      "booking_url": null,
      "cover_image_url": "https://...",
      "public_slug": "ed-manoel-...-a1b2c3",
      "public_url": "https://hub.mrflow.com.br/g/ed-manoel-...-a1b2c3",
      "created_at": "2026-04-12T13:22:10Z",
      "updated_at": "2026-05-01T09:00:00Z"
    }
  ]
}
```

`total` usa `count: 'exact'` do Supabase respeitando os filtros (não apenas o tamanho da página).

### Exemplos cURL

Todos os imóveis do tenant:
```bash
curl 'https://pgdfcufjdyhmaqikwbdq.supabase.co/functions/v1/properties-api' \
  -H 'X-API-Key: mrf_live_...'
```

Filtrando por `external_id`:
```bash
curl 'https://pgdfcufjdyhmaqikwbdq.supabase.co/functions/v1/properties-api?external_id=GQ01G' \
  -H 'X-API-Key: mrf_live_...'
```

Por intervalo de data + paginação:
```bash
curl 'https://.../properties-api?created_from=2026-01-01&created_to=2026-05-01&limit=50&offset=0' \
  -H 'X-API-Key: mrf_live_...'
```

### Mudança técnica

Arquivo único: `supabase/functions/properties-api/index.ts`

- Adicionar branch `if (req.method === "GET")` antes do bloco POST/PUT.
- Validar/parsear query params (limit clamp 1–500).
- Construir query: `admin.from("properties").select("...", { count: "exact" }).eq("tenant_id", tenantId)` + filtros condicionais + `order("created_at", { ascending: false })` + `range(offset, offset+limit-1)`.
- Montar `public_url` com `https://hub.mrflow.com.br/g/{public_slug}`.
- Retornar `{ total, count, limit, offset, items }`.

Sem mudanças de banco, sem nova função, sem nova rota no app — só a edge function existente ganha o método `GET`.
