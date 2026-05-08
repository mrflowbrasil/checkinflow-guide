## Objetivo

Adicionar uma nova página padrão ao Guia do Hóspede para exibir comércios próximos como **farmácias, padarias, mercados, etc.**

## Sugestão de nome

"Comércios" funciona, mas sugiro alternativas mais alinhadas ao tom hóspede-amigável já usado nas outras páginas:

- **"Conveniências"** — abrange farmácia, padaria, mercado, banco
- **"No Bairro"** — mais aconchegante, sugere proximidade
- **"Compras & Serviços"** — mais descritivo
- **"Comércios Próximos"** — versão expandida do original

Recomendo **"Conveniências"** (ícone `ShoppingBag` ou `Store`). Confirma essa opção ou prefere outra?

## O que será feito

1. **Banco de dados** — migration para:
   - Adicionar a nova página ao `seed_property_pages()` (afeta novos imóveis)
   - Inserir a página em todos os imóveis já existentes via `INSERT ... SELECT` no `property_pages`, evitando duplicatas
   - Posição: `24` (após FAQ, no final da lista)

2. **Frontend** — registrar o ícone novo em `src/lib/page-icons.ts` (importar `Store` do lucide-react e adicionar ao mapa `PAGE_ICONS`).

A página aparecerá vazia inicialmente; o anfitrião adiciona blocos (texto, links, mapa, etc.) pelo editor — mesmo fluxo das outras páginas. Não é necessário um tipo de bloco novo.

## Detalhes técnicos

- `page_key`: `convenience` (ou `commerce` se preferir manter "Comércios")
- `icon`: `Store`
- `title`: `Conveniências`
- `position`: `24`
- Backfill SQL:
  ```sql
  INSERT INTO public.property_pages (property_id, page_key, title, icon, position)
  SELECT id, 'convenience', 'Conveniências', 'Store', 24
  FROM public.properties
  WHERE NOT EXISTS (
    SELECT 1 FROM public.property_pages pp
    WHERE pp.property_id = properties.id AND pp.page_key = 'convenience'
  );
  ```
