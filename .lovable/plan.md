## Objetivo
Restringir a `LeadCaptureBar` para aparecer somente na propriedade de demonstração (`suite-premium-vila-serena-23515a`).

## Mudanças
- `src/pages/GuestGuide.tsx`: definir constante `DEMO_SLUG = "suite-premium-vila-serena-23515a"` e renderizar `<LeadCaptureBar />` apenas quando `slug === DEMO_SLUG`.
- Tornar o padding `pt-12 sm:pt-14` do `guide-root` condicional ao mesmo flag, para que as demais páginas não fiquem com espaço em branco no topo.

## Fora do escopo
Sem alterações no componente `LeadCaptureBar` em si, sem mudanças de backend/DB ou de outras páginas.

## Validação
- `/g/suite-premium-vila-serena-23515a`: barra visível, padding aplicado.
- Qualquer outro slug (ex.: `/g/ape-405-no-multiporto-7a9a6e`): sem barra e sem padding extra.