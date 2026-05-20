Plano para corrigir o remetente e o assunto que ainda aparecem como antigos:

1. Validar o caminho do e-mail
- Confirmar se o e-mail da imagem veio do botão de teste em Cloud → Emails ou de uma solicitação real em `/forgot-password`.
- O assunto com prefixo `[Test]` indica que pode ser o envio de teste do painel, que pode usar metadados/cache diferentes do e-mail real.

2. Revisar a configuração ativa do envio
- Verificar se o fluxo customizado de e-mails de autenticação está realmente ativo para o projeto.
- Conferir se o hook de e-mail de autenticação está recebendo eventos reais de recuperação de senha.
- Conferir os logs do envio e da fila de e-mails para identificar se o e-mail está saindo pelo template customizado ou pelo template padrão.

3. Aplicar a correção no ponto certo
- Se o problema for apenas no envio de teste do painel: atualizar/recriar a configuração dos templates para que os metadados de preview/teste também reflitam `Mr Flow Welcome Hub` e `Redefina sua senha`.
- Se o problema também ocorrer no fluxo real: redeployar o `auth-email-hook` e garantir que o remetente seja `Mr Flow Welcome Hub <noreply@notify.mrflow.com.br>` e o assunto seja `Redefina sua senha`.

4. Validar com um envio real
- Solicitar uma redefinição pela tela `/forgot-password`.
- Confirmar no e-mail recebido que:
  - Remetente: `Mr Flow Welcome Hub`
  - Assunto: `Redefina sua senha`
  - Corpo: texto em português com `Mr Flow Welcome Hub` em destaque verde.