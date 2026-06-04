## Plano de correção dos alertas de segurança

São 4 alertas. Cada um é resolvido em uma migração/ajuste separado e independente, na ordem abaixo (do mais sensível ao informativo). Nenhum passo altera dados de usuários nem quebra fluxos existentes — só restringe o que o papel `anon` consegue ler e fecha brechas de escrita.

---

### 1. `tenants` — IDs Stripe e dados de plano expostos ao público (ERROR)

**Problema:** a policy `Public reads active tenants` (role `anon`) usa `USING (is_active = true)` sem restrição de colunas. Mesmo que a memória de segurança diga que `anon` não deve ver Stripe IDs, hoje o `GRANT SELECT` ao `anon` cobre a tabela inteira — incluindo `stripe_customer_id`, `stripe_subscription_id`, `plan_expires_at`, `plan_status`.

**O que o app público realmente precisa ler de `tenants` (anon):** `id`, `name`, `slug`, `primary_color`, `secondary_color`, `template`, `support_whatsapp`, `logo_url`, `show_logo`, `instagram_url`, `facebook_url`, `plan_code`, `is_active`. Confirmado lendo `GuestLinkExpired.tsx` e o resto dos consumidores anônimos.

**Correção (migração):**
1. `REVOKE SELECT ON public.tenants FROM anon;`
2. `GRANT SELECT (id, name, slug, primary_color, secondary_color, template, support_whatsapp, logo_url, show_logo, instagram_url, facebook_url, plan_code, is_active) ON public.tenants TO anon;`
3. Manter as policies como estão (RLS continua filtrando por `is_active = true`).
4. `authenticated` e `service_role` ficam com `GRANT ALL` (inalterado), então dashboard, edge functions e webhooks Stripe continuam funcionando.

**Risco de quebrar usuário:** zero — nenhuma query anônima atual lê colunas Stripe/plan_status/plan_expires_at.

---

### 2. `tenant_api_keys` — sem policy de INSERT/DELETE para membros (WARN)

**Problema:** a tabela só tem policy `SELECT` para o tenant e `ALL` para super_admin. Hoje a criação/revogação acontece exclusivamente pela edge function `tenant-api-keys` usando `service_role` (bypass de RLS), então **não há bug funcional**. O alerta pede que isso fique explícito no banco.

**Correção (migração) — defesa em profundidade, sem mudança de comportamento:**
1. Adicionar policy explícita negando `INSERT`/`UPDATE`/`DELETE` para `authenticated` (já é o efeito atual, mas fica documentado):
   ```sql
   CREATE POLICY "Block direct writes from clients"
     ON public.tenant_api_keys FOR INSERT TO authenticated WITH CHECK (false);
   CREATE POLICY "Block direct updates from clients"
     ON public.tenant_api_keys FOR UPDATE TO authenticated USING (false);
   CREATE POLICY "Block direct deletes from clients"
     ON public.tenant_api_keys FOR DELETE TO authenticated USING (false);
   ```
2. Atualizar a memória de segurança explicando que toda escrita passa pela edge function `tenant-api-keys` com `service_role`.

**Risco:** zero — o cliente nunca escreve direto nessa tabela.

---

### 3. Leaked Password Protection desativada (WARN)

**Correção:** ativar via `supabase--configure_auth` com `password_hibp_enabled: true`. Passa a checar senhas contra o Have I Been Pwned no signup e no reset.

**Risco:** baixo — só rejeita novas senhas comprometidas. Usuários existentes não são afetados até trocarem a senha.

---

### 4. Public bucket allows listing (WARN)

**Problema:** os buckets públicos (`property-covers`, `property-gallery`, `block-media`, `tenant-logos`, `email-assets`) têm uma policy ampla de `SELECT` em `storage.objects` que permite *listar* todos os arquivos, não só baixar por URL conhecida.

**Correção (migração):** restringir `SELECT` em `storage.objects` desses buckets a operações de download por path conhecido, removendo o listing público. Concretamente:
- Dropar a policy genérica "Public read" que permite `SELECT *`.
- Recriar uma policy que continua permitindo leitura individual (necessária para `getPublicUrl` funcionar via CDN — esse caminho não passa por RLS) mas bloqueia o método `list()` para anon. O acesso via URL pública continua funcionando porque o CDN do Storage usa service role internamente.
- Na prática: manter `SELECT` para `authenticated` (dashboard precisa listar suas imagens) e remover `SELECT` para `anon` em `storage.objects` desses buckets. URLs públicas continuam acessíveis.

**Verificação antes de aplicar:** abrir uma página pública (`/g/<slug>`) no preview após a mudança, confirmar que covers e galeria continuam carregando, e que o editor no dashboard continua listando imagens.

**Risco:** baixo se feito com verificação. Caso algum lugar dependa de `list()` anônimo (não encontrei nenhum no código), revertemos a policy desse bucket específico.

---

### Ordem de execução e segurança operacional

1. **Migração 1** (tenants column grants) — aplicar, validar página pública de um guia.
2. **Migração 2** (tenant_api_keys deny policies) — aplicar, validar criação de API key no dashboard.
3. **configure_auth** (HIBP) — aplicar, testar signup.
4. **Migração 4** (storage listing) — aplicar por último, validar guia público + upload no dashboard.

Cada passo é uma migração isolada e reversível. Nenhum passo apaga dados nem altera schema; só restringe privilégios e adiciona policies. Se algo der errado em um passo, ele é revertido sem afetar os demais.

### Fora do escopo
- Nenhuma mudança em código de aplicação além de, se necessário, ajustes pontuais após validar storage.
- Memória de segurança será atualizada ao final descrevendo o novo modelo.
