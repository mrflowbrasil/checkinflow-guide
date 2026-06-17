## Novo bloco: Card (imagem + texto + botão)

Sim, é totalmente viável. Vou criar um novo tipo de bloco chamado **`card`** que combina, em um único container, uma imagem com texto e (opcionalmente) um botão, com opção de alternar o lado da imagem.

### Estrutura do bloco

Campos editáveis no editor:
- **Imagem**: upload via o mesmo fluxo do bloco Imagem atual (storage do tenant).
- **Formato da imagem**: `circle` (redondo) ou `rounded` (quadrado com bordas arredondadas).
- **Posição da imagem**: `left` ou `right` (no mobile fica sempre acima do texto, para legibilidade).
- **Título** (opcional, curto).
- **Texto** (parágrafo, com a mesma toolbar de formatação inline já usada nos blocos de texto: negrito, itálico, sublinhado).
- **Botão** (opcional, mesmo modelo do bloco Botão atual):
  - Label
  - Ação: `link`, `copy` ou `download`
  - Valor (URL / texto a copiar / URL do arquivo)

### Onde encaixa no sistema

1. **`src/lib/blocks.ts`**
   - Adicionar `"card"` em `BlockType`.
   - Tipar `CardData` com os campos acima (reusando `ButtonData` opcional).
   - `BLOCK_LABELS.card = "Card (imagem + texto)"`.
   - `defaultDataFor("card")` com valores neutros (`imageShape: "rounded"`, `imagePosition: "left"`, sem botão).

2. **`src/components/blocks/BlockEditor.tsx`** (menu "Adicionar bloco" + editor por tipo)
   - Adicionar entrada no `AddBlockMenu` com ícone próprio (ex.: `LayoutPanelLeft` do lucide).
   - Criar `CardBlockEditor`:
     - Upload de imagem (reaproveitando o componente/util do bloco Imagem).
     - Toggle de formato (Redondo / Arredondado) — botões segmentados.
     - Toggle de posição (Imagem à esquerda / direita).
     - Input de título + textarea com a toolbar inline já usada.
     - Seção "Botão" colapsável: switch para ativar; quando ativo, reaproveita os mesmos campos do editor do bloco Botão.

3. **`src/components/blocks/BlockRenderer.tsx`** (renderização no guia público)
   - Novo `CardBlock`:
     - Container `rounded-2xl border bg-card p-4 sm:p-5 flex flex-col sm:flex-row gap-4` com `sm:flex-row-reverse` quando `imagePosition === "right"`.
     - Imagem com `aspect-square w-28 sm:w-32 object-cover` + `rounded-full` (circle) ou `rounded-xl` (rounded).
     - Título com classe de subtítulo já usada; texto com `inline-format` (mesmo helper dos outros blocos) preservando quebras de linha.
     - Botão, se ativo, renderizado pelo mesmo componente do bloco Botão (mesmas ações: copy, download, link) respeitando as cores do template (`cta` / `cta-text`).

4. **`src/components/guest/GuestPagePreview.tsx`**
   - Como o preview reusa o mesmo renderer, deve funcionar sem mudanças. Verifico após implementar.

5. **Compatibilidade com templates**
   - Usa apenas tokens semânticos (`bg-card`, `text-fg`, `border-border`, `--cta`/`--cta-text`) — respeita a convenção de 5 cores dos templates já registrada na memória do projeto.

6. **Sem migração de banco**
   - `content_blocks.data` é JSONB e `type` é texto livre no app, então não há mudança de schema. Blocos antigos continuam funcionando.

### Comportamento responsivo

- Desktop/tablet: imagem e texto lado a lado, na ordem escolhida.
- Mobile (< sm): imagem centralizada acima do texto (padrão de leitura mais confortável que metade-metade em telas estreitas). Posso, se preferir, manter sempre lado-a-lado também no mobile — me diga depois de aprovar o plano.

### Fora do escopo deste plano

- Reordenar/converter blocos antigos para o novo formato.
- Múltiplas imagens dentro do mesmo card (galeria) — pode virar bloco próprio depois.
- Variantes pré-prontas (ex.: "depoimento", "destaque") — todas resolvidas pelo mesmo bloco via configurações.

Posso seguir com a implementação?
