# Animações de entrada na landing page

Adicionar fade + leve subida (translateY) quando elementos entram na viewport, usando apenas CSS + IntersectionObserver, com respeito a `prefers-reduced-motion`.

## 1. Utilitário CSS global (`src/index.css`)

Adicionar uma classe `reveal` e um modificador `reveal-in`:

```css
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 600ms cubic-bezier(0.22, 1, 0.36, 1),
              transform 600ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
}
.reveal.reveal-in {
  opacity: 1;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

Sem nova lib. Apenas `opacity` e `transform` — sem layout thrashing.

## 2. Hook `useReveal` (`src/hooks/useReveal.tsx`, novo)

- Cria um único `IntersectionObserver` compartilhado (lazy), `rootMargin: "0px 0px -10% 0px"`, `threshold: 0.1`.
- `data-reveal-delay` (ms) opcional → aplica `transition-delay` inline.
- Ao intersectar, adiciona `reveal-in` e faz `unobserve` (anima uma vez).
- Componente helper `<Reveal as="div" delay={0} className="...">children</Reveal>` que aplica `.reveal` e registra no observer via `ref`.
- Se `matchMedia('(prefers-reduced-motion: reduce)').matches`, o hook não observa e marca como visível imediatamente.

## 3. Aplicação nas seções da landing

Envolver/marcar elementos com `<Reveal>` (ou `className="reveal"` + `ref`):

- `src/pages/WelcomeHubLanding.tsx`: hero (badge, h1, subtítulo, CTAs, mockup), seções de planos, depoimentos e blocos de conteúdo.
- `src/components/lp/ParaQuemE.tsx`: header + cards (delay escalonado 0/80/160/240ms; teto 240ms).
- `src/components/lp/Funcionalidades.tsx`: header + cards com delay escalonado.
- `src/components/lp/VideoCriacao.tsx`: badge, h2, parágrafo, mockup, CTAs.
- `src/components/lp/GarantiaSection.tsx`: bloco principal.
- `src/components/lp/FaqSection.tsx`: header + cada item do accordion (delay escalonado ≤120ms entre itens).
- `src/components/ui/sticky-scroll-cards-section.tsx`: manter animações próprias do header; **não** envolver os cards sticky para não conflitar com o efeito de pilha.

Delay progressivo entre cards: **80ms por item, máximo 240ms** (mantém dentro da faixa pedida 100–150ms entre pares, sem somar atrasos longos).

## 4. Performance

- Hero **não** recebe `.reveal` no badge/H1/subtítulo se quebrar LCP? → manter animação só com `opacity/transform`, que não bloqueiam render; o LCP (mockup) também recebe `.reveal`, mas com `transition` curta — aceitável. Alternativa segura: hero anima **on mount** via CSS keyframe (sem IO) para garantir disparo imediato no primeiro paint. **Vou usar a abordagem on-mount na hero** (classe `reveal-now` adicionada via `useEffect` no mount) e IntersectionObserver no restante. Isso evita esperar o IO no above-the-fold.
- Sem mudanças em libs. Sem mudança de bundle relevante (~1KB).

## 5. Acessibilidade

- `prefers-reduced-motion: reduce` curto-circuita no CSS e no hook.
- Sem mudanças de foco, ordem do DOM ou contraste.

## Fora de escopo

- Reordenar seções, alterar conteúdo/copy, animar componentes do dashboard, animações de hover novas, parallax.
