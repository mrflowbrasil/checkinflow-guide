## Problema

Ao clicar em "Salvar" no diálogo "Editar imóvel", aparece:
`Failed to construct 'FormData': parameter 1 is not of type 'HTMLFormElement'`

## Causa

Em `src/components/property/EditPropertyDialog.tsx`, o `handleSubmit` chama `setBusy(true)` (que dispara re-render) antes de passar o evento para `save.mutate(e)`. Quando o `mutationFn` roda em seguida e tenta `new FormData(e.currentTarget)`, o `currentTarget` do evento React já foi liberado/zerado — daí o erro.

## Correção

Refatorar `EditPropertyDialog.tsx` para extrair os valores do formulário **antes** de qualquer setState ou mutate:

1. No `handleSubmit`:
   - Chamar `e.preventDefault()` imediatamente.
   - Construir `FormData` a partir de `e.currentTarget` ali mesmo, enquanto o evento ainda é válido.
   - Extrair os campos (`name`, `address`, `external_id`, `booking_url`, `description`) para um objeto simples.
   - Só então chamar `save.mutate(values)`.

2. Mudar a assinatura de `mutationFn` para receber o objeto de valores (não o evento), e remover `e.preventDefault()` / `new FormData` de dentro dela.

3. Manter `setBusy` controlado apenas via `onSettled` (remover o `setBusy(true)` manual no handler — usar `save.isPending` ou setar dentro de `onMutate`).

Nenhum outro arquivo precisa ser alterado. Sem mudanças de banco.

## Resultado esperado

Salvar o imóvel (com ou sem trocar a imagem de capa) funciona sem o erro de FormData.