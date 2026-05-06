## Plano: Shader background sutil no hero

Sim, é totalmente viável. O componente é um shader WebGL standalone (canvas fullscreen com `requestAnimationFrame`). Vou adaptá-lo para:

1. Funcionar como **camada de fundo absoluta** dentro do hero (não fullscreen na window).
2. Usar a **paleta atual** do hero (`#020617` → `#0a1f2e` → `#062a33` com brilho ciano `#00FFFF`/teal `#008C8E`).
3. Ficar **sutil**: linhas com baixa opacidade, velocidade reduzida, amplitude menor — apenas como movimento ambiente.

### Arquivos

**Novo:** `src/components/ui/shader-background.tsx`
- Componente TS (não JS) com tipagem correta para WebGL.
- Canvas com `position: absolute; inset: 0; width: 100%; height: 100%`, dimensionado pelo container pai (não `window.innerWidth`) via `ResizeObserver`.
- Cleanup completo: cancela `requestAnimationFrame`, deleta shaders/program/buffer ao desmontar.
- Detecção de WebGL ausente → retorna `null` silenciosamente (preserva o gradiente CSS atual como fallback).
- Prop opcional `className` para estilização externa.

**Editado:** `src/pages/Index.tsx`
- Envolver o bloco hero (header + section) num wrapper `relative` com o gradiente atual no `style`.
- Inserir `<ShaderBackground className="absolute inset-0 opacity-40 pointer-events-none mix-blend-screen" />` atrás do conteúdo.
- Header e section ganham `relative z-10` para ficar acima do canvas.

### Ajustes de paleta no fragment shader

| Constante original | Novo valor | Motivo |
|---|---|---|
| `bgColor1 = vec4(0.1, 0.1, 0.3, 1.0)` | `vec4(0.008, 0.024, 0.045, 1.0)` (#020617) | combinar com fundo atual |
| `bgColor2 = vec4(0.3, 0.1, 0.5, 1.0)` | `vec4(0.024, 0.165, 0.2, 1.0)` (#062a33) | tom teal escuro |
| `lineColor = vec4(0.4, 0.2, 0.8, 1.0)` | `vec4(0.0, 0.55, 0.56, 1.0)` (teal #008C8E) | acento da marca |
| `gridColor = vec4(0.5)` | `vec4(0.0, 1.0, 1.0, 0.15)` | grid quase invisível em ciano |

### Ajustes de sutileza

- `overallSpeed`: `0.2` → `0.08` (movimento bem lento).
- `lineAmplitude`: `1.0` → `0.5`.
- `maxLineWidth`: `0.2` → `0.08`.
- `linesPerGroup`: `16` → `8` (menos densidade + menos GPU).
- Saída final: multiplicar `lines` por `0.5` antes de somar ao bg, para não competir com o conteúdo.
- Wrapper externo com `opacity-40` + `mix-blend-screen` reforça a integração suave com o gradiente CSS existente.

### Considerações

- O shader roda na GPU — custo baixo em desktops, mas vou adicionar `prefers-reduced-motion: reduce` → não inicia o loop (mantém só o gradiente estático).
- Sandbox de preview pode não ter WebGL; o fallback silencioso garante que o hero continua bonito.
- Sem mudanças no design system / tokens — apenas presentação no hero.