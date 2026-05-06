# Preservar blocos manuais na sincronização de imóveis

## Diagnóstico

A função `properties-api` (PUT) já tenta preservar blocos manuais, mas o fluxo tem dois problemas:

### Problema 1: PageEditor "manualiza" todos os blocos
Em `src/pages/dashboard/PageEditor.tsx` (linhas 80-98), `persistBlocks` faz:
```
DELETE FROM content_blocks WHERE page_id = X  -- apaga TUDO (auto e manual)
INSERT ... (sem campo source)                 -- reinsere com default 'manual'
```
Resultado: qualquer página aberta no editor perde a marca `source='auto'` dos blocos vindos da integração. Eles viram `'manual'` e, na próxima sincronização, **não são deletados**, mas a API insere **uma nova cópia** dos blocos automáticos → duplicação.

### Problema 2: Conflito de posições
Em `properties-api/index.ts` (linha 124-130), os blocos auto são reinseridos em `position: 0..n`, sem considerar os manuais existentes — gera blocos sobrepostos na mesma posição.

### O que JÁ funciona
A linha 121 (`.delete().eq("source", "auto")`) corretamente preserva blocos `source='manual'` que nunca passaram pelo editor. Então blocos criados via "+" no editor (em páginas nunca tocadas pela integração) sobrevivem.

## Plano

### 1. PageEditor: preservar a marca `source` ao salvar
Em `persistBlocks` (`src/pages/dashboard/PageEditor.tsx`):
- Selecionar `id, source` dos blocos existentes antes do delete.
- Para blocos com `id` já existente, manter o `source` original.
- Blocos novos (sem `id`, criados no editor) entram como `source='manual'`.

Isso garante que blocos da integração continuem marcados como `'auto'` mesmo depois de o usuário abrir/salvar a página.

### 2. Edge function: posicionar blocos auto após os manuais
Em `supabase/functions/properties-api/index.ts`, função `generateAutoBlocks`:
- Após deletar os auto antigos, contar quantos manuais restam por página.
- Inserir os novos auto começando em `position = manualCount` (ou no final), evitando colisão visual.

### 3. (Opcional) Política "manual sobrescreve auto" por chave semântica
Para casos como Wi-Fi, lock_code, check-in: se já existe um bloco manual de mesmo tipo na página, **pular** a geração do auto correspondente, evitando informação duplicada (ex.: duas senhas de Wi-Fi).
- Implementar em `generateAutoBlocks`: antes de inserir, ler blocos `source='manual'` da página e omitir os auto cujo `type` já apareça (heurística simples e segura).

## Validação

Após aplicar:
1. Você dispara um PUT manual com payload de integração.
2. Verificamos via SQL que:
   - Blocos `source='manual'` permanecem intactos.
   - Blocos `source='auto'` foram substituídos sem duplicar.
   - Posições não colidem.

Se preferir, posso pular o passo 3 (opcional) na primeira iteração e só implementar 1 + 2.

## Arquivos afetados
- `src/pages/dashboard/PageEditor.tsx` — preservar `source` no save.
- `supabase/functions/properties-api/index.ts` — posicionar auto após manuais e (opcional) deduplicar por tipo.
