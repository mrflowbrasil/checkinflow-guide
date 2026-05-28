## Diagnóstico

O `ShaderBackground` (`src/components/ui/shader-background.tsx`) detecta `prefers-reduced-motion: reduce` e, quando verdadeiro:

1. Fixa `iTime = 0` no shader (linha ~149).
2. No final do `render`, **não** agenda o próximo frame (`if (!reduced && visible && inView) requestAnimationFrame(...)` — linhas ~157–161).

Resultado: renderiza 1 frame e para → o fundo aparece totalmente estático.

Provavelmente seu SO/navegador está com "reduzir movimento" ativo (macOS: Acessibilidade → Exibição → Reduzir movimento; ou DevTools → Rendering → Emulate CSS prefers-reduced-motion). Isso explica por que está estático na home (`Index.tsx`), no `WelcomeHubLanding` e nas landings SEO — todos usam o mesmo componente.

## Correção proposta

A animação já é extremamente sutil (`overallSpeed = 0.05`, alpha máximo ~0.13, opacidade do canvas 0.75). Não há ganho real em acessibilidade em congelá-la — é praticamente um ruído ambiente. Vou remover o "freeze" do reduced-motion mantendo as outras pausas (aba oculta / fora da viewport):

1. Em `src/components/ui/shader-background.tsx`:
   - Remover a checagem `reduced` (manter `matchMedia` opcional ou remover de vez).
   - `iTime` sempre baseado em `performance.now()`.
   - Loop continua enquanto `visible && inView`.
2. Não mexer em `Index.tsx`, `WelcomeHubLanding.tsx` nem `SeoLandingLayout.tsx` — só o componente do shader.

## Verificação

- Abrir `/` no preview e confirmar movimento das linhas.
- Em DevTools → Rendering, ativar `prefers-reduced-motion: reduce` e confirmar que continua animando.
- Trocar de aba e voltar → loop deve retomar (pausa por `visibilitychange` mantida).
