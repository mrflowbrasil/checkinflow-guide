## Plano: integrar o vídeo `primeiro-imovel.mp4` na seção VideoCriacao

1. **Registrar o vídeo como Lovable Asset** (sem copiar o binário para o repo):
   ```bash
   mkdir -p src/assets
   lovable-assets create --file /mnt/user-uploads/primeiro-imovel.mp4 \
     --filename primeiro-imovel.mp4 > src/assets/primeiro-imovel.mp4.asset.json
   ```

2. **Atualizar `src/components/lp/VideoCriacao.tsx`**:
   - Importar o pointer: `import teaserVideo from "@/assets/primeiro-imovel.mp4.asset.json";`
   - Trocar a constante `VIDEO_SRC` por `teaserVideo.url`
   - Remover o caminho placeholder `/videos/teaser-criacao.mp4`
   - Adicionar `poster` opcional só se necessário (deixar sem por enquanto — `preload="metadata"` já mostra um primeiro frame em browsers modernos)

3. **Não mexer em mais nada** — layout, CTAs, mockup e link do YouTube continuam como estão (o YouTube ainda é placeholder, conforme combinado).

Pronto para implementar.