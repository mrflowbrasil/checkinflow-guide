# Plano: nova seção VideoCriacao na LpAnuncio

## 1. Novo arquivo: `src/components/lp/VideoCriacao.tsx`

Componente self-contained, com:

- Container: `max-w-6xl mx-auto px-5 sm:px-8 py-16 lg:py-24`
- Card principal: `bg-white rounded-3xl border border-border shadow-sm p-6 sm:p-10 lg:p-14`
- Grid 2 colunas em `lg:grid-cols-2 gap-10 items-center`, 1 coluna no mobile

### Coluna esquerda
- **Badge** (estilo igual aos outros da LP — pill com bg accent-soft e texto accent): "Demonstração rápida"
- **Headline** (`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight`): "Crie seu primeiro imóvel em menos de 5 minutos"
- **Subheadline** (`text-muted-foreground text-lg`): texto fornecido
- **Lista de 5 bullets** com ícone `Check` do lucide-react em ciano (`text-accent`)
- **CTAs**:
  - Primário: "Criar meu guia grátis" → `<Link to="/auth">` com estilo do CTA primário da hero
  - Secundário: "Ver vídeo completo" → `<a href="[COLE_AQUI_O_LINK_DO_YOUTUBE]" target="_blank" rel="noopener noreferrer">` com variante outline
- **Microcopy** abaixo: "Sem cartão. Sem instalação. Seu hóspede acessa pelo navegador."

### Coluna direita — Mockup MacBook em CSS puro

Estrutura:
```text
┌─────────────────────────────┐   ← moldura superior (bezel preto, rounded-xl)
│  ┌───────────────────────┐  │
│  │      <video />        │  │   ← tela com vídeo, rounded-md, aspect-video
│  └───────────────────────┘  │
└─────────────────────────────┘
 ═════════════════════════════    ← base do notebook (faixa cinza com notch)
```

Implementação:
- Wrapper relativo com glow sutil (`bg-accent/20 blur-3xl` em pseudo-elemento atrás)
- "Tampa": `bg-slate-900 rounded-t-xl p-3 shadow-2xl` contendo `<video>` com `aspect-video w-full rounded-md object-cover bg-black`
- "Base": `bg-gradient-to-b from-slate-300 to-slate-400 h-2 rounded-b-lg` ligeiramente mais larga (negative margin ou width maior) com notch central
- Sombra suave abaixo (`shadow-2xl` + sombra ambiente via `after:` ou `drop-shadow`)

### Vídeo
```tsx
<video
  controls
  playsInline
  preload="metadata"
  className="w-full h-full rounded-md"
  src="/videos/teaser-criacao.mp4"
/>
```
- Aguardo o arquivo que será enviado no chat. Quando você anexar, salvarei em `public/videos/teaser-criacao.mp4` (ou via lovable-assets se for grande). Até lá, deixo o src apontando para esse caminho (vídeo aparece quebrado até o upload, mas o componente já fica pronto).

## 2. Editar `src/pages/LpAnuncio.tsx`

- Adicionar `import VideoCriacao from "@/components/lp/VideoCriacao";`
- Inserir `<VideoCriacao />` entre `<HeroLp />` e `<AntesDepois />` dentro do `<main>`

## 3. Estilo / consistência

- Usar somente tokens do design system (`bg-card`, `text-accent`, `bg-accent-soft`, etc.). O fundo branco da seção fica via `bg-white` no card pedido explicitamente, dentro de uma section com `bg-background`.
- Reaproveitar componentes `Button` e `Badge` do shadcn quando fizer sentido (badge custom inline para casar com hero).
- Sem libs novas — apenas Tailwind + lucide-react.

## Pontos a confirmar depois
- Você anexa o arquivo de vídeo → eu coloco em `public/videos/teaser-criacao.mp4`.
- Substituir `[COLE_AQUI_O_LINK_DO_YOUTUBE]` quando tiver o link.
