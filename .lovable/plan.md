## Sim, é totalmente possível

Trocar o link externo do YouTube por um modal com o vídeo embedado (iframe) mantém o cliente na LP.

## Mudanças em `src/components/lp/VideoCriacao.tsx`

1. Adicionar `useState` para controlar abertura do modal (`videoOpen`).
2. Extrair o ID do vídeo da URL `https://youtu.be/l8SxORuMqLU` → `l8SxORuMqLU`.
3. Trocar o `<a href={YOUTUBE_URL} target="_blank">` por um `<button onClick={() => setVideoOpen(true)}>` mantendo exatamente o mesmo visual (classes atuais).
4. Adicionar `<Dialog>` (shadcn, já disponível) com `DialogContent` largo (`max-w-4xl`, `p-0`, fundo preto) contendo um `<iframe>` em wrapper `aspect-video`:
   - `src="https://www.youtube.com/embed/l8SxORuMqLU?autoplay=1&rel=0"` (autoplay só quando abrir, `rel=0` evita sugerir vídeos de outros canais)
   - `allow="accelerated-encoding; autoplay; encrypted-media; picture-in-picture"`
   - `allowFullScreen`
   - `title="Crie seu primeiro imóvel em menos de 5 minutos"`
5. Para garantir que o vídeo pare ao fechar o modal: renderizar o iframe condicionalmente (`{videoOpen && <iframe ... />}`), assim ao fechar o componente desmonta e o áudio/vídeo cessa.
6. Manter `DialogTitle` (com `sr-only`) para acessibilidade.

## O que NÃO muda

- Layout da seção, copy, vídeo teaser do MacBook, botão "Criar meu guia grátis", demais páginas.
- Constante `YOUTUBE_URL` pode ser mantida (usada para derivar o ID) ou substituída pelo ID direto.

## Observação

YouTube permite embed por padrão neste vídeo (não há restrição configurada conhecida). Se o dono do canal tiver desativado embed, o iframe mostraria erro — nesse caso o fallback seria voltar ao link externo. Posso adicionar tratamento de erro se quiser.
