## Catálogo (Link da Bio) — Plano de implementação

Nova área logada para o usuário curar suas propriedades em uma página pública mobile-first, otimizada para o link da bio do Instagram, com filtro híbrido (local + webhook de disponibilidade na Stays).

---

### 1) Banco de dados (uma migration)

Estender a tabela `properties` existente (multi-tenant via `tenant_id`, sem duplicar cadastro):

- `city` text
- `max_guests` integer
- `base_price` numeric(10,2)
- `source` text default `'manual'` check in (`'manual'`,`'stays'`,`'hub'`)
  - Backfill: `'stays'`/`'hub'` quando `external_provider` correspondente; senão `'manual'`.
- (reaproveita `cover_image_url`, `external_id`, `public_slug`, `booking_url`)

Webhook de busca (registro só, URL configurada depois pelo Super Admin no painel atual):
- `INSERT INTO integration_webhooks (provider, webhook_url, is_active) VALUES ('catalog_search', '', false) ON CONFLICT DO NOTHING;`

Edge function nova `catalog-search` (`verify_jwt = false`, é chamada de página pública):
- Recebe `{ tenant_slug, checkin, checkout, guests, city, max_price }`.
- Resolve `tenant_id` via service role, lê webhook `catalog_search` ativo, faz POST com `{ tenant_id, ...filtros, properties: [ids candidatos] }` e devolve `{ properties: [{ id, booking_url, available }], ... }`.
- Se webhook inativo/inexistente: devolve fallback `{ properties: <candidatos locais com booking_url do registro>, mocked: true }` para o cat unfunc enquanto a URL não é configurada.

Edge function nova `catalog-public` (`verify_jwt = false`):
- `GET ?tenant_slug=...` → `{ tenant: { name, logo_url, primary_color, instagram_url, bio }, properties: [...] }` lendo apenas imóveis com `status='active'`. Existe pra evitar expor o anon key direto e permitir cache/headers de CDN.

Nada de mudar RLS — política `Public reads active properties` já cobre leitura anônima.

---

### 2) Área logada — `/app/catalog`

Arquivos novos:
- `src/pages/dashboard/Catalog.tsx`
- `src/components/catalog/ImportFromStaysDialog.tsx`
- `src/components/catalog/ManualPropertyDialog.tsx` (usa os campos novos + `name`, `cover_image_url`)
- `src/components/catalog/PropertyCatalogCard.tsx`
- `src/components/catalog/CatalogPreviewDialog.tsx` (mockup de smartphone com iframe da URL pública)

Edit:
- `src/App.tsx` → rota `<Route path="catalog" element={<Catalog />} />` dentro de `/app`.
- `src/components/layout/AppShell.tsx` → item de nav "Catálogo" (ícone `LayoutGrid`) entre Imóveis e Templates.

Layout em `Tabs` (Imóveis | Link da Bio):

**Aba Imóveis**
- Header com botões: `Importar da Stays/Hub` (abre dialog que chama a edge function `integrations-trigger-import` já existente quando há integração; senão exibe estado vazio com CTA "Conectar Stays" linkando `/app/integrations`), `Adicionar manualmente`.
- Grid de cards (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) com cover, título, cidade, capacidade, preço, badge da origem (`Stays`/`Hub`/`Manual`) e menu de ações (editar/remover do catálogo via toggle `status`).

**Aba Link da Bio**
- Card destaque com URL `welcomehub.mrflow.com.br/c/{tenant.slug}` + botão `Copiar` (sonner toast) + botão `Visualizar catálogo` que abre `CatalogPreviewDialog`.
- Card "Personalização": campos `bio` (texto livre, salva em `tenants.extras` jsonb — se não existir, adicionar coluna `catalog_bio text` na mesma migration), reuso de `logo_url`/`name`/`primary_color`.
- Aviso quando `integration_webhooks.catalog_search` não está configurado: "A busca por disponibilidade ainda não está ativa — fale com o suporte."

Estado/dados: TanStack Query (`useQuery` em `properties` por tenant, `useMutation` para criar/editar). Reaproveita `supabase` client e padrão dos demais dashboards.

---

### 3) Catálogo público — `/c/:tenantSlug`

Arquivos novos:
- `src/pages/PublicCatalog.tsx` (rota fora do `RequireAuth`, lazy)
- `src/components/catalog/public/CatalogHeader.tsx`
- `src/components/catalog/public/CatalogFilters.tsx`
- `src/components/catalog/public/CatalogResultCard.tsx`
- `src/components/catalog/public/CatalogSkeleton.tsx`

Edit: `src/App.tsx` → `<Route path="/c/:tenantSlug" element={<PublicCatalog />} />`.

UX mobile-first:
- Container `max-w-md mx-auto px-4 py-6`, fundo neutro, tipografia já do design system.
- Header: avatar redondo (`tenant.logo_url`), nome, bio, links sociais (reuso de `instagram_url`/`facebook_url`).
- Filtros sticky no topo: date-range (shadcn Calendar), `Select` de hóspedes (1–5+), `Select`/input de cidade (auto-complete a partir de `Set(properties.city)`), `Slider` de preço máximo (min/max derivados dos dados), botão `Buscar disponibilidade`.
- Lógica híbrida:
  1. `useMemo` filtra localmente por `city`/`max_guests`/`base_price` em cada mudança de input → re-render imediato dos cards locais.
  2. Ao clicar `Buscar`, dispara `useMutation` chamando `catalog-search`; durante `isPending` substitui a lista por 3 `Skeleton` cards mantendo altura; quando resolve, mescla pela `id` com `booking_url` retornado.
- Cards verticais (feed): imagem `loading="lazy"` + `decoding="async"` + aspect-ratio fixo (evita CLS), tags de capacidade/cidade, preço destacado, botão `Ver detalhes e reservar` → `window.open(booking_url, '_blank', 'noopener')`.
- Estado vazio: ilustração simples + texto "Nenhum imóvel disponível para estas datas, tente outro período".
- SEO: `<Seo>` com title "Catálogo · {tenant.name}", `noindex` por padrão (link da bio, não SEO target) — confirmar se prefere indexável.
- Performance: rota lazy, sem QueryProvider extra, `preconnect` para o domínio de imagens, sem analytics pesado nessa rota.

---

### 4) Fora do escopo

- Integração real Stays nova (usa o webhook que o Super Admin cadastrar).
- Sistema de pagamento/reserva (só redireciona).
- i18n do catálogo público (PT-BR apenas nesta entrega).
- Edição inline avançada do card de imóvel (só toggle ativo/inativo e abrir modal).

### Detalhes técnicos
- Migration única: ALTER properties + ALTER tenants (adicionar `catalog_bio`) + INSERT em `integration_webhooks` + backfill `source`. Sem novas tabelas, sem novas policies.
- Edge functions novas declaradas em `supabase/config.toml` com `verify_jwt = false` (públicas).
- Reuso total dos componentes shadcn já no projeto (Tabs, Dialog, Card, Slider, Select, Calendar, Skeleton, Button, Input).
- `slug` do catálogo = `tenants.slug` existente (não cria campo novo).
