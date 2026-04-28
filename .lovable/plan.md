# Mr Flow Host — Plano do MVP (revisado com referências visuais)

Plataforma SaaS mobile-first para gestão de imóveis de temporada, com guia digital do hóspede gerado automaticamente (link público + QR Code) e editor de conteúdo por blocos. Visual inspirado nas referências enviadas (admin Mr Flow + guia mobile azul-marinho + mockup luxury creme).

---

## 1. Arquitetura

- **Backend:** Lovable Cloud (Postgres + Auth + Storage + Edge Functions)
- **Frontend:** React + Vite + Tailwind + shadcn/ui, mobile-first
- **Multitenancy:** isolamento por `tenant_id` em todas as tabelas, com RLS
- **Roles:** `super_admin`, `tenant_owner` (tabela `user_roles` separada — nunca no perfil)

```text
Super Admin   → /admin   → vê e gerencia todos os tenants
Tenant Owner  → /app     → gerencia imóveis do seu tenant
Hóspede       → /g/:slug → acessa o guia (sem login)
```

---

## 2. Modelo de dados

- **tenants** — id, name, slug, primary_color, secondary_color, logo_url, template (`clean` | `dark` | `luxury`), is_active, created_at
- **profiles** — id (= auth.users.id), tenant_id, full_name, avatar_url
- **user_roles** — id, user_id, role, tenant_id (nullable para super_admin)
- **properties** — id, tenant_id, name, external_id, address, description, booking_url, cover_image_url, status (`active` | `inactive`), public_slug (único global), created_at
- **property_images** — id, property_id, url, position
- **property_pages** — id, property_id, key, title, icon, position, is_enabled  
  Keys: checkin, checkout, wifi, location, rules, equipment, furniture, condo, parking, trash, economy, before_leaving, tips, contacts, emergency, how_to_arrive, transport, review, faq
- **content_blocks** — id, page_id, type (`text` | `subtitle` | `image` | `video` | `steps` | `tip` | `button` | `list`), data (jsonb), position
- **Storage buckets (públicos):** `property-covers`, `property-gallery`, `block-media`, `tenant-logos`

Função `has_role(user_id, role)` (SECURITY DEFINER) para policies sem recursão. Trigger no signup cria `profile` + `tenant` + role `tenant_owner`.

---

## 3. Auth e onboarding

- Email/senha + Google
- Signup self-service → cria tenant automaticamente
- `/reset-password`, recuperação de senha
- Super admin promovido manualmente via SQL

---

## 4. Dashboard do tenant (`/app`)

Layout espelhando a referência do **admin Mr Flow**:

- **Sidebar fixa** à esquerda (drawer em mobile) com logo Mr Flow Host no topo e itens com ícone:
  - Dashboard
  - Imóveis
  - Configurações
- **Topbar** com "← Voltar" contextual + ações à direita (Ver, Salvar, Publicar em ciano)
- Cor de destaque do item ativo: ciano claro (igual à referência)

**Telas:**
- `/app` — overview (total de imóveis, ativos, links recentes)
- `/app/properties` — lista em cards com capa, status, "Copiar link", "QR Code"
- `/app/properties/new` — formulário (Nome, ID externo, Endereço, Descrição, Booking URL, Capa)
- `/app/properties/:id` — detalhes, galeria, lista de páginas (cada página com botão "Editar"), QR Code, link público, toggle Publicado/Despublicado
- `/app/properties/:id/pages/:key` — **editor de blocos** (ver §5)
- `/app/settings` — branding: logo, cor primária, cor secundária, template (clean/dark/luxury)

---

## 5. Editor de blocos

Interface idêntica à referência (Mr Flow Helpdesk):

- Topbar com título da página e botões **Ver / Salvar rascunho / Publicar**
- Abas **Editar** / **Pré-visualizar**
- Cada bloco em card branco com:
  - Handle de drag (`::`) à esquerda
  - Tipo do bloco em maiúsculas no topo (ex: "VÍDEO (YOUTUBE)")
  - Conteúdo editável inline
  - Ícone de lixeira vermelha à direita
- Botão "+ Adicionar bloco" entre cards, abre menu com os 8 tipos
- Drag-and-drop com `@dnd-kit/sortable`
- **Pré-visualização mobile** em frame de iPhone, renderizando exatamente como o hóspede verá
- Auto-save com debounce + indicador "Salvo"

**8 tipos de bloco:**
Texto · Subtítulo · Imagem (upload) · Vídeo YouTube (URL → embed) · Passo a passo · Caixa de dica (callout) · Botão (label + copiar texto / baixar arquivo) · Lista customizável

---

## 6. Página pública do hóspede (`/g/:slug`)

Espelhando a referência mobile (Maison Bleu):

**Hero:**
- Imagem de capa em altura ~50vh
- Nome da propriedade em branco, grande e centralizado
- Endereço logo abaixo, branco translúcido
- Sem toggle de idioma (decisão: PT-only no MVP)

**Botão Reservar:**
- Largura total, fundo azul-marinho profundo, texto branco maiúsculo
- Ícone de calendário à esquerda
- Abre `booking_url` em nova aba

**Grid 3 colunas:**
- Cards brancos quadrados com sombra suave e cantos arredondados
- Ícone outline (lucide-react) centralizado, cor primária do tenant
- Label embaixo
- "Emergência" sempre em vermelho
- 19 categorias na ordem: Check-in, Check-out, Wi-Fi, Localização, Regras, Equipamentos, Mobília, Condomínio, Estacionamento, Lixo, Economia, Antes de Sair, Dicas, Contatos, Emergência, Como Chegar, Transportes, Avaliação, FAQ
- Páginas desabilitadas pelo anfitrião não aparecem no grid

**Detalhe da página:**
- Sheet/modal full-screen ao tocar num card
- Renderiza os blocos com tipografia limpa
- Botão "Voltar" no topo

**SEO:** meta title/description com nome do imóvel, og:image com capa.

---

## 7. Templates (3 iniciais)

| Template | Estilo |
|---|---|
| **clean** (padrão) | Branco + azul-marinho `#0F1E3D` + cinza claro. Sans-serif (Inter). Igual à referência mobile. |
| **dark** | Fundo azul-marinho profundo, cards escuros, texto claro, acentos ciano. |
| **luxury** | Fundo creme/bege, serifa (Playfair Display) nos títulos, acentos dourados. Igual ao mockup. |

Tenant escolhe template + 2 cores customizadas em `/app/settings`. Aplicadas via CSS variables.

---

## 8. QR Code e link

- `public_slug` único global gerado no cadastro
- URL: `https://<dominio>/g/:slug`
- QR Code gerado client-side (`qrcode` lib)
- Botões: **Copiar link** · **Baixar QR (PNG)**
- Disponíveis no card e na página de detalhes do imóvel

---

## 9. Painel Super Admin (`/admin`)

- Lista de tenants: nome, owner, nº imóveis, criado em, status
- Ativar/desativar tenant
- Visualizar imóveis de qualquer tenant (read-only)
- Acesso restrito por role `super_admin`

---

## 10. Fora do escopo (fase 2)

- Endpoint público `POST /properties` (Stays/Hostaway)
- PWA dinâmico com manifest por imóvel + banner de instalação
- Idiomas (PT/EN ou conteúdo bilíngue)
- 6 templates adicionais
- Customização de tipografia/ícones por tenant
- Reutilização de blocos entre páginas
- Convite de membros multi-usuário por tenant

---

## 11. Detalhes técnicos

- **Libs novas:** `@dnd-kit/core` + `@dnd-kit/sortable`, `qrcode`, `react-hook-form` + `zod`
- **Validação:** zod no client + checks/constraints no banco
- **RLS:** todas as tabelas com policies usando `has_role()` e join via `tenant_id`
- **Storage:** buckets públicos, upload via signed URL
- **Performance:** lazy-load de rotas, `loading="lazy"` em imagens, fontes self-hosted
- **i18n:** strings PT-BR diretamente no código

---

## 12. Ordem de implementação

1. Schema + RLS + roles + trigger de signup + storage buckets
2. Auth (login/signup/Google/reset) + layout do dashboard com sidebar
3. CRUD de imóveis + upload capa/galeria + branding do tenant
4. Página pública `/g/:slug` (hero + botão Reservar + grid de botões — sem conteúdo ainda) com template `clean`
5. Editor de blocos drag-and-drop + pré-visualização mobile
6. Renderização dos blocos na página pública + templates `dark` e `luxury` + cores do tenant
7. QR Code + copiar link + publicar/despublicar
8. Painel Super Admin
9. Polimento UX, estados vazios, skeletons, validações

Após aprovar, começo pela etapa 1.