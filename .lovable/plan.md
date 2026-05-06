
## Objetivo
Aplicar a paleta definida no template **Boho Fun** (preview, dashboard e página pública) e habilitar o botão "Ver".

## Paleta
- Fundo (`bg`): `#f0e3cf`
- Frame dos ícones / cards (`card`): `#c3b59f`
- Botões com link/CTA (`cta`): `#2f6e63`
- Texto dos botões (`cta-text`): `#f0e3cf`
- Texto principal e ícones (`fg`): `#2f6e63`

## Mudanças

### 1. `src/lib/templates.ts`
- Atualizar a entrada `boho_fun`:
  - `primary: "#2f6e63"` (já está)
  - `secondary: "#f0e3cf"` (já está)
  - `preview: "linear-gradient(135deg, #f0e3cf 50%, #2f6e63 50%)"` (ajustar gradient)
- Adicionar `"boho_fun"` ao array `PREVIEW_READY_TEMPLATES` para liberar o botão "Ver".

### 2. `src/index.css`
Adicionar bloco de override seguindo o mesmo padrão usado em `dark` e `luxury`:

```css
.guide-template-boho_fun.guide-root,
.guide-root.guide-template-boho_fun {
  background-color: #f0e3cf !important;
  color: #2f6e63 !important;
}
.guide-template-boho_fun .guide-card {
  background-color: #c3b59f !important;
  color: #2f6e63 !important;
}
.guide-template-boho_fun .guide-cta-primary {
  background: #2f6e63 !important;
  color: #f0e3cf !important;
}
```

Isso garante consistência entre preview no dialog, página pública (`GuestGuide`) e mini-preview no dashboard (que já lê `tpl.secondary` e `tpl.primary`).

## Convenção para próximos templates
Salvar em `mem://design/template-tokens` a convenção dos 5 tokens (bg/card/cta/cta-text/fg) para que todos os próximos templates sejam aplicados no mesmo formato mecânico.

## Arquivos editados
- `src/lib/templates.ts`
- `src/index.css`
- `mem://design/template-tokens` (novo)
- `mem://index.md` (atualizar índice)
