## Ajustes na aba Usuários do Super Admin

### 1. `supabase/functions/admin-list-users/index.ts`
- Após buscar `profiles`, agregar contagem de imóveis por `tenant_id` via `properties` (`select tenant_id`, filtrando pelos tenant_ids dos perfis retornados) e montar um `Map<tenant_id, number>`.
- Incluir `property_count: number` em cada item de `result`.

### 2. `src/pages/SuperAdmin.tsx` (tabela de usuários)
- Alterar o grid de `grid-cols-[1fr_1fr_auto_auto_auto]` para `grid-cols-[1.4fr_1.4fr_80px_110px_110px_auto]` (E-mail | Workspace | Imóveis | Criado | Último acesso | Ações), aplicando o mesmo template no header e nas linhas.
- Header: alinhar à esquerda E-mail/Workspace; centralizar "Imóveis"; alinhar "Criado" e "Último acesso" à direita (`text-right`); manter "Ações" à direita.
- Linhas: aplicar `text-right` nas células de datas, `text-center` na coluna de imóveis, e `justify-end` no container dos botões de Ações para que fiquem alinhados com o cabeçalho.
- Nova célula "Imóveis": exibe `u.property_count ?? 0` como badge/numero discreto (`text-sm font-medium`).
- Datas formatadas como já estão (pt-BR).

### 3. Sem migração
Apenas leitura adicional em `properties` dentro da edge function (service_role já tem acesso).
