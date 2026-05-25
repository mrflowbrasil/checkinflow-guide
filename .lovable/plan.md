## Objetivo

Adicionar dois botões na página `/app/properties` para publicar ou despublicar todos os imóveis do tenant de uma vez, cada um com seu diálogo de confirmação.

## Mudanças na UI (`src/pages/dashboard/PropertiesList.tsx`)

No header, ao lado de "Importar imóveis" e "Novo imóvel", adicionar um menu dropdown "Ações em massa" contendo:
- **Publicar todos** — habilitado apenas se existir ao menos 1 imóvel com `status = 'inactive'`
- **Despublicar todos** — habilitado apenas se existir ao menos 1 imóvel com `status = 'active'`

Mantém o layout limpo no viewport atual (1070px) sem quebrar a linha.

### Diálogo "Publicar todos"

`AlertDialog` com:
- Título: "Publicar todos os imóveis?"
- Descrição: aviso de que é uma alteração em massa que tornará públicos N imóveis atualmente em rascunho.
- Checkbox obrigatório: "Confirmo que revisei todas as páginas e conteúdos dos imóveis antes de publicar."
- Botão "Publicar todos" desabilitado até o checkbox ser marcado.

### Diálogo "Despublicar todos"

`AlertDialog` com:
- Título: "Despublicar todos os imóveis?"
- Descrição: aviso de que N imóveis ficarão inativos e os links públicos / QR Codes deixarão de funcionar até serem republicados.
- Botão de confirmação destrutivo (`bg-destructive`).

## Lógica

Ambas as ações executam um `UPDATE` em massa via Supabase client:

```ts
// Publicar
supabase.from("properties")
  .update({ status: "active" })
  .eq("tenant_id", tenant.id)
  .eq("status", "inactive");

// Despublicar
supabase.from("properties")
  .update({ status: "inactive" })
  .eq("tenant_id", tenant.id)
  .eq("status", "active");
```

Em seguida: `qc.invalidateQueries({ queryKey: ["properties"] })` + `toast.success`.

As RLS atuais (`Tenant members manage own properties`) já cobrem `UPDATE` filtrado por `tenant_id`, então **não há mudanças de banco de dados**.

## Estados de loading

Loader inline no item do dropdown e nos botões dos diálogos enquanto a mutação roda; desabilitar ambas as ações simultaneamente para evitar duplo clique.

## Arquivos afetados

- `src/pages/dashboard/PropertiesList.tsx` (única alteração)
