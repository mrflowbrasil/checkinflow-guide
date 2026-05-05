# Ajustes no template Dark + prévia padrão

## 1. Template Dark — cores corretas (`src/index.css` + `src/lib/templates.ts`)

Hoje o Dark herda os mesmos valores do Clean nas variáveis HSL e tem `primary=#0F1E3D` + `secondary=#1a2c52` (ambas escuras), o que deixa botões e labels ilegíveis.

Mudanças:
- `src/lib/templates.ts` — Dark: `primary: "#FFFFFF"` (texto/ícones brancos sobre o fundo) e `secondary: "#0F1E3D"` (navy escuro). O `preview` swatch passa a usar `linear-gradient(135deg, #0F1E3D 50%, #1a2c52 50%)` (mantém o visual escuro no card).
- `.guide-template-dark` em `src/index.css`: já está com `--guide-bg` escuro e `--guide-fg` branco — manter. Vamos garantir que `--guide-card` continue um pouco mais claro que o bg para os botões de página ficarem visíveis.

## 2. Botão "Reservar Novamente" invertido no template Dark

Em `src/pages/GuestGuide.tsx` (e no `TemplatePreviewDialog`), o botão usa hoje `background: primary, color: #fff`. Para o Dark, com `primary=#FFFFFF`, ele ficará automaticamente branco com texto escuro se trocarmos `color: "#fff"` por `color: "hsl(var(--guide-bg))"` — invertendo só nesse template, sem `if` específico, pois para os outros templates `primary` continua sendo a cor de destaque e o texto branco continua legível.

Para evitar regressão nos demais templates (onde `primary` é colorido e queremos texto branco), aplicamos a regra apenas via classe: criamos no CSS uma sobreposição:

```css
.guide-template-dark .guide-cta-primary {
  background: #FFFFFF !important;
  color: #0F1E3D !important;
}
```

E adicionamos `className="guide-cta-primary"` nos dois botões "Reservar Novamente" (GuestGuide.tsx e TemplatePreviewDialog.tsx).

## 3. Mini-preview da página de Templates legível (`Templates.tsx` → `MiniPreview`)

Problemas atuais no card "Dark":
- O badge com o nome ("Dark") usa `background: hsl(var(--guide-bg)/0.7)` sobre um hero também escuro → invisível.
- O pseudo-botão "RESERVAR" usa `background: tpl.primary, color: tpl.secondary` → ambos escuros no Dark.

Correções no `MiniPreview`:
- Badge do nome: trocar para `background: rgba(255,255,255,0.85); color: #111` (constante, independente do template) para sempre legível sobre o swatch.
- Pseudo-botão "RESERVAR": usar texto branco quando `primary` for escuro e fundo branco quando `primary` for claro. Como `secondary` deixou de ser garantido como contraste, vamos calcular um contraste simples: helper inline `getContrastText(hex)` que retorna `#fff` ou `#111` de acordo com luminância do `tpl.primary`. Aplicado também no botão "Reservar Novamente" da prévia em tela cheia.

## 4. Imagem padrão da prévia = Pousada Vila Serena 2

- Copiar `user-uploads://Pousada_Vila_Serena2.jpeg` para `src/assets/preview-cover-vila-serena.jpg`.
- Em `src/components/templates/TemplatePreviewDialog.tsx`, substituir o `COVER_IMG` (URL Unsplash) por `import coverImg from "@/assets/preview-cover-vila-serena.jpg"` e usar `coverImg` no `<img src>`.

## Detalhes técnicos resumidos
- Arquivos editados: `src/lib/templates.ts`, `src/index.css`, `src/pages/GuestGuide.tsx`, `src/pages/dashboard/Templates.tsx`, `src/components/templates/TemplatePreviewDialog.tsx`.
- Asset adicionado: `src/assets/preview-cover-vila-serena.jpg`.
- Sem migrações, sem mudanças em backend, sem alteração de planos ou permissões.
