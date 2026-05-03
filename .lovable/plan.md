## Ajustar bloco "Linha divisória" no guia do hóspede

Atualmente a linha está com `my-2` (espaçamento mínimo) e cor com apenas 15% de opacidade sobre o fundo, ficando praticamente invisível — ainda mais porque o container externo já aplica `space-y-5` entre blocos, anulando boa parte da margem.

### Mudança

Em `src/components/blocks/BlockRenderer.tsx`, no `case "divider"`:

- Aumentar o espaçamento vertical de `my-2` para `my-6` (acima e abaixo da linha), criando uma respiração clara entre os tópicos.
- Aumentar a opacidade da linha de `0.15` para `0.25`, mantendo a sutileza mas garantindo visibilidade nos três templates (clean, dark, luxury).
- Manter `h-px` (1px) para preservar o aspecto delicado.
- Limitar a largura a ~60% e centralizar (`mx-auto max-w-[60%]`) para reforçar visualmente que é um separador de seção, não uma borda de bloco.

### Resultado esperado

Entre o botão e a imagem aparecerá uma linha fina, centralizada, com bom espaço acima e abaixo, separando claramente os dois tópicos sem competir visualmente com o conteúdo.

### Arquivo alterado

- `src/components/blocks/BlockRenderer.tsx`

Nenhuma mudança no editor ou no banco.