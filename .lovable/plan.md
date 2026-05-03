# Plano: Biblioteca de Templates (Pro+)

## Objetivo
Criar uma nova aba "Templates" no dashboard com uma galeria de templates visuais pré-definidos (cores, fontes, estilo de cards). O usuário escolhe um template e ele é aplicado ao seu workspace, mantendo toda a estrutura de personalização atual (capa, logo, conteúdo dos cards). A biblioteca é exclusiva para planos **Pro ou superior** — usuários Free veem a galeria com cadeado e CTA de upgrade.

## Templates propostos (nomes seguros, sem marca registrada)
Verifiquei os nomes das suas imagens — alguns como "Pop Art", "Game" e "Boho" são genéricos/descritivos e seguros. "Santorini" também é nome geográfico (livre). Para evitar qualquer ambiguidade, proponho esta nomenclatura final:

| # | Template       | Estilo visual                                    |
|---|----------------|--------------------------------------------------|
| 1 | Boho Fun       | Verde-água + bege quente, cards arredondados     |
| 2 | Pop Vibes      | Laranja vibrante + azul, cards coloridos         |
| 3 | Arcade         | Roxo gamer + amarelo neon                        |
| 4 | Jungle         | Verde floresta + creme, atmosfera natural        |
| 5 | Serene Coast   | Bege areia + coral, oceânico suave               |
| 6 | Coastal Boho   | Teal escuro + coral, praiano sofisticado         |
| 7 | Studio Minimal | Branco + cinza, ultra-minimalista                |
| 8 | Aegean         | Azul Egeu + branco (substitui "Santorini")       |
| 9 | Surf           | Branco + turquesa, leve e descontraído           |
| 10| Urban Oasis    | Bege quente + verde sálvia, urbano-natural       |
| 11| Modular        | Cinza claro + azul aço, contemporâneo            |
| 12| Monochrome     | Preto + branco, alto contraste                   |

(Nomes podem ser ajustados depois — os atuais "Clean / Dark / Luxury" continuam disponíveis como base.)

## Como funciona

1. **Nova rota `/app/templates`** acessível pelo menu lateral.
2. **Galeria** mostra cada template como card de preview (mock de celular renderizado em React, igual ao preview atual, com cores/fontes do template).
3. **Plano Free**: cards aparecem com overlay "🔒 Disponível no Pro" + botão "Fazer upgrade" (leva a `/app/billing`). Apenas os 3 templates atuais (Clean/Dark/Luxury) ficam liberados.
4. **Plano Pro+**: clicar em um template abre dialog "Aplicar este template?" → ao confirmar, atualiza o workspace.
5. **O que muda no workspace** ao aplicar:
   - `template` (chave do template)
   - `primary_color` e `secondary_color` (paleta do template)
   - Fonte (via tokens CSS por template)
   - Estilo dos cards (raio, borda, sombra)
   - **NÃO altera**: nome do workspace, logo, imagens das propriedades, conteúdo dos blocos. Tudo que o usuário já preencheu é preservado.
6. **Indicador "Aplicado"** no card do template ativo.

## Mudanças técnicas

### Banco
- Migration: expandir o tipo de `tenants.template` (atualmente texto/enum com 3 valores) para aceitar as novas chaves: `boho_fun`, `pop_vibes`, `arcade`, `jungle`, `serene_coast`, `coastal_boho`, `studio_minimal`, `aegean`, `surf`, `urban_oasis`, `modular`, `monochrome` (mantendo `clean`/`dark`/`luxury`).

### Frontend
- **`src/lib/templates.ts`** (novo): registro central com `{ key, name, tier: 'free'|'pro', colors:{primary,secondary}, fonts:{body,heading}, radius, preview }`.
- **`src/index.css`**: adicionar blocos `.guide-template-{key}` para cada novo template (tokens `--guide-bg`, `--guide-fg`, `--guide-card`, `--guide-radius`, `--guide-font`, `--guide-heading-font`). Importar fontes Google necessárias (ex.: Poppins, Quicksand, Press Start 2P para Arcade, Cormorant para Aegean).
- **`src/pages/dashboard/Templates.tsx`** (novo): galeria com grid responsivo. Cada card usa o `GuestPagePreview` existente em modo "mock" (mostra hero + 6 ícones de exemplo) com a classe do template aplicada. Lock overlay para Free.
- **`src/components/templates/TemplatePreviewCard.tsx`** (novo): renderiza miniatura + nome + badge de tier + estado "Aplicado".
- **`src/App.tsx`**: registrar rota `/app/templates`.
- **`src/components/layout/AppShell.tsx`**: adicionar item "Templates" no menu (com ícone Palette/Sparkles).
- **`src/pages/dashboard/Settings.tsx`**: substituir o seletor "Template" por um link "Ver biblioteca de templates →" que leva à nova aba (cores primária/secundária continuam editáveis manualmente).
- **`src/hooks/useTenant.tsx`** já expõe `plan_code` — usar para gate.

### Gate de plano
- Lógica: `tier === 'free' || plan_code === 'free'` → bloqueado. Pro/Business/Enterprise → liberado. Implementado via helper `canUseProTemplates(tenant)`.

### Nomes — verificação de marca
- "Boho", "Pop", "Arcade", "Jungle", "Coastal", "Minimal", "Surf", "Modular", "Monochrome", "Urban Oasis" são termos descritivos genéricos — sem risco.
- Trocas feitas por segurança: **Santorini → Aegean** (Santorini é nome geográfico livre, mas Aegean é ainda mais neutro), **Pop Art → Pop Vibes** (Pop Art é movimento artístico mas "Pop Art Studio®" existe como marca registrada em alguns países), **Game Theme → Arcade** (mais original).

## Fora de escopo (pode vir depois)
- Editor para o usuário criar templates próprios.
- Templates com layouts estruturalmente diferentes (ex.: lista vertical em vez de grid). Por ora todos seguem o layout atual; só mudam tokens visuais.
- Upload de fontes customizadas pelo usuário.

## Confirmação necessária
1. Topo: confirma os **nomes** propostos? Quer ajustar algum?
2. Quer que eu mantenha **Clean/Dark/Luxury** como "Básicos (Grátis)" e os 12 novos como "Pro", ou reorganizar?
