## Diagnóstico
A coluna de texto do hero não tem largura suficiente (~520px na largura atual) para acomodar os 3 botões em linha sem cortar o texto. Forçar `flex-1` neles fez o texto vazar.

Tentar encolher ainda mais (padding/texto menor) deixa os botões feios. E voltar a empilhar perde o pedido original.

## Solução proposta
Tirar a linha de botões de dentro da coluna de texto e movê-la para **abaixo do grid hero**, ocupando toda a largura do container (`max-w-6xl`). Assim:

- A imagem volta ao tamanho padrão (a coluna esquerda não precisa mais segurar os botões).
- Os 3 botões ficam confortavelmente lado a lado em uma única linha no desktop, com padding e tamanho de texto normais.
- No mobile, continuam empilhados como sempre.

```text
Desktop (lg+):
┌──────────────────────────────┬──────────────┐
│ Badge                        │              │
│ H1                           │   Imagem     │
│ Parágrafo                    │   (padrão)   │
└──────────────────────────────┴──────────────┘
[ Criar guia ] [ Ver como hóspede ] [ Receber no WhatsApp ]
Leva menos de 5 minutos...
✓ Sem app   ✓ Link/QR   ✓ Atualização
```

## Mudanças em `src/pages/LpAnuncio.tsx` (HeroLp)
1. Reverter os botões para classes originais (sem `lg:flex-1`, `lg:px-3`, `lg:text-sm`, `min-w-0`).
2. Mover o bloco `<div>` com os 3 botões + o parágrafo "Leva menos de 5 minutos..." + a lista de checks ("Sem app", "Link/QR", "Atualização") para **fora** do grid `lg:grid-cols-[1.05fr_1fr]`, posicionando-os logo abaixo do grid, dentro do mesmo container.
3. No desktop, a linha de botões usa `lg:flex-row lg:flex-nowrap lg:justify-start` com gap padrão e largura natural.
4. Remover o `min-w-0` adicionado na coluna esquerda (não é mais necessário).

## Resultado
- Imagem: tamanho original restaurado.
- Botões: 3 lado a lado, sem corte de texto, no desktop.
- Mobile: empilhamento natural mantido.
- Nenhuma alteração no copy ou estilo visual dos botões.