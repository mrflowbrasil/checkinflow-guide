# Atualizar hero da home (`/`)

Mudanças em `src/pages/LpAnuncio.tsx` (seção hero, ~linhas 195-243):

1. **Substituir imagem do hero** pela `home2.webp` enviada.
   - Subir o arquivo via `lovable-assets create --file /mnt/user-uploads/home2.webp` gerando `src/assets/lp/home2.webp.asset.json`.
   - Trocar o `<picture>` atual (que usa `heroAvif/heroImg` em AVIF + WebP responsivo) por um `<img>` simples apontando para a nova asset. As variantes responsivas antigas (`heroAvif768`, `heroImg768`, `heroImg`) deixam de ser usadas no hero (mantidas no import caso ainda sejam referenciadas em outro lugar; remover se órfãs).

2. **Remover o "fundo" do container do hero**: tirar o wrapper com `rounded-[2rem] overflow-hidden shadow-... ring-1 ring-slate-200` e o glow `absolute -inset-4 bg-gradient-to-tr ...`. A nova imagem já tem composição própria (fundo creme + mockup + foto), então fica direto, sem moldura nem brilho atrás.

3. **Remover a imagem de destaque** (mockup pequeno rotacionado no canto superior direito — bloco `absolute -top-5 -right-5 ... heroMockupLifestyle`). Import de `heroMockupLifestyle` também removido se ficar órfão.

4. **Mover badge de avaliações para a direita**: o card "+ avaliações 5 estrelas!" muda de `-bottom-5 -left-5` para `-bottom-5 -right-5` (mantendo o mesmo visual e conteúdo).

Sem alterações de copy, links ou outras seções.
