## Problema

A página `/app/catalog` (Catálogo & Link da Bio no painel interno) está sem container/padding. O `<main>` do `AppShell` não aplica padding e o componente `Catalog.tsx` envolve o conteúdo apenas em `space-y-6`, o que faz os cards colarem nas bordas e o terceiro card vazar à direita.

A página `/app/properties` (referência) usa `container py-8 max-w-6xl` no wrapper raiz e por isso fica alinhada corretamente.

## Mudança (apenas visual)

Editar `src/pages/dashboard/Catalog.tsx`:

- Trocar o wrapper raiz de `<div className="space-y-6">` para `<div className="container py-8 max-w-6xl space-y-6 animate-fade-in">`, igualando o padrão de `PropertiesList.tsx`.

Isso resolve:
- Margens laterais consistentes em desktop, tablet e mobile
- Largura máxima alinhada com as outras telas do app
- Grade `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (já existente) deixa de “vazar” à direita

Não vou mexer em `PropertyCatalogCard.tsx` — ele já usa `aspect-[4/3]` + `object-cover` e fica padronizado assim que o container ganha largura correta.

## Arquivos

- `src/pages/dashboard/Catalog.tsx` (somente o wrapper raiz)
- `public/version.json` (bump)
