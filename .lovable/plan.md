# Tela de abertura do guia + senha opcional

## 1. Banco de dados (migration)

Adicionar dois campos em `public.properties`:
- `access_password_enabled boolean not null default false`
- `access_password text` (texto simples — senha de acesso simples de hóspede; não é credencial de login)

Sem mudanças de RLS (a leitura pública já filtra por slug). A validação da senha acontece no cliente comparando com o valor retornado para o slug público.

## 2. Painel do imóvel (`EditPropertyDialog.tsx`)

Nova seção "Acesso ao hub":
- Switch "Exigir senha para acessar o hub"
- Campo de texto "Senha de acesso" (exibido só quando o switch estiver ativo)
- Salva os dois campos junto com o restante das edições do imóvel

## 3. Splash de abertura (`GuestGuide.tsx`)

Novo componente `GuestIntroSplash` exibido **antes** do conteúdo atual do guia (a tela com capa + "HUB DE BOAS VINDAS"):

Sequência (duração total ~1.8s, "skipável" no clique/tap):
1. **0–600ms**: capa do imóvel (`cover_image_url`) ocupa a tela inteira com um leve zoom-in (scale 1.08 → 1.0) e fade-in. Overlay escuro suave para legibilidade.
2. **400–1400ms**: frase "Seja bem-vindo!" aparece centralizada, com fonte manuscrita (Google Font `Caveat` ou `Dancing Script`), simulando escrita à mão da esquerda para a direita via animação de `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)` (efeito de "caneta passando"). Sem libs externas.
3. **A partir de 1400ms**:
   - Se o imóvel **não** exigir senha: a splash faz fade-out e o guia principal entra (≤ 2s no total).
   - Se exigir senha: aparece abaixo da frase um pequeno formulário com input + botão "Entrar". Erro inline em caso de senha incorreta. Ao acertar, fade-out e entrada do guia.

Detalhes técnicos:
- Animações com CSS keyframes + `prefers-reduced-motion` (mostra estado final imediato).
- Após sucesso, gravar `sessionStorage[`guide-unlocked-${slug}`] = "1"` para não pedir novamente na mesma sessão.
- Splash sempre roda na primeira abertura da sessão (mesmo sem senha), pulando se a chave de sessão existir.

## 4. Versão
Bump em `public/version.json`.

## Fora do escopo
- Recuperação de senha / reset (é uma senha simples definida pelo anfitrião).
- Logs de tentativa de acesso.

Confirma para eu seguir?