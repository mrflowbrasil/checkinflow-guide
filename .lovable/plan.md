## Plano: substituir vídeo completo pelo teaser curto na seção VideoCriacao

### Contexto
Hoje `src/components/lp/VideoCriacao.tsx` usa `@/assets/primeiro-imovel.mp4.asset.json` (vídeo de 3:50, ~98 MB). Precisamos trocar pelo teaser curto (30–60s), mantendo layout, textos, bullets e botões intactos.

### Passos

1. **Preparar o slot do teaser no componente**
   - Em `src/components/lp/VideoCriacao.tsx`:
     - Remover o import `teaserVideo from "@/assets/primeiro-imovel.mp4.asset.json"`.
     - Adicionar `import teaserVideo from "@/assets/lp/primeiro-imovel-teaser.mp4.asset.json"` (novo asset pointer).
     - Manter `VIDEO_SRC = teaserVideo.url`.
     - Manter atributos do `<video>`: `controls`, `playsInline`, `preload="metadata"`, **sem** `autoPlay`/`muted`.
     - Adicionar suporte a `poster` opcional: nova constante `const POSTER_SRC: string | undefined = undefined;` (preparada para receber um asset depois) e renderizar `poster={POSTER_SRC}` no `<video>`.

2. **Receber o arquivo do teaser**
   - O usuário precisa anexar `primeiro-imovel-teaser.mp4` (30–60s) no chat. Quando vier:
     - `mkdir -p src/assets/lp`
     - `lovable-assets create --file /mnt/user-uploads/primeiro-imovel-teaser.mp4 --filename primeiro-imovel-teaser.mp4 > src/assets/lp/primeiro-imovel-teaser.mp4.asset.json`
   - Caso o usuário queira poster, mesmo fluxo gerando `src/assets/lp/primeiro-imovel-teaser-poster.jpg.asset.json` e preenchendo `POSTER_SRC`.

3. **Limpar o asset antigo (opcional, recomendado)**
   - Após confirmar que o teaser está no ar, apagar `src/assets/primeiro-imovel.mp4.asset.json` via `assets--delete_asset` para liberar os ~98 MB do CDN. (Só executar se o usuário confirmar — vídeo longo pode ser reaproveitado no botão "Ver vídeo completo".)

### O que NÃO muda
- Layout do mockup MacBook, grid, textos, bullets, CTAs e link do YouTube permanecem exatamente como estão.

### Perguntas para confirmar antes de implementar
1. Você já tem o `primeiro-imovel-teaser.mp4` para enviar agora, ou prefere que eu deixe o componente preparado e o player quebrado até o arquivo chegar?
2. Vai enviar um poster/thumb (imagem JPG/PNG)? Se não, deixo sem poster (o `preload="metadata"` mostra o primeiro frame).
3. Posso deletar o `primeiro-imovel.mp4` antigo do CDN, ou quer mantê-lo (por exemplo para outro uso)?
