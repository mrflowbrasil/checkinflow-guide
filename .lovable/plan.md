## Problema

O domínio de envio de emails foi configurado como `notify.notify.mrflow.com.br` (duplicado). O correto seria `notify.mrflow.com.br`.

Isso acontece porque, no assistente de setup, foi informado `notify.mrflow.com.br` no campo "domínio" e `notify` no campo "subdomínio", e o sistema concatenou os dois.

## Como corrigir

Essa correção precisa ser feita em parte por você (no painel) e em parte por mim (no código). Não consigo remover o domínio atual automaticamente — apenas você consegue, pela interface do Cloud.

### Passo 1 — Você remove o domínio atual (no painel)

1. Vá em **Cloud → Emails → Gerenciar Domínios**
2. Localize `notify.notify.mrflow.com.br`
3. Clique em remover/excluir esse domínio
4. **Importante:** vá no seu registrador DNS (Registro.br, Cloudflare, etc.) e **remova os registros NS** que foram criados para `notify.notify.mrflow.com.br` — eles ficam órfãos depois da remoção

### Passo 2 — Você adiciona o domínio correto (no painel)

1. Ainda em **Cloud → Emails**, clique em **Adicionar domínio**
2. No campo de domínio, informe apenas: `mrflow.com.br`
3. No campo de subdomínio, informe: `notify`
4. Isso vai gerar o FQDN correto: `notify.mrflow.com.br`
5. Adicione os 2 novos registros NS que o sistema mostrar, no seu registrador DNS
6. Aguarde a verificação DNS (alguns minutos, podendo levar até 72h)

### Passo 3 — Eu reconfiguro a infraestrutura (automático)

Depois que você adicionar o novo domínio (mesmo antes do DNS verificar), eu:
- Rodo novamente o setup de infraestrutura de email para o novo domínio
- Atualizo a função `process-email-queue` para usar o domínio correto
- Sigo com a implementação do fluxo "Esqueci minha senha" (páginas `/forgot-password` e `/reset-password`) e personalização dos templates auth com a marca Mr Flow

## Observação importante

Enquanto o domínio antigo `notify.notify.mrflow.com.br` existir, ele vai continuar tentando processar emails. Por isso o passo 1 (remoção) é necessário antes de adicionar o novo, para evitar conflito.

## Detalhes técnicos

- O arquivo `supabase/config.toml` já tem o bloco `[functions.process-email-queue]` configurado e não precisa mudar
- A função edge `process-email-queue` já está deployada — após trocar o domínio, basta um redeploy para ela apontar para o novo
- A tabela `email_send_state`, queues pgmq (`auth_emails`, `transactional_emails`) e cron job são reaproveitados automaticamente
