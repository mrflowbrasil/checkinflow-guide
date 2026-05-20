## Situação atual

Boa notícia: o fluxo de recuperação de senha **já está totalmente implementado** no código. Só precisamos validar que está ativo agora que o DNS foi verificado.

O que já existe:

- **Tela de login** (`/auth`) com o link "Esqueci minha senha" apontando para `/forgot-password`
- **Página `/forgot-password`** — formulário que envia o e-mail de recuperação via Supabase Auth, com `redirectTo` apontando para `/reset-password`
- **Página `/reset-password`** — detecta o token de recuperação e permite definir uma nova senha (mínimo 8 caracteres, com confirmação)
- **Template de e-mail `recovery.tsx`** — já com a identidade do Mr Flow (logo no Supabase Storage, cor `#008e8e`, copy em português)
- **Edge function `auth-email-hook`** — já deployada, roteando os e-mails de auth pelo template customizado

## Plano

1. **Redeploy do `auth-email-hook`** para garantir que está rodando a última versão (com a URL nova do logo no Storage)
2. **Teste prático**: solicitar um e-mail real de recuperação para validar que:
   - O e-mail chega vindo de `notify.mrflow.com.br`
   - O logo aparece corretamente
   - O link `/reset-password` funciona e permite trocar a senha
3. Caso o e-mail não chegue, checar `Cloud → Emails` para status do domínio e logs da fila

## Observações técnicas

- Nenhuma mudança de código é necessária — o fluxo está pronto
- O template `recovery.tsx` já usa o logo via URL pública do Storage (não precisa redeploy do app)
- Se quiser, posso ajustar o copy, cores ou adicionar elementos extras no e-mail de recuperação antes do teste
