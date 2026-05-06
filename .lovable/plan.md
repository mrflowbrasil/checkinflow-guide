# GET de páginas da Guia na `properties-api`

Estender a edge function `properties-api` para expor dois novos endpoints GET, sem alterar o comportamento atual de POST/PUT.

## Endpoints

### 1. Catálogo global de páginas
`GET /functions/v1/properties-api/pages-catalog`

Retorna a lista fixa das 23 páginas padrão definidas em `seed_property_pages()` (page_key, title, icon, position default). Não depende de imóvel — serve como referência para o cliente saber quais `page_key` existem.

Resposta:
```json
{
  "count": 23,
  "items": [
    { "page_key": "checkin",     "title": "Check-in",        "icon": "Clock",    "default_position": 1 },
    { "page_key": "lock_code",   "title": "Senha Fechadura", "icon": "KeyRound", "default_position": 2 },
    { "page_key": "checkout",    "title": "Check-out",       "icon": "LogOut",   "default_position": 3 },
    "... demais 20 páginas"
  ]
}
```

### 2. Páginas de um imóvel específico
`GET /functions/v1/properties-api/pages?external_id=XYZ&external_provider=stays`

Localiza o imóvel por `external_id` + `external_provider` (default `stays`) dentro do tenant da API key e devolve as páginas reais persistidas em `property_pages`.

Resposta:
```json
{
  "property_id": "uuid",
  "external_id": "STAYS-12345",
  "count": 23,
  "items": [
    {
      "id": "uuid",
      "page_key": "checkin",
      "title": "Check-in",
      "icon": "Clock",
      "position": 1,
      "is_enabled": true
    }
  ]
}
```

Erros:
- `401 invalid_api_key` — sem/má API key.
- `400 external_id_required` — query param ausente no endpoint `/pages`.
- `404 property_not_found` — imóvel não encontrado para o tenant.

## Roteamento

Hoje a função decide pelo `req.method`. Vamos adicionar parsing do `URL.pathname` para distinguir os subcaminhos `/pages-catalog` e `/pages` em GET, mantendo `GET /` como a listagem atual de propriedades. POST/PUT continuam idênticos.

## Detalhes técnicos

- **Arquivo**: `supabase/functions/properties-api/index.ts`.
- **Catálogo global**: array constante hardcoded no arquivo, espelhando `seed_property_pages()` (mesma ordem/títulos/ícones). Sem query no banco.
- **Páginas por imóvel**:
  ```ts
  const { data: prop } = await admin
    .from("properties")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("external_provider", externalProvider)
    .eq("external_id", externalId)
    .maybeSingle();
  // depois:
  admin.from("property_pages")
    .select("id, page_key, title, icon, position, is_enabled")
    .eq("property_id", prop.id)
    .order("position");
  ```
- **CORS**: reutiliza `corsHeaders` já importado.
- **Autenticação**: mesma validação por `X-API-Key` → `tenant_api_keys` já presente na função.
- **Sem mudanças** em POST/PUT, schema do banco, RLS ou no payload existente.

## Como o cliente usa

1. Chama uma vez `GET /pages-catalog` para conhecer todos os `page_key` possíveis.
2. (Opcional) Chama `GET /pages?external_id=...` para inspecionar o estado atual de um imóvel.
3. Continua enviando `POST/PUT` com o payload já documentado — nenhum campo novo é necessário.

## Arquivos afetados
- `supabase/functions/properties-api/index.ts` — adicionar roteamento por pathname e dois handlers GET.
