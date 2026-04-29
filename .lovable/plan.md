## Plano: Email automático de convite com domínio próprio

### Objetivo
Substituir o fluxo manual de "copiar link e mandar no WhatsApp" por **disparo automático de email** quando você criar um convite no Super Admin, usando o domínio `mrflow.com.br` como remetente (`noreply@mrflow.com.br`).

---

### Etapa 1 — Configurar domínio de envio

Vou abrir o assistente de configuração de email e registrar:
- **Domínio raiz:** `mrflow.com.br`
- **Subdomínio de envio:** `notify.mrflow.com.br` (padrão recomendado, isola o tráfego de convites do seu email comercial principal — você continua usando `contato@mrflow.com.br` normalmente sem risco de afetar reputação)
- **Remetente exibido:** `MR FLOW <noreply@mrflow.com.br>`

O assistente vai gerar **2 registros NS** que você adiciona no painel DNS do `mrflow.com.br`:
```
notify.mrflow.com.br  NS  ns3.lovable.cloud
notify.mrflow.com.br  NS  ns4.lovable.cloud
```

A partir daí, o Lovable cuida automaticamente de SPF, DKIM e MX (sem você precisar configurar nada). A propagação leva de minutos a 72h (geralmente <1h).

> Observação: o destinatário vê `noreply@mrflow.com.br`, mas tecnicamente o envio sai de `notify.mrflow.com.br`. Isso é padrão de mercado e protege a reputação do seu domínio principal.

---

### Etapa 2 — Template do email de convite

Vou criar um template HTML responsivo com a identidade visual do MR FLOW:
- Logo / nome da plataforma no topo
- Cores e tipografia da landing page
- Mensagem clara: "Você foi convidado para o MR FLOW — Plano [Starter/Pro/Business]"
- Botão **"Aceitar convite"** apontando para `https://hub.mrflow.com.br/invite/{token}`
- Validade do link e instruções básicas
- Rodapé com info de contato

### Etapa 3 — Disparo automático no Super Admin

Modificar `src/pages/SuperAdmin.tsx`:
- Quando você clicar em **"Criar convite"**, além de gerar o registro na tabela `invitations`, vai chamar uma edge function que envia o email pro endereço informado
- Botão **"Reenviar email"** ao lado de cada convite pendente (caso o cliente perca)
- O botão **"Copiar link"** continua existindo (fallback caso queira mandar por WhatsApp também)
- Toast de confirmação: "Email enviado para cliente@exemplo.com"

### Etapa 4 — Edge function de envio

Criar `send-invitation-email` que:
- Recebe `{ email, token, plan_code }`
- Renderiza o template
- Envia via infraestrutura de email do Lovable
- Registra no log (você consegue ver em Cloud → Emails se chegou ou bounced)

---

### O que você precisa fazer

1. **Aprovar este plano** — eu inicio a configuração
2. **Adicionar 2 registros NS** no painel DNS do `mrflow.com.br` (te passo os valores exatos depois que o assistente abrir)
3. Pronto — assim que o DNS verificar, todos os convites futuros saem automaticamente

### O que NÃO muda
- Convites existentes continuam válidos
- O link `/invite/{token}` continua o mesmo
- Você pode continuar copiando o link manualmente se quiser
- Emails de auth (reset de senha, verificação) também passam a usar esse domínio automaticamente — bônus

### Próximo passo (futuro)
Quando avançarmos pra Fase 3 (Stripe), os emails de **confirmação de pagamento, fatura e renovação** vão usar essa mesma infraestrutura — sem retrabalho.

---

**Posso prosseguir?** Ao aprovar, abro o assistente de configuração de domínio e em seguida implemento o template + disparo automático.