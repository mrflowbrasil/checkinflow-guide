## Alterações propostas em `src/pages/WelcomeHubLanding.tsx`

### 1. Ocultar `ProblemSection`
Remover `<ProblemSection />` do JSX principal (linha 818). A função fica no arquivo (sem uso), pra facilitar reativar depois se quiser. Como o `StickyFeatureSection` (cards) já entrega a mesma narrativa de dores/solução, a página ganha respiro e o "grude visual" some.

### 2. Fundos claros ciano em 4 seções
Aplicar um fundo claro consistente (tom ciano suave) nas seções:
- `RealDemoPreview`
- `FeaturesSection`
- `AudienceSection`
- `PricingSection`

Padrão visual (mesmo em todas, pra não virar arco-íris):
- Fundo: `bg-[#E6FBFC]` (ciano muito claro) com borda superior/inferior sutil `border-y border-[#00FFFF]/20`
- Texto base: trocar `text-[#F8FAFC]/CBD5E1` por `text-slate-900` / `text-slate-700`
- Badges e títulos: manter accent `#00FFFF`/`#0E7490` mas com contraste em fundo claro (ex: `bg-[#00FFFF]/15 text-[#0E7490] border-[#0E7490]/30`)
- Cards internos escuros (`bg-[#111827]`) viram claros (`bg-white border-[#00FFFF]/30 shadow-sm`), exceto o card Pro do `PricingSection` que mantém o destaque escuro com glow cyan (criando o contraste do "mais popular" dentro da seção clara — fica ainda mais forte visualmente).

Resultado: 4 "ilhas claras" intercaladas com o resto escuro + shader animado → ritmo claro/escuro, página mais clean e o shader respira nos blocos escuros (Hero, HowItWorks, FAQ, CTA).

### 3. Menu superior
- Renomear o item **"Demo"** (centro) → ocultar (remover do `navItems`), já que existe o CTA "Ver demo" no canto direito.
- Trocar o item **"Benefícios"** para apontar para a seção dos cards (`StickyFeatureSection`). Como ela não tem `id`, adicionar `id="beneficios"` no wrapper `<section>` do componente em `src/components/ui/sticky-scroll-cards-section.tsx` (linha do `<section className="w-full bg-white...">`) e atualizar `href="#beneficios"` no menu pra cair lá.
- Mesmo ajuste no footer (linhas 781–783): remover link "Demo", manter "Benefícios" → `#beneficios`.

### Arquivos afetados
- `src/pages/WelcomeHubLanding.tsx` (remoção do `ProblemSection`, classes de fundo/texto em 4 seções, navItems, footer)
- `src/components/ui/sticky-scroll-cards-section.tsx` (adicionar `id="beneficios"` na `<section>`)

Nenhuma mudança em rotas, dados ou backend.

---

### Vai melhorar o visual? Minha leitura

Sim, com ressalvas:

**Prós**
- Quebra a "parede escura" atual. Hoje tudo é dark + shader, então o olho cansa e a hierarquia some.
- Ritmo claro→escuro→claro guia a leitura e dá destaque natural ao Pro (escuro dentro de seção clara = chama atenção sem precisar de mais badges).
- Ocultar `ProblemSection` remove redundância com os cards sticky.

**Riscos a observar**
- Se as 4 seções claras forem **consecutivas demais**, vira o oposto (parede clara). Pela ordem atual ficam intercaladas com `HowItWorks`, `Integrations`, `ValueSection` (escuras) — o ritmo funciona.
- O shader animado some atrás das seções claras. Isso é desejado (deixa o shader como "respiro" entre blocos), mas reduz a presença do efeito. Se você quer o shader sempre visível, melhor usar fundo **semi-transparente** (`bg-[#E6FBFC]/85 backdrop-blur-sm`) em vez de sólido.
- Componentes internos (cards, ícones, gradientes cyan→green) precisam ser revisados um a um pra não ficarem "lavados" sobre fundo claro. Vou ajustar caso a caso, não com regra única.

**Recomendação**: aplicar com fundo **semi-transparente** (`/85` + blur) pra manter o shader vivo. Se preferir sólido 100%, é só pedir e ajusto.