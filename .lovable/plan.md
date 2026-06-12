# Modal de cadastro rápido na landing page

Substituir o redirect para `/auth` em todos os CTAs "Criar meu hub grátis" / "Criar meu guia grátis" / "Começar grátis" da landing page por um modal que cria a conta, faz login automático e leva o usuário direto pro `/app`.

## 1. Novo componente `QuickSignupDialog`

Arquivo: `src/components/lp/QuickSignupDialog.tsx`.

Conteúdo:
- Dialog (shadcn) centralizado, overlay escuro suave, bordas arredondadas, responsivo.
- Topo: imagem mockup anexada (`mockup-comp-light.webp`) subida via `lovable-assets` para `src/assets/lp/mockup-comp-light.webp.asset.json`, com `object-contain` e altura fluida.
- Título: "Comece seu guia grátis agora".
- Subtítulo: "Preencha seus dados e acesse o Welcome Hub por 30 dias grátis, sem cartão de crédito."
- Campos: Nome e E-mail (validação zod — nome ≥2, email válido).
- Botão principal cor da marca (#008e8e / `bg-primary`): "Criar meu hub grátis". Durante envio: texto vira "Criando seu acesso…", `disabled` para evitar duplo clique.
- Texto pequeno: "30 dias grátis no plano Single. Sem cartão. Sem pegadinhas."
- Estado de erro de e-mail já existente: troca o conteúdo do dialog por uma mensagem amigável "Já existe uma conta com este e-mail. Entrar agora?" + botão "Entrar na minha conta" → leva para `/auth`.

## 2. Edge function `quick-signup`

Arquivo: `supabase/functions/quick-signup/index.ts` (público, sem JWT).

Fluxo:
1. Recebe `{ name, email }`. Valida.
2. Usa service-role client para verificar se o e-mail já existe (`auth.admin.listUsers` filtrando por email, ou tenta criar e trata erro de duplicado). Se existe → retorna `{ status: "exists" }`.
3. Gera senha temporária forte (16 chars aleatórios) e cria usuário com `auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: name } })`. `email_confirm: true` garante que o login com senha funciona sem o usuário precisar abrir email antes.
4. Dispara `send-transactional-email` com um novo template `quick-signup-welcome` contendo: boas-vindas, senha temporária visível, e botão "Trocar minha senha" linkando para `${SITE_URL}/reset-password` (via `resetPasswordForEmail` server-side ou link direto).
5. Retorna `{ status: "created", email, tempPassword }` para o cliente.

Adicionar em `supabase/config.toml`: `[functions.quick-signup] verify_jwt = false`.

## 3. Novo template de e-mail

Arquivo: `supabase/functions/_shared/transactional-email-templates/quick-signup-welcome.tsx`.

Conteúdo: marca Mr Flow, saudação com nome, frase explicando que a conta foi criada via landing, **senha temporária em destaque** (caixa monoespaçada), CTA "Trocar minha senha agora" apontando para a página de reset, observação de validade/segurança. Registrar em `_shared/transactional-email-templates/registry.ts`.

## 4. Login automático no cliente

No `QuickSignupDialog`, após a edge function retornar `created`:
1. `await supabase.auth.signInWithPassword({ email, password: tempPassword })`.
2. Toast "Conta criada! Enviamos sua senha temporária por email."
3. `navigate("/app")`.

A senha temporária nunca é exibida na UI da LP — só usada em memória para o login e enviada por email.

## 5. Integração com a landing page

Em `src/pages/LpAnuncio.tsx`:
- Adicionar `const [signupOpen, setSignupOpen] = useState(false)` e renderizar `<QuickSignupDialog open={signupOpen} onOpenChange={setSignupOpen} />` ao final do componente.
- Substituir cada `<Link to="/auth">Criar meu hub grátis</Link>` (e variações "Criar meu guia grátis", "Começar grátis", "Criar Meu Guia Grátis") por um `<Button onClick={() => setSignupOpen(true)}>…</Button>` mantendo o mesmo visual atual.
- Manter o `<Link to="/auth">Entrar</Link>` do topo intacto (usuário que já tem conta).

## Detalhes técnicos

- Auto-confirm de e-mail fica restrito a este fluxo via `email_confirm: true` no `admin.createUser`. Não mexe na config global (`auto_confirm_email`) — outros signups normais continuam exigindo verificação.
- Edge function usa `SUPABASE_SERVICE_ROLE_KEY` (já disponível em functions) — nada exposto no cliente.
- Validação zod no cliente + revalidação no servidor.
- Tratamento de erros: rate limit / falha de envio de email → mostra toast amigável e mantém o modal aberto.
- Sem alteração em rotas, RLS, ou tabelas existentes.

## Arquivos a criar/editar

- criar: `src/components/lp/QuickSignupDialog.tsx`
- criar: `src/assets/lp/mockup-comp-light.webp.asset.json`
- criar: `supabase/functions/quick-signup/index.ts`
- criar: `supabase/functions/_shared/transactional-email-templates/quick-signup-welcome.tsx`
- editar: `supabase/functions/_shared/transactional-email-templates/registry.ts`
- editar: `supabase/config.toml` (verify_jwt=false para quick-signup)
- editar: `src/pages/LpAnuncio.tsx` (trocar CTAs por trigger do modal)
