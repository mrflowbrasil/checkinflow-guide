## Objetivo

Reduzir fuga de leads no guia público (`/g/:slug`) adicionando uma barra de conversão fixa, com foco em mobile, levando o visitante para `/auth`.

## Escopo

Apenas a página pública `src/pages/GuestGuide.tsx` (rota `/g/:slug`). Sem alterações de backend, dados ou outras páginas.

## O que será criado

**Novo componente:** `src/components/guest/LeadCaptureBar.tsx`

Barra fixa no **topo** da viewport (`position: fixed; top: 0`), full-width, acima do hero. Estrutura:

```text
[← ]  Gostou deste modelo? Crie um guia para seu imóvel.  [ Criar Guia Grátis ]
```

- **Botão voltar (esquerda):** ícone `ArrowLeft` discreto, `aria-label="Voltar para o site"`, link para `/`.
- **Texto central:** "Gostou deste modelo? Crie um guia interativo para o seu imóvel." Em mobile, versão curta: "Gostou? Crie o guia do seu imóvel."
- **CTA (direita):** botão "Criar Guia Grátis" → `/auth`. Estilo destaque (cor de marca / accent), `size="sm"`, alto contraste.
- **Visual:** fundo escuro (`bg-foreground` ou `bg-primary`) com texto claro, leve sombra inferior, altura ~48px mobile / 56px desktop, safe-area-inset-top respeitado (iOS notch).
- **Tracking:** opcionalmente disparar `postMessage` de clique (consistente com padrão `wh_demo_*` já usado), sem dependências novas.

## Ajustes em `GuestGuide.tsx`

1. Importar e renderizar `<LeadCaptureBar />` como **primeiro elemento** dentro de `GuideBody`.
2. Adicionar `padding-top` equivalente à altura da barra no container raiz para não cobrir o hero (`pt-12 sm:pt-14`).
3. Ajustar o `LanguageSwitcher` e `SocialLinks` (hoje posicionados absolutos sobre a capa) para descerem a mesma altura da barra, evitando sobreposição.

## Design tokens

Usar tokens semânticos existentes (`--primary`, `--primary-foreground`, `--accent`). Sem cores hard-coded. CTA usa `Button` variant `default` ou novo `variant="cta"` se necessário — preferir reutilizar `default` com classes utilitárias.

## Fora do escopo

- Não muda o preview interno do editor (`GuestPagePreview`) — apenas a página pública real.
- Não altera SEO, manifest, i18n do guia (a barra fica em PT-BR fixo, pois é mensagem ao dono potencial, não ao hóspede).
- Sem A/B test, sem cookie de dismiss nesta v1 (podemos adicionar depois se pedir).

## Validação

Abrir `/g/suite-premium-vila-serena-23515a` em viewport mobile e desktop: barra visível ao rolar, CTA leva a `/auth`, seta volta para `/`, hero não fica coberto.
