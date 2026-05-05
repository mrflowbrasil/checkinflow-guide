# Substituir imagens do carrossel por uploads do usuário

## O que será feito

1. **Copiar as 4 imagens enviadas** para `src/assets/carrossel/`:
   - `user-uploads://Hub1.webp` → `src/assets/carrossel/hub-1.webp`
   - `user-uploads://Hub2.webp` → `src/assets/carrossel/hub-2.webp`
   - `user-uploads://Hub3.webp` → `src/assets/carrossel/hub-3.webp`
   - `user-uploads://Hub4.webp` → `src/assets/carrossel/hub-4.webp`

2. **Editar `src/components/ui/image-auto-slider.tsx`**:
   - Importar as 4 imagens como módulos ES (`import hub1 from "@/assets/carrossel/hub-1.webp"` etc.)
   - Substituir o array `DEFAULT_IMAGES` (atualmente Unsplash) pelos 4 imports locais
   - Aumentar `durationSeconds` de `30` para `50` (animação mais lenta e suave)
   - Manter a prop `images` opcional para overrides futuros

## Observação

Como são apenas 4 imagens (poucas), a duplicação interna (`[...images, ...images]`) garante o loop infinito sem salto, mas você verá cada imagem repetir mais rápido na tela. Se quiser, depois você pode mandar mais imagens para deixar o ciclo mais variado.

## Arquivos afetados

- **Criar**: `src/assets/carrossel/hub-1.webp`, `hub-2.webp`, `hub-3.webp`, `hub-4.webp`
- **Editar**: `src/components/ui/image-auto-slider.tsx`
