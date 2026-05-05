# Carrossel infinito de imagens na Home

## O que será feito

1. **Criar componente** `src/components/ui/image-auto-slider.tsx`
   - Carrossel horizontal com animação CSS infinita (scroll suave da direita para esquerda)
   - Máscara de gradiente nas laterais (fade-out) para efeito elegante
   - Hover com leve zoom + brilho em cada imagem
   - Aceita prop opcional `images?: string[]` — assim você troca facilmente a lista sem mexer no resto
   - Lista padrão de imagens já embutida (caso não passe nenhuma)

2. **Integrar na Home** (`src/pages/Index.tsx`)
   - Inserir `<ImageAutoSlider />` logo abaixo do botão "Começar grátis", ainda dentro da seção hero
   - Espaçamento `mt-12 lg:mt-16` para respirar bem
   - Sem fundo branco — fica transparente sobre o fundo escuro atual

## Como você vai trocar as imagens depois

Você terá **duas opções** equivalentes:

**Opção A — Editar o array padrão dentro do componente** (mais simples):
```tsx
// src/components/ui/image-auto-slider.tsx
const DEFAULT_IMAGES = [
  "https://sua-url-1.jpg",
  "https://sua-url-2.jpg",
  // ...
];
```

**Opção B — Passar via prop no Index.tsx** (sem tocar no componente):
```tsx
<ImageAutoSlider images={[
  "https://sua-url-1.jpg",
  "https://sua-url-2.jpg",
]} />
```

Recomendo usar URLs do Unsplash, Cloudinary, ou imagens dos próprios imóveis hospedadas no storage. Se quiser usar imagens locais, basta fazer upload para `src/assets/` e importar como ES module — eu ajusto o exemplo nos comentários do componente.

## Detalhes técnicos

- **Duplicação do array**: as imagens são duplicadas (`[...images, ...images]`) e a animação translada `-50%` em loop, criando o efeito infinito sem "salto".
- **Performance**: `loading="lazy"` em todas as imagens, animação puramente CSS (sem JS no loop).
- **Responsivo**: altura fixa em mobile (`h-32`) e maior em desktop (`h-48`), largura proporcional (`aspect-[4/3]`).
- **Estilos**: keyframes e máscara ficam encapsulados em `<style>` dentro do componente (igual ao snippet original) — sem precisar mexer em `index.css` ou `tailwind.config.ts`.
- **Velocidade**: animação de 30s por ciclo (mais suave que os 20s do snippet original); fácil de ajustar via constante.

## Arquivos afetados

- **Criar**: `src/components/ui/image-auto-slider.tsx`
- **Editar**: `src/pages/Index.tsx` (adicionar import + render do componente)
