## Correção do alerta: `properties` legível para tenants desativados

### Problema
A policy `Public reads active properties` (role `anon`) em `public.properties` usa apenas `status = 'active'`. Se um tenant for desativado (`is_active = false`), os imóveis ativos continuam visíveis publicamente — vazando `address`, `external_id`, `external_data` (PMS), `booking_url`, `cover_image_url`, `tenant_id`. As demais policies públicas (`property_details`, `property_pages`, `content_blocks`, `property_images`, `guide_translations`) já usam `is_property_active()`, que valida ambas as condições.

### Correção (1 migração)
Substituir a policy anon de SELECT em `properties` para também checar o tenant ativo, alinhando com o resto do schema:

```sql
DROP POLICY "Public reads active properties" ON public.properties;

CREATE POLICY "Public reads active properties"
  ON public.properties FOR SELECT TO anon
  USING (
    status = 'active'
    AND EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = properties.tenant_id AND t.is_active = true
    )
  );
```

Mantém `authenticated` (policy `Tenant members manage own properties`) intacta — dashboard, edge functions e super_admin continuam funcionando normalmente.

### Impacto de acesso
- **Tenants ativos:** zero impacto. Guias públicos (`/g/<slug>`) continuam carregando — a condição extra é satisfeita.
- **Tenants desativados:** os imóveis deixam de aparecer publicamente, que é exatamente o comportamento já aplicado às tabelas relacionadas (detalhes, páginas, blocos, imagens). Hoje já é inconsistente: o hóspede consegue ler `properties` mas não consegue ler `property_details`/`property_pages`, então a página já quebra. A correção apenas fecha o vazamento de dados sem mudar a experiência efetiva.
- **Dashboard/admin:** nenhum — usa policy `authenticated` separada.
- **Edge functions** (ex.: `property-manifest`): usam `service_role`, bypassam RLS, sem impacto.

### Validação após aplicar
1. Abrir um guia público (`/g/<slug>`) de tenant ativo no preview — deve carregar normalmente.
2. Marcar a finding como corrigida no scanner.

### Risco
Mínimo. Migração isolada, reversível (basta recriar a policy antiga), sem alteração de schema ou dados.
