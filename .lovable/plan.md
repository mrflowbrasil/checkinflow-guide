# Correção do erro 401/RLS ao criar propriedade

## Causa raiz
As funções `enforce_property_limit()` e `seed_property_pages()` são executadas por triggers durante o INSERT em `properties`. Uma migration anterior revogou `EXECUTE` dessas funções do role `authenticated`, fazendo os triggers falharem e o insert ser rejeitado como violação de RLS.

## Passos

1. **Migration corretiva** (`supabase/migrations/...`)
   - Recriar `enforce_property_limit()` e `seed_property_pages()` como `SECURITY DEFINER` com `SET search_path = public`.
   - `GRANT EXECUTE ... TO authenticated` nas duas funções.
   - Garantir que os triggers `enforce_property_limit_trg` (BEFORE INSERT) e `on_property_created` (AFTER INSERT) existam em `public.properties`.
   - Reafirmar `GRANT EXECUTE` em `current_tenant_id()` e `has_role()` para `authenticated`.

2. **Melhorar mensagens em `src/pages/dashboard/PropertyNew.tsx`**
   - Tratar erros específicos do Supabase e exibir toasts claros:
     - `property_limit_reached` → "Você atingiu o limite de imóveis do seu plano."
     - código `42501` / mensagem RLS → "Sem permissão para criar imóvel. Verifique seu workspace."
     - falha de upload da capa → "Falha ao enviar imagem de capa."
     - tenant/workspace não carregado → bloquear submit com mensagem.
   - Sem mudanças de layout.

3. **Validação**
   - Criar uma propriedade de teste com capa.
   - Confirmar que as 24 páginas padrão são criadas pelo trigger.
   - Confirmar ausência do erro de RLS.

## Arquivos
- novo: `supabase/migrations/<timestamp>_restore_property_trigger_grants.sql`
- editar: `src/pages/dashboard/PropertyNew.tsx`
