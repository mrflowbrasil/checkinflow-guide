## Objetivo

Redesenhar a coluna esquerda da página `/auth` com cara de hotelaria premium: imagem de interior aconchegante como fundo, overlay sutil para legibilidade e tipografia moderna. A coluna troca de conteúdo quando o usuário muda para a aba "Criar conta".

## Imagem de fundo

Já gerei uma foto editorial de uma sala de estar moderna, clara e arejada (estilo Airbnb premium — luz natural, sofá de linho, madeira clara, plantas), pronta para servir de fundo nas duas abas. Será publicada via Lovable Assets (`src/assets/auth/hospitality-bg.jpg.asset.json`).

## Mudanças em `src/pages/Auth.tsx`

### Coluna esquerda — base comum

- Trocar o gradiente azul-escuro atual pela imagem hospedada (`background-image` + `background-size: cover` + `background-position: center`).
- Aplicar overlay duplo para garantir contraste:
  - Camada escura suave: `linear-gradient(180deg, rgba(8,15,25,0.55) 0%, rgba(8,15,25,0.75) 100%)`
  - Vinheta inferior extra para o rodapé de copyright.
- Logo `MrFlowLogo` continua no topo (forçado branco).
- Bloco de texto centralizado verticalmente (`justify-center` ao invés de `justify-between`) com `px-12 lg:px-16` e `max-w-lg`.
- Rodapé de copyright posicionado absoluto no rodapé (`absolute bottom-8 left-12`) para não brigar com o centro.

### Conteúdo — aba "Entrar" (mantém copy atual, novo visual)

- **H1:** "Hub de Boas Vindas Inteligente" (palavra "Inteligente" em ciano `#5EEAD4` para suavizar do verde-limão atual e harmonizar com a foto).
- **Subtítulo:** "Encante seu hóspede desde o primeiro momento com um guia digital completo da sua hospedagem." (branco/85, peso regular).

### Conteúdo — aba "Criar conta" (novo)

- **Pequeno eyebrow** acima do título: `30 DIAS GRÁTIS · SEM CARTÃO` em tracking wide, ciano translúcido.
- **H1:** "Falta apenas um passo para profissionalizar seu imóvel"
- **Subtítulo:** "Monte o seu guia digital hoje e garanta acesso imediato a todas as vantagens:"
- **Lista de 4 itens** com check ciano em pílula circular (`bg-white/10 border border-white/20`), cada item com título em destaque + complemento secundário menor:
  1. **30 dias grátis no plano Single** — Sem pegadinhas e sem precisar de cartão de crédito.
  2. **Bônus 1 liberado: Scripts de Mensagens** — Modelos prontos para WhatsApp (copia e cola).
  3. **Bônus 2 liberado: Guia Prático de Automação** — Para anfitriões que querem escalar.
  4. **Suporte humano via WhatsApp** — Direto com a gente para te ajudar na configuração.

### Transição entre abas

- A coluna esquerda recebe `key={tab}` no bloco de conteúdo + classes `transition-opacity duration-500` para um fade suave quando o usuário alterna entre Entrar/Criar conta.

### Tipografia

- Mantém a stack atual do projeto (sem nova fonte). Headline em `font-bold text-4xl lg:text-5xl leading-[1.1] tracking-tight text-white`. Subtítulo `text-base lg:text-lg text-white/85 leading-relaxed`. Lista `text-sm lg:text-[15px]` com título em `font-semibold text-white` e complemento em `text-white/70`.

## Fora de escopo

- Coluna direita (formulário) fica intacta.
- Versão mobile (`lg:hidden` no hero atual) continua sem hero — apenas o card de formulário, como hoje.
- Nenhuma mudança em validações, Supabase, rotas ou textos do formulário.

## Arquivos tocados

- `src/pages/Auth.tsx` — coluna esquerda + lógica condicional por aba.
- `src/assets/auth/hospitality-bg.jpg.asset.json` (novo, via Lovable Assets).
