# Copiar e colar blocos entre páginas

Permitir que, no editor de uma página de guia, o usuário copie todos os blocos salvos e cole em uma página de outro imóvel (ou do mesmo), facilitando replicar conteúdos como Wi-Fi, regras, dicas, etc.

## Fluxo de uso

1. No editor (`PageEditor`), no header, novos botões:
   - **Copiar blocos**: copia todos os blocos atuais da página para um "clipboard" interno (persistido em `localStorage`, escopado por tenant).
   - **Colar blocos**: aparece habilitado quando há algo no clipboard. Abre um diálogo de confirmação mostrando origem (imóvel + página), quantidade de blocos, e duas opções:
     - **Substituir**: apaga blocos atuais e cola os copiados.
     - **Adicionar ao final**: mantém os atuais e adiciona os copiados depois.
2. Após colar, os blocos são salvos automaticamente no banco e o editor recarrega.

O clipboard fica disponível entre páginas/imóveis na mesma sessão do navegador, então o usuário copia em um imóvel e navega até outro para colar.

## Detalhes técnicos

### Estrutura do clipboard (localStorage)

Chave: `blocks-clipboard:<tenant_id>`

```ts
{
  copiedAt: string;           // ISO date
  sourcePropertyId: string;
  sourcePropertyName: string;
  sourcePageKey: string;
  sourcePageTitle: string;
  blocks: Array<{
    type: BlockType;
    data: any;
    position: number;
  }>;
}
```

Apenas `type`, `data`, `position` são copiados — IDs e `page_id` são descartados (serão regenerados ao colar).

### Mudanças em `src/pages/dashboard/PageEditor.tsx`

- Adicionar dois botões no header (`Copiar` e `Colar`), com ícones `Copy` / `ClipboardPaste` do lucide.
- `Copiar`: serializa `localBlocks` (sem ids) + metadados da página/imóvel atuais para o localStorage. Toast de confirmação.
- `Colar`: lê o clipboard; se vazio, botão desabilitado. Se o conteúdo for da própria página atual, ainda permite (útil para duplicar).
- Diálogo de confirmação (`AlertDialog`) com:
  - Resumo: "X blocos copiados de [Imóvel] / [Página] em [data]".
  - Dois botões de ação: "Substituir tudo" e "Adicionar ao final".
- Ao confirmar:
  - Gera novos `id` temporários (`tmp-<uuid>`) para cada bloco colado.
  - Atualiza `localBlocks` conforme o modo escolhido e chama `persistBlocks` imediatamente para já gravar no banco.
- Feedback via `sonner`.

### Considerações

- **Mídia (imagens/vídeos)**: as URLs apontam para arquivos no Storage que pertencem ao tenant atual. Como a cópia é dentro do mesmo tenant (clipboard escopado por `tenant_id`), as URLs continuam acessíveis. Não é necessário re-upload.
- **Sem mudanças no banco**: `content_blocks` já tem `page_id` desacoplado e `persistBlocks` substitui todos os blocos da página, então o fluxo atual cobre tudo.
- **Cross-tenant**: o clipboard é escopado por tenant, então um super_admin não mistura conteúdo de tenants diferentes acidentalmente.
- **Limite de tamanho**: localStorage suporta ~5MB; o conteúdo de blocos é só JSON com URLs (não binários), bem dentro do limite.

## Arquivos alterados

- `src/pages/dashboard/PageEditor.tsx` — botões, diálogo, lógica de copiar/colar.

Nenhuma migração de banco é necessária.
