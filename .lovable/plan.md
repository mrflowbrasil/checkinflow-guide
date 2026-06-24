## Ajustes na tela de Autenticação pós-compra

### 1. Nova rota `/signup`
- Em `src/App.tsx`, registrar `<Route path="/signup" element={<Auth />} />` apontando para o mesmo componente `Auth`.
- Em `src/pages/Auth.tsx`:
  - Detectar a rota atual via `useLocation()`. Se `pathname === "/signup"` (ou se houver `?mode=signup` para compatibilidade), inicializar `tab` como `"signup"` em vez de `"signin"`.
  - Quando o usuário clicar na aba "Entrar"/"Criar conta", atualizar a URL com `navigate("/auth")` ou `navigate("/signup")` para manter slug e estado sincronizados (sem recarregar).

### 2. Redirecionar comprador para `/signup`
- Em `src/pages/LaunchSuccess.tsx`, trocar o botão principal:
  - De: `/auth?mode=signup&plan=launch`
  - Para: `/signup?plan=launch`
- Botão secundário "Já tenho conta — Entrar" permanece em `/auth`.

### 3. Remover menções "30 dias grátis"
- Em `src/pages/Auth.tsx` (aba "Criar conta"):
  - Remover o badge `"30 dias grátis · Sem cartão"` (linhas ~162-166).
  - Remover o item da lista `"30 dias grátis no plano Single"` (substituir por algo neutro como `"Acesso completo ao Welcome Hub"` ou simplesmente remover o item — recomendo remover).
  - Remover o rodapé `"Você começa com 30 dias grátis no plano Single. Sem pegadinhas."` abaixo do botão "Criar conta gratuita".
  - Alterar o texto do botão de `"Criar conta gratuita"` → `"Criar minha conta"` (já que não é mais "grátis").

### 4. Cor de destaque #00FFFF
- Em `src/pages/Auth.tsx`, substituir `color: "#5EEAD4"` por `color: "#00FFFF"` nos dois `<span>` de destaque ("Inteligente" e "profissionalizar"). Não alterar os checks/ícones (manter o verde-água atual para os ícones de lista, já que aqueles itens serão removidos/reduzidos).

### Detalhes técnicos
- `useLocation` do `react-router-dom` para ler `pathname`.
- O `Tabs onValueChange` faz `navigate(value === "signup" ? "/signup" : "/auth", { replace: true })` preservando `search` (querystring com `plan=launch`).
- Nenhuma mudança em lógica de signup/login, webhook ou trigger.

### Arquivos alterados
- `src/App.tsx` — adiciona rota `/signup`.
- `src/pages/Auth.tsx` — slug-driven tab, remoção de 30 dias, cor #00FFFF, texto do botão.
- `src/pages/LaunchSuccess.tsx` — botão aponta para `/signup?plan=launch`.