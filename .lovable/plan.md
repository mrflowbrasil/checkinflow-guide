
## Objetivo

Deixar os templates do Guia mais ricos visualmente (detalhes decorativos por modelo, estilo "fundo PowerPoint") e dar ao usuário controle sobre:
1. **Formato dos botões** da home (quadrado / arredondado / pílula) + opção de **borda**.
2. **Estilo da transição** da capa para o conteúdo: **linha** (atual) ou **degradê** suave.

Sim, é totalmente viável — toda a infra de tokens por template já existe em `index.css`. A proposta abaixo é incremental, sem refazer templates existentes.

## Etapa 1 — Aplicar no Boho Fun (teste para aprovar)

Antes de tocar nos outros 14 templates, faço o piloto **só no Boho Fun**:

- Detalhes decorativos sutis (SVG inline, leves, sem impacto de performance):
  - Folhas/curvas orgânicas no canto superior direito da home (atrás do hero).
  - Linha decorativa fina abaixo do título "HUB DE BOAS VINDAS".
  - Watermark discreto no rodapé das páginas internas (ex: pequena folha estilizada com baixa opacidade).
  - Pequeno ornamento ao redor do ícone das páginas internas (anel suave usando `--guide-primary`).
- Tudo 100% via CSS/SVG no escopo `.guide-template-boho_fun` — zero imagens externas, zero peso extra.

Você aprova nesse template e eu replico o mesmo *padrão de moldura decorativa* (com motivo próprio) para os demais: Pop Vibes (bolhas/raios), Arcade (pixels/grid neon), Jungle (folhagem densa), Aegean (ondas mediterrâneas), Luxury (filetes dourados), etc.

## Etapa 2 — Configuração por tenant (botões + capa)

Adicionar 3 campos novos no `public.tenants`:

| Campo | Valores | Default |
|---|---|---|
| `button_shape` | `square` · `rounded` · `pill` | `rounded` |
| `button_border` | `none` · `outline` | `none` |
| `cover_transition` | `line` · `gradient` | `line` |

Aplicados no Guia via CSS vars (`--guide-btn-radius`, `--guide-btn-border`) que já vão ser lidas por `.guide-card` e pelo CTA "Reservar Novamente". A transição da capa vira um seletor entre a borda atual e um degradê suave da cor da capa para `--guide-bg`.

## Etapa 3 — UI em /app/templates

Abaixo do grid de templates, adicionar um card **"Personalizar"** com:
- 3 toggles visuais para formato do botão (mini preview de cada).
- Switch para borda dos botões.
- 2 toggles para estilo da transição da capa (line / gradient) com mini preview.

Tudo persiste em `tenants` e reflete em tempo real no preview e no Guia público. Funciona em qualquer template.

## Detalhes técnicos

- **Migration**: adicionar colunas `button_shape`, `button_border`, `cover_transition` em `public.tenants` (text + CHECK), defaults compatíveis com o visual atual (nada quebra para tenants existentes).
- **CSS (`src/index.css`)**:
  - Novos tokens `--guide-btn-radius`, `--guide-btn-border-width`, `--guide-btn-border-color`.
  - `.guide-card` passa a usar `border-radius: var(--guide-btn-radius)` e `border: var(--guide-btn-border-width) solid var(--guide-btn-border-color)`.
  - Bloco `.guide-template-boho_fun` ganha pseudo-elementos `::before/::after` com SVG inline (folhas, linhas) posicionados absolutamente no `guide-root`.
- **`GuestGuide.tsx` / `TemplatePreviewDialog.tsx`**:
  - Aplicar inline-style com os tokens vindos do tenant.
  - Trocar o gradiente fixo da capa por um helper que monta `linear-gradient` (modo gradient) ou mantém a borda atual (modo line).
- **`src/pages/dashboard/Templates.tsx`**: novo painel "Personalização visual" com os controles acima, usando `useMutation` para `tenants.update`.
- **`useTenant`**: já retorna o tenant inteiro; só expor os novos campos.

## Entrega do piloto

Faço Etapa 1 + Etapa 2 + Etapa 3 numa única passada, mas com os detalhes decorativos só no **Boho Fun**. Você aprova o look-and-feel nesse template e, em seguida, eu aplico o mesmo padrão (com motivos próprios) nos outros 14.
