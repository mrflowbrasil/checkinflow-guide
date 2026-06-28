## Objetivo

Permitir que sistemas externos (n8n etc.) liguem/desliguem a proteção "Acesso ao hub" de um imóvel e definam a senha simples, normalmente acionado quando uma nova reserva é criada (gerar senha a partir de dados do hóspede).

## Endpoint

`PATCH /properties-api/access` (adicionado ao edge function existente `properties-api`).

### Autenticação
- Header `X-API-Key: SUA_CHAVE` (mesmo padrão atual).

### Body (JSON)
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `tenant_id` | uuid | sim | ID do tenant. Deve bater com o tenant da API key (senão `403 tenant_mismatch`). |
| `property_id` | uuid | sim* | ID interno do imóvel. *Opcional se `external_id` for enviado. |
| `external_id` | string | sim* | Alternativa ao `property_id`, casado com `external_provider` (padrão `stays`). |
| `external_provider` | string | não | Padrão `stays`. |
| `enabled` | boolean | não | Liga/desliga `access_password_enabled`. |
| `password` | string | não | Define `access_password` (1–64 chars). Envie `null` para limpar. |

Regras:
- Pelo menos um entre `enabled` e `password` precisa ser enviado.
- Se `enabled=true` e a propriedade não tem senha salva e nenhuma foi enviada → `400 password_required_to_enable`.
- Valida que a propriedade pertence ao `tenant_id` informado (`404 property_not_found` caso contrário).

### Resposta
```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "access_password_enabled": true,
  "has_password": true,
  "updated_at": "2026-06-28T12:34:56Z"
}
```
(`has_password` é booleano, a senha em si nunca é retornada.)

## Mudanças no código

1. `supabase/functions/properties-api/index.ts`
   - Adicionar branch `if (req.method === "PATCH" && /\/access\/?$/.test(url.pathname))`.
   - Validar tenant_id, localizar propriedade por `property_id` ou `external_id`, aplicar update em `properties` (`access_password_enabled`, `access_password`, `updated_at`).
2. `src/components/integrations/ApiReference.tsx`
   - Acrescentar o novo endpoint à lista `ENDPOINTS` com params, exemplo de request, response e cURL automático.
3. Sem migração de banco — colunas `access_password_enabled` e `access_password` já existem em `public.properties`.

## cURL de exemplo (entregue ao usuário no final)

```bash
curl -X PATCH "https://pgdfcufjdyhmaqikwbdq.supabase.co/functions/v1/properties-api/access" \
  -H "X-API-Key: SUA_CHAVE" \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "576bc692-299c-4e1a-a7c9-9d374d09dce8",
    "property_id": "ab40310a-476e-48ed-9af9-e3d5fe3aa5a8",
    "enabled": true,
    "password": "MARIA1406"
  }'
```

Alternativa por ID externo do PMS:
```bash
curl -X PATCH ".../properties-api/access" \
  -H "X-API-Key: SUA_CHAVE" -H "Content-Type: application/json" \
  -d '{"tenant_id":"...","external_id":"KU01J","external_provider":"stays","enabled":true,"password":"JOAO2208"}'
```

## Observações de segurança
- A API key continua sendo a credencial primária; `tenant_id` é uma validação extra contra envio acidental para o tenant errado.
- Senha armazenada em texto (compatível com o fluxo atual da UI de edição do imóvel).
