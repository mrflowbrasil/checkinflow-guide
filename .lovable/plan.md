## Problema confirmado

1. A requisição da n8n **atualizou** `properties` e tentou popular `content_blocks`, mas o enum `block_type` em produção não inclui `"password"`.
2. O insert de blocos automáticos é feito em **batch único** — uma única linha inválida (`type: "password"` para Wi-Fi e fechadura) **derruba o batch inteiro**, deixando 0 blocos auto em todas as páginas.
3. Log do edge confirma: `invalid input value for enum block_type: "password"`.
4. Front-end (`src/lib/blocks.ts`) já trata `password` como tipo válido — a divergência é só no banco.

## Correções

### 1. Migration: adicionar `password` ao enum `block_type`

```sql
ALTER TYPE public.block_type ADD VALUE IF NOT EXISTS 'password';
```

(Deve ser executado fora de transação — Postgres exige `COMMIT` antes de usar o novo valor; o sistema de migrations do Lovable lida com isso.)

### 2. Edge function `properties-api` — tornar inserção resiliente

No `generateAutoBlocks`, agrupar inserts **por página** (em vez de batch único) e capturar erro por grupo, logando sem abortar o restante:

```ts
for (const page of pages) {
  const blocks = buildPageBlocks(page.page_key, details, address);
  if (!blocks.length) continue;
  const rows = blocks.map((b, i) => ({
    page_id: page.id, type: b.type, data: b.data, position: i, source: "auto",
  }));
  const { error } = await admin.from("content_blocks").insert(rows);
  if (error) console.error(`auto-blocks insert failed for page ${page.page_key}`, error);
}
```

Assim, se um tipo futuro voltar a ser inválido, só a página afetada falha.

### 3. Verificar `property_details`

Investigar se a linha em `property_details` para `PH02F` existe (a query inicial retornou vazia). Se não existir, há um bug no upsert (campo `onConflict: "property_id"` exige unique constraint). Confirmar e, se necessário, garantir a constraint:

```sql
ALTER TABLE public.property_details
  ADD CONSTRAINT property_details_property_id_unique UNIQUE (property_id);
```

(Só aplicar se ainda não existir.)

### 4. Reprocessar o imóvel `PH02F`

Após aplicar as mudanças, reenviar o payload via n8n (ou chamar internamente via curl) para popular as 9 páginas (checkin, checkout, wifi, lock_code, location, rules, parking, trash, emergency, contacts) com os blocos automáticos.

## Arquivos afetados

- Nova migration SQL (enum + constraint se faltar)
- `supabase/functions/properties-api/index.ts` (insert resiliente por página)

## Resultado esperado

Ao reenviar o payload do `PH02F`:
- Página **Wi-Fi**: bloco texto "Rede: abmap107" (sem senha pois `wifi_password: null`)
- Página **Senha Fechadura**: bloco password "NÃO POSSUI"
- Página **Check-in**: bloco texto "Horário de check-in: 15:00"
- Página **Check-out**: bloco texto "Horário de check-out: 12:00"
- Página **Localização**: endereço + botão Google Maps
- Página **Contatos**: "Interfone da portaria: 94"
