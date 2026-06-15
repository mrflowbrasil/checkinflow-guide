## 1. Correção de layout da página pública `/c/:tenantSlug`

Arquivos: `src/pages/PublicCatalog.tsx`, `src/components/catalog/public/CatalogResultCard.tsx`

- Aumentar o container de `max-w-md px-4` para `max-w-5xl px-4 sm:px-6 lg:px-8` e centralizar, eliminando a sensação de "colado nas bordas".
- Padronizar os cards de imóvel para combinar com a tela `/app/properties` (imagem 2):
  - Mesma proporção de imagem (`aspect-[16/10]`), `object-cover object-center`, cantos arredondados no topo.
  - Mesma tipografia do título, mesmo espaçamento interno (`p-4`).
- Em desktop/tablet, exibir os cards em grid responsivo (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) em vez de lista vertical única.
- Filtros (`CatalogFilters`) passam a ocupar largura total acima do grid, em layout horizontal em telas ≥ sm.

## 2. Filtros dinâmicos conforme integração ativa

Arquivos: `supabase/functions/catalog-public/index.ts`, `supabase/functions/catalog-search/index.ts`, `src/pages/PublicCatalog.tsx`, `src/components/catalog/public/CatalogFilters.tsx`.

### 2a. `catalog-public` (GET inicial)
- Passar a retornar também:
  - `has_live_availability: boolean` — `true` se existir registro em `tenant_integrations` para o tenant com `provider IN ('stays','hostaway')` e `status = 'connected'`.
  - `integration: { provider, system_url } | null` — primeira integração ativa encontrada (Stays tem prioridade sobre Hostaway).

### 2b. `CatalogFilters`
- **Remover completamente o campo Cidade** (UI + tipo `Filters`).
- Receber prop `hasLiveAvailability: boolean`.
  - `false`: ocultar Check-in/Check-out e o botão "Buscar disponibilidade". Mostrar apenas **Hóspedes** e **Faixa de preço**, aplicando filtragem local em tempo real (sem botão).
  - `true`: manter Check-in/Check-out + Hóspedes + Faixa de preço + botão "Buscar disponibilidade".

### 2c. `PublicCatalog.tsx`
- Remover `city` do estado `Filters`, do filtro local e da chamada de busca.
- Se `has_live_availability === false`: nunca invocar `catalog-search`; aplicar apenas filtragem local (guests + maxPrice) sobre a lista vinda de `catalog-public`.
- Se `true`: o botão dispara `catalog-search` enviando também `integration_url` (= `system_url` da integração ativa).

### 2d. `catalog-search`
- Remover `city` do `BodySchema` e do filtro Supabase.
- Aceitar `integration_url` opcional no body.
- No payload outbound do webhook (registrado em `integration_webhooks.catalog_search`), incluir `integration_url` e `integration_provider` além dos campos atuais (tenant, datas, guests, max_price, properties).
- Se nenhuma integração ativa for encontrada para o tenant (consulta a `tenant_integrations`), retornar 200 com as `properties` filtradas localmente e **não chamar o webhook**.

## Detalhes técnicos

- Sem mudanças de schema/migrations. `tenant_integrations.system_url` já existe e é usada.
- Sem gating de plano: catálogo continua liberado em todos os planos, item de menu inalterado.
- O tipo `Filters` perde `city`; ajustar todos os usos no front.
- `PublicCatalog` lê os campos novos com fallback (`false`/`null`) para tolerar resposta antiga em cache.
- Após edits, deploy de `catalog-public` e `catalog-search`. Atualizar `public/version.json`.
