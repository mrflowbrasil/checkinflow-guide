## Gerenciamento de Chaves de API no dashboard

Adicionar uma seção **"Chaves de API"** em **Configurações → Integrações** para o tenant criar, visualizar (prefixo) e revogar suas próprias chaves, sem depender de reconectar a integração.

### Comportamento

- **Listar chaves ativas**: nome, prefixo (`mrf_live_xxxxxxxx…`), `created_at`, `last_used_at`, status (ativa/revogada).
- **Gerar nova chave**: abre dialog que mostra o token completo **uma única vez**, com botão "Copiar" e aviso de que não será mostrado novamente. Permite definir um nome (ex.: "n8n Stays").
- **Revogar chave**: confirmação + marca `revoked_at = now()`. Chaves revogadas somem da lista (ou ficam em "histórico" colapsado — vamos manter simples: somem).
- Se o tenant não tem nenhuma chave ativa e tem integração conectada, mostra alerta "sua integração ficará sem callback até gerar uma nova chave".

### Mudanças técnicas

**1. Nova edge function `tenant-api-keys`** (`supabase/functions/tenant-api-keys/index.ts`)

Autenticada via JWT do usuário (`getClaims`), resolve `tenant_id` do `profiles`. Exige role `tenant_owner` (ou `super_admin`) via `has_role`.

- `GET /` → lista chaves ativas do tenant: `[{ id, name, key_prefix, created_at, last_used_at }]`
- `POST /` body `{ name }` → gera chave, retorna `{ id, name, key_prefix, api_key }` (texto puro só nessa resposta)
- `DELETE /?id=...` → marca `revoked_at = now()` (valida que pertence ao tenant)

Reaproveita `genApiKey()` e `sha256()` do `integrations-connect` (copiados para o arquivo).

**2. UI em `src/pages/dashboard/Integrations.tsx`**

Nova seção abaixo dos cards Stays/Hostaway:

```
┌─ Chaves de API ──────────────────── [+ Nova chave] ─┐
│  n8n produção · mrf_live_5sCUIi2q…  · usada há 2h   │
│  Backup       · mrf_live_a9k2Lp4w…  · nunca usada   │
└─────────────────────────────────────────────────────┘
```

Componentes shadcn já existentes: Card, Button, Dialog, Input, Badge, AlertDialog (para confirmar revogação).

Dialog "Nova chave criada":
- Campo readonly com a chave + botão Copiar (`navigator.clipboard.writeText`)
- Alerta amarelo: "Guarde esta chave em local seguro. Por segurança, não conseguiremos mostrá-la novamente."
- Botão "Entendi, fechar"

**3. RLS** — já existe `Tenant views own api keys` (SELECT). Não precisa migration: as escritas (INSERT/DELETE/UPDATE) acontecem só via edge function com service role + validação manual de tenant. Mantém a política atual restrita.

### Documentação ao usuário

Adicionar texto curto acima da seção:
> Use estas chaves para autenticar chamadas à API do CheckinFlow (header `X-API-Key`). Cada integração (n8n, scripts próprios) deve usar uma chave separada para facilitar revogação.

### Não-objetivos (ficam para depois)

- Rotação automática
- Escopos/permissões por chave
- Logs de uso por chave
