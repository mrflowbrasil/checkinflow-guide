# Upload de vídeos no bloco "Vídeo"

Adicionar a opção de **enviar um arquivo de vídeo** (`.mp4` / `.webm`) ao bloco de vídeo, mantendo o suporte atual ao YouTube. Limite de **50 MB por arquivo** (alinhado ao limite padrão do Storage do Supabase via SDK).

## Como vai funcionar

**No editor do bloco (dashboard)**
- O bloco "Vídeo" passa a ter duas abas:
  - **YouTube** — comportamento atual (cola o link, mostra preview do iframe)
  - **Upload** — botão de upload com seletor de arquivo
- Validações antes do upload:
  - Tipo aceito: `video/mp4` ou `video/webm`
  - Tamanho máximo: **50 MB** (mensagem clara em português se exceder)
- Durante o upload: spinner + estado desabilitado
- Após upload: prévia do vídeo já reproduzindo, com opção "Trocar vídeo" ou remover

**Na página pública do hóspede**
- Se `source = "youtube"` → renderiza o iframe do YouTube (igual hoje)
- Se `source = "upload"` → renderiza um `<video controls>` nativo com:
  - `preload="metadata"` (não baixa o vídeo até o hóspede dar play — economiza dados móveis)
  - `playsInline` (importante para iOS)
  - `className` responsivo arredondado, ocupando 100% da largura

## Onde os arquivos serão guardados

No bucket público `block-media` (mesmo bucket usado hoje pelas imagens), em `videos/{tenantId}/{uuid}.{ext}`. Sem necessidade de migration — o bucket já existe, é público e tem as policies corretas.

## Detalhes técnicos

**Arquivos alterados:**

1. `src/lib/blocks.ts`
   - Estender `VideoData`: `{ url: string; source?: "youtube" | "upload"; mime?: string }`
   - `defaultDataFor("video")` retorna `{ url: "", source: "youtube" }`

2. `src/components/blocks/BlockEditor.tsx`
   - Substituir o `case "video"` atual por um novo `<VideoBlockBody>` com `<Tabs>` (YouTube | Upload)
   - Aba Upload: input `accept="video/mp4,video/webm"`, validação de `f.type` e `f.size > 50 * 1024 * 1024`, upload via `supabase.storage.from("block-media").upload(...)`, salva `{ url, source: "upload", mime: f.type }`
   - Toasts em PT-BR para erros (tipo inválido, tamanho excedido, falha de upload)

3. `src/components/blocks/BlockRenderer.tsx`
   - No `case "video"`: se `source === "upload"` (ou URL não casa com YouTube), renderiza:
     ```tsx
     <video src={url} controls preload="metadata" playsInline
            className="w-full rounded-xl bg-black aspect-video" />
     ```
   - Senão, mantém o iframe do YouTube atual

**Constante compartilhada:** `MAX_VIDEO_MB = 50` exportada de `src/lib/blocks.ts` para uso no editor e nas mensagens.

## Limites e custos (para sua ciência)

- **50 MB por arquivo** = ~1-2 min em 1080p ou 3-4 min em 720p
- Plano gratuito do backend inclui 1 GB de storage (≈ 20 vídeos de 50 MB) e 5 GB de banda/mês
- Para vídeos mais longos, continue recomendando YouTube (sem custo de storage e streaming otimizado)

## Fora do escopo

- Compressão/transcodificação automática no servidor
- Upload "resumable" para arquivos > 50 MB
- Geração automática de thumbnail (o navegador já mostra o primeiro frame)
