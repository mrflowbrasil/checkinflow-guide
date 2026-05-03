## Rotação manual do link público com aviso ao editar a senha da fechadura

### Objetivo

Permitir que o anfitrião gere um novo link público para o imóvel a qualquer momento, invalidando imediatamente o link anterior. Ao editar a página "Senha Fechadura", exibir um aviso sugerindo a rotação. Hóspedes que tentarem acessar o link antigo verão uma página de "Link expirado" com a identidade visual do template, com botões de **Reservar novamente** e **Ajuda**.

---

### 1. Banco de dados

Criar uma migration única com:

- Adicionar coluna `tenants.support_whatsapp` (text, nullable) — número usado no botão "Ajuda" da página de link expirado. Configurável em **Configurações** do tenant.
- Manter `properties.public_slug` como o slug ativo (sem histórico). A rotação simplesmente sobrescreve o valor.
- Criar função `rotate_property_slug(_property_id uuid)` (SECURITY DEFINER) que:
  - Verifica se o usuário tem permissão (mesmo `tenant_id` ou `super_admin`).
  - Gera novo slug a partir do nome do imóvel + sufixo aleatório de 6 caracteres (mesma lógica do `slugify` + `randomSuffix` já usada no front).
  - Garante unicidade global em `properties.public_slug`.
  - Atualiza `properties.public_slug` e `updated_at`.
  - Retorna o novo slug.

Sem tabela de histórico — link antigo simplesmente deixa de existir no banco.

### 2. Página de "Link expirado" (rota pública)

Criar nova rota `/g/:slug` continua sendo `GuestGuide`. Quando a query por `public_slug` não retornar imóvel ativo, em vez do "404 padrão" atual, renderizar um novo componente `GuestLinkExpired`:

- Layout centralizado, usando o template `clean` por padrão (não há como saber o tenant do link expirado, já que o slug não existe mais).
- Texto: "Este link expirou. Reserve novamente ou peça ajuda ao anfitrião."
- Botão primário **RESERVAR NOVAMENTE** → abre o `booking_url` do tenant. Como o link é desconhecido, usaremos um link genérico configurado no tenant `support_booking_url` (ver passo 4) — se não houver configuração, esconder botão.
- Botão secundário **AJUDA** → abre `https://wa.me/<support_whatsapp>` em nova aba. Se não configurado, esconder.

Como o slug expirado não permite descobrir o tenant, vamos precisar de uma estratégia de fallback: usar variáveis globais do app (não do tenant). Proposta: armazenar `support_whatsapp` e `support_booking_url` em `tenants`, e quando o slug não existe, mostrar uma página genérica com mensagens fixas + um link "Voltar ao site" para `https://hub.mrflow.com.br`. Se o usuário preferir personalizar por tenant, precisaria-se manter histórico — fora do escopo escolhido.

**Decisão a confirmar com o usuário antes de implementar:** ver pergunta no fim.

### 3. Botão "Gerar novo link" em `PropertyDetail`

No card do QR Code, adicionar um terceiro botão **Gerar novo link** (variant outline, ícone `RefreshCw`):

- Abre `AlertDialog` de confirmação: "Gerar um novo link vai invalidar imediatamente o link atual. Hóspedes que já receberam o link anterior não conseguirão mais acessar o guia. Deseja continuar?"
- Confirmação chama `supabase.rpc('rotate_property_slug', { _property_id: id })`.
- Em caso de sucesso: invalida `["property", id]`, mostra `toast.success("Novo link gerado")`, e o QR Code/URL são re-renderizados automaticamente.

### 4. Aviso ao editar a página "Senha Fechadura"

Em `PageEditor` (`src/pages/dashboard/PageEditor.tsx`), quando `page_key === "lock_code"`:

- No callback de salvar com sucesso, se houve alteração nos blocos, abrir um `AlertDialog`:
  > **Você atualizou a senha da fechadura.**
  > Deseja gerar um novo link de acesso para garantir que apenas hóspedes futuros vejam a nova senha?
  > [Manter link atual] [Gerar novo link]
- "Gerar novo link" → mesma RPC `rotate_property_slug` + toast informando o novo URL e oferecendo botão de copiar.

### 5. Configurações do tenant

Em `src/pages/dashboard/Settings.tsx`, adicionar dois campos opcionais:

- **WhatsApp de atendimento** (`support_whatsapp`) — só dígitos, com validação do formato internacional.
- **Link de reserva genérico** (`support_booking_url`) — URL para o botão "Reservar novamente".

Esses dois servem como fallback global da página de link expirado.

### 6. Aspectos técnicos

- `GuestGuide` já trata "imóvel não encontrado" — substituir esse caminho pelo novo componente `GuestLinkExpired`.
- Como o slug está em todas as queries por `public_slug` e na geração do QR/URL via `${origin}/g/${public_slug}`, ao rotacionar o React Query refaz tudo automaticamente.
- A RPC roda com `SECURITY DEFINER` para conseguir verificar unicidade em todos os tenants sem expor RLS.
- Edge functions `property-manifest` e `properties-api` continuam funcionando — fazem lookup por slug atual; slug antigo simplesmente não retorna nada.

### 7. Arquivos afetados

- **Nova migration**: adicionar `support_whatsapp` e `support_booking_url` em `tenants`, criar função `rotate_property_slug`.
- **Novo componente**: `src/components/guest/GuestLinkExpired.tsx`.
- **Editar**: `src/pages/GuestGuide.tsx` (renderiza link expirado no fallback).
- **Editar**: `src/pages/dashboard/PropertyDetail.tsx` (botão "Gerar novo link" + dialog).
- **Editar**: `src/pages/dashboard/PageEditor.tsx` (aviso ao salvar `lock_code`).
- **Editar**: `src/pages/dashboard/Settings.tsx` (campos de suporte).

### Pergunta antes de implementar

A página de "Link expirado" não consegue saber a qual tenant pertencia o slug antigo (porque ele foi descartado). Por isso, os botões **Reservar novamente** e **Ajuda** vão usar números/links genéricos da plataforma, não específicos do anfitrião. Se quiser personalização por anfitrião, seria necessário manter um pequeno histórico (`property_slug_history` com `property_id`) — apenas para resolver o tenant, sem dar acesso ao conteúdo. Quer que eu inclua esse mini-histórico só para personalizar a página de expiração?