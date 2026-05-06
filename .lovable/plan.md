## Ajustes no ShaderBackground

Arquivo: `src/components/ui/shader-background.tsx`

1. **Velocidade**: alterar `overallSpeed` de `0.15` → `0.08` (linha 21).
2. **Transparência (~30% mais suave)**: reduzir o alpha final do fragment shader em ~30%:
   - `lineStrength`: clamp máximo `0.22` → `0.154`
   - alpha base do `fragColor`: `0.04 * verticalFade + lineStrength` clampado a `0.24` → `0.028 * verticalFade + lineStrength` clampado a `0.168`

Sem mudanças em cores, layout ou outros arquivos.