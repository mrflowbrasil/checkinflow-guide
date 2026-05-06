## Objetivo

Permitir que o POST/PUT da `properties-api` envie conteúdo para qualquer Guia usando um par simples `{ page_key, content }`, gerando blocos auto sem mexer nos manuais.

## Mudanças

### 1. Aceitar `pages[]` com formato simples no payload

```json
{
  "external_id": "STAYS-12345",
  "name": "Imóvel X",
  "pages": [
    { "page_key": "rules",       "content": "Não é permitido fumar..." },
    { "page_key": "faq",         "content": "**Tem secador?** Sim..." },
    { "page_key": "transport",   "content": "Metrô a 200m..." },
    { "page_key": "restaurants", "content": "..." }
  ]
}
```

- `page_key` → identificador da guia (mesmos do `GET /pages-catalog`).
- `content` → string única em markdown que vira **um bloco do tipo `text`** com `source: "auto"`.
- Páginas com `page_key` inválido são ignoradas silenciosamente.
- A versão atual que aceitava `title/icon/position/is_enabled` será **removida** (não era o objetivo).

### 2. Geração de blocos auto adicionais

Hoje `generateAutoBlocks` só gera para páginas mapeadas em `buildPageBlocks` (checkin, wifi, rules, etc.) usando `details`. Vamos estender:

- Após gerar os blocos baseados em `details`, percorrer `pages[]` do payload.
- Para cada item, adicionar um bloco `text` com `source: "auto"` na página correspondente.
- Como toda a deleção de auto já acontece em bloco no início (`delete ... where source='auto'`), os blocos manuais continuam intactos.
- Posição calculada a partir do `max(position) + 1` dos blocos manuais existentes (mesma regra atual).

### 3. Mesclar com `details`

Se o cliente enviar **ao mesmo tempo** `details.rules` e `pages: [{page_key:"rules", content:"..."}]`, prevalece o que vier em `pages[]` (mais explícito). Implementação: rodar `details` primeiro, depois sobrescrever os auto-blocks daquela page_key específica antes do insert final.

### 4. Resposta

```json
{
  "id": "uuid",
  "public_slug": "...",
  "created": false,
  "updated": true,
  "pages_updated": 4
}
```

`pages_updated` = quantas páginas receberam blocos via `pages[]`.

## Detalhes técnicos

- **Arquivo único**: `supabase/functions/properties-api/index.ts`.
- Nova função `buildPagesFromPayload(pages)` retornando `Map<page_key, BlockSeed[]>`.
- `generateAutoBlocks` recebe esse map e, para cada página com entrada no map, **substitui** os blocos auto vindos de `details` pelos do payload.
- Validação: `page_key` precisa estar em `PAGES_CATALOG`; `content` precisa ser string não-vazia.
- Sem mudanças em schema, RLS, GET, ou em `details`.

## Como o cliente usa (fluxo Stays)

1. `GET /pages-catalog` → descobre os 23 `page_key` possíveis.
2. Monta o JSON da Stays mapeando cada campo para um `page_key`:
   ```js
   pages: [
     { page_key: "rules",       content: stays.houseRules },
     { page_key: "faq",         content: stays.faq },
     { page_key: "transport",   content: stays.transportInfo },
   ]
   ```
3. Envia POST/PUT — todas as guias são atualizadas, manuais preservados.

## Arquivos afetados
- `supabase/functions/properties-api/index.ts` — remover update de metadados de páginas, adicionar processamento de `pages[].content` na geração de auto-blocks.
