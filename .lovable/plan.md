## 1. Fechar a caixa de seleção de blocos ao escolher um tipo

**Problema:** o `Popover` em `src/pages/dashboard/PageEditor.tsx` (linhas 373–382) que envolve o `AddBlockMenu` permanece aberto após o clique em um tipo de bloco, atrapalhando a digitação.

**Solução:** transformar o Popover em controlado (`useState` para `open`) e fechá-lo dentro do callback `onAdd` logo após adicionar o bloco.

```tsx
const [addOpen, setAddOpen] = useState(false);
...
<Popover open={addOpen} onOpenChange={setAddOpen}>
  ...
  <PopoverContent className="w-80 p-0" align="start">
    <AddBlockMenu onAdd={(t) => { addBlock(t); setAddOpen(false); }} />
  </PopoverContent>
</Popover>
```

Mudança pontual, sem efeitos colaterais.

---

## 2. Formatação no bloco "Texto" (negrito, itálico, sublinhado)

**Estado atual:** o bloco `text` usa um `<Textarea>` simples e o `BlockRenderer` exibe `block.data.content` como texto puro. Não há suporte a marcação.

**Proposta:** adicionar suporte usando **Markdown leve** (sem biblioteca pesada), pois é a opção mais segura, leve e mantém compatibilidade com os textos já existentes.

### Editor (`src/components/blocks/BlockEditor.tsx`)
- Acima do `<Textarea>` do bloco `text`, adicionar uma pequena barra com 3 botões (ícones `Bold`, `Italic`, `Underline` do lucide-react).
- Cada botão envolve a seleção atual no textarea com a marcação correspondente:
  - **Negrito:** `**texto**`
  - *Itálico:* `*texto*`
  - <u>Sublinhado:</u> `<u>texto</u>` (markdown puro não tem sublinhado; usaremos a tag `<u>` que é renderizada com segurança)
- Atalhos de teclado opcionais: Ctrl/Cmd+B, Ctrl/Cmd+I, Ctrl/Cmd+U.

### Renderer (`src/components/blocks/BlockRenderer.tsx`)
- Criar um helper `renderInlineFormatted(content: string)` que:
  1. Faz **escape** de HTML (evita XSS).
  2. Converte `**...**` → `<strong>...</strong>`.
  3. Converte `*...*` (ou `_..._`) → `<em>...</em>`.
  4. Converte `<u>...</u>` (escapado) de volta para `<u>...</u>` real.
  5. Converte quebras de linha `\n` em `<br/>`.
- Renderizar via `dangerouslySetInnerHTML` **apenas após o escape**, garantindo que nenhuma outra tag HTML do usuário passe.
- Aplicar o mesmo helper no preview ao vivo (`GuestPagePreview` usa o mesmo `BlockRenderer`, então cobre os dois lados).

### Compatibilidade
- Textos antigos sem marcação continuam exibidos normalmente (nenhum `*` ou `**` → renderiza igual).
- Não muda o schema do banco: continua salvando `data.content` como string.

### Fora do escopo
- Não vou adicionar bibliotecas de rich-text (Tiptap, Slate, etc.) para manter o bundle leve. Se preferir um editor WYSIWYG completo (com toolbar flutuante, listas, links, etc.), posso propor isso em uma segunda iteração.

---

## Perguntas

1. Confirma a abordagem de **Markdown leve** com toolbar (negrito/itálico/sublinhado) ou prefere um editor WYSIWYG completo (mais pesado, mas com experiência tipo Word/Notion)?
2. Quer aplicar a mesma formatação também no bloco **Caixa de dica** (`tip`), que hoje também é texto puro?
