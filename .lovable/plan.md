## Contexto
Na seção Hero de `LpAnuncio.tsx`, os 3 botões ("Criar meu guia grátis", "Ver como o hóspede acessa", "Receber Guia no WhatsApp") estão empilhados verticalmente mesmo no desktop. O usuário quer que fiquem lado a lado na versão desktop.

## O que será feito
1. Ajustar o container dos botões (linha ~142) para forçar layout horizontal sem wrap em telas `lg` e acima.
2. Fazer os botões se ajustarem ao espaço disponível (shrink/grow) para caber sem quebrar linha.
3. Manter o empilhamento atual no mobile (`flex-col` em telas pequenas).

## Arquivos
- `src/pages/LpAnuncio.tsx` — alterar classes do container de botões e adicionar classes de flexibilidade nos botões.

## Resultado esperado
- Mobile: botões empilhados (sem alteração)
- Desktop (`lg`): 3 botões em uma única linha horizontal