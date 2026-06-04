## Otimizar avatares de depoimentos da /lp/anuncio

Os 3 avatares em `src/assets/lp/avatars/` são PNGs de ~2,5 MB cada (mislabeled `.jpg`), renderizados a 56×56 px — total ~7,8 MB desnecessários. Logos já estão otimizados (8-22 KB WebP).

### Passos

1. Baixar `denize.jpg`, `juliana.jpg`, `pablo.jpg` do CDN para `/tmp`.
2. Converter cada um para WebP 112×112 px (2× retina) com `cwebp -q 82`.
3. Re-upload via `lovable-assets create --filename <nome>.webp` gerando novos `src/assets/lp/avatars/<nome>.webp.asset.json`.
4. Atualizar imports em `src/pages/LpAnuncio.tsx` (linhas 34-36) de `.jpg.asset.json` para `.webp.asset.json`.
5. Deletar pointers antigos via `assets--delete_asset` (remove binário do CDN).
6. Verificar tamanhos finais.

### Resultado esperado
~7,8 MB → ~30 KB (≈99,6% de economia). Sem mudanças de markup, CSS, ou outras páginas.