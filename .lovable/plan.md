## Objetivo

Tornar a coluna esquerda (imagem + overlay + copy) visível em tablet e mobile na página `/auth`, mantendo o layout desktop atual intacto.

## Proposta de layout

### Desktop (lg+) — sem mudança
Continua com grid 2 colunas: hero à esquerda, formulário à direita.

### Tablet e Mobile — novo layout empilhado
1. **Hero compacto no topo** (full-width)
   - Mesma imagem de acomodação + overlay escuro já usados no desktop.
   - Logo Mr. Flow + "Welcome Hub" no canto superior esquerdo (branco).
   - Conteúdo centralizado horizontalmente com padding generoso.
   - **Aba "Entrar":** headline "Hub de Boas Vindas Inteligente" + subtítulo curto.
   - **Aba "Criar conta":** badge "30 dias grátis · Sem cartão" + headline "Falta apenas um passo…" + lista compacta de 4 bullets com check ciano (tipografia menor que no desktop para caber sem rolagem excessiva).
   - Altura: `min-h-[60vh]` no mobile, `min-h-[55vh]` no tablet — proporção agradável sem dominar a tela.
   - Transição suave de cor de fundo no rodapé do hero para a cor do form abaixo (fade do overlay).

2. **Card de formulário logo abaixo**
   - Reutiliza o `<Card>` atual.
   - No mobile, remove o bloco duplicado de logo dentro do card (`lg:hidden flex flex-col items-start gap-1 mb-8`) — a logo já aparece no hero acima.
   - Mantém abas, botão Google, campos e CTA exatamente como hoje.
   - Fundo da seção do form continua `bg-[#f6f6f7]`.

3. **Rodapé de copyright**
   - Move o rodapé de copyright para o fim da página em mobile/tablet (abaixo do card), centralizado, em texto muted, no mesmo padrão do bloco `lg:hidden` que já existe.
   - No desktop continua absolutamente posicionado dentro do hero como hoje.

## Detalhes técnicos

- Trocar o wrapper raiz de `grid lg:grid-cols-2` para `flex flex-col lg:grid lg:grid-cols-2` para empilhar abaixo de `lg`.
- Remover `hidden lg:flex` do bloco hero — passa a ser sempre visível.
- Ajustar paddings responsivos do hero:
  - Mobile: `px-6 py-12` com headline `text-3xl` e bullets `text-sm`.
  - Tablet: `px-10 py-16` com headline `text-4xl`.
  - Desktop: paddings atuais (`px-12 lg:px-16 py-24`).
- Logo absoluta no topo: ajustar para `top-6 left-6 lg:top-10 lg:left-12`.
- Rodapé absoluto: aplicar `hidden lg:block` (só desktop) e renderizar versão estática mobile já existente abaixo do card.
- Badge "30 dias grátis" alinhada à direita já está; no mobile vira `justify-start` para ficar mais natural empilhada com o título.
- Bullets em mobile: reduzir `space-y-4` → `space-y-3` e ícone `h-5 w-5` para compactar.

## Fora de escopo

- Mudanças no formulário, validações, fluxo de auth, OAuth, copy do desktop.
- Nova imagem de fundo (reutiliza a existente).
- Mudança visual do card de formulário.

## Arquivo tocado

- `src/pages/Auth.tsx`
