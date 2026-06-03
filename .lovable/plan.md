## Objetivo
Alinhar visualmente as colunas Antes x Depois reescrevendo cada item "Depois" como resposta direta ao "Antes" correspondente, com tamanho de texto similar (2 linhas).

## Mudança
Em `src/pages/LpAnuncio.tsx`, substituir o array `depois` (linhas 266-272) para que cada item espelhe o pain do "Antes" na mesma posição:

| # | Antes | Depois (novo) |
|---|---|---|
| 1 | Hóspede te acordando às 23h para perguntar a senha do Wi-Fi. | Wi-Fi disponível no guia 24h por dia — hóspede acessa sozinho sem te incomodar. |
| 2 | Mensagens perdidas e hóspede esperando do lado de fora do imóvel. | Instruções de check-in claras, com fotos e passo a passo, sempre à mão no celular. |
| 3 | Hóspede ligando estressado e trancando a rua porque não entendeu onde parar o carro. | Localização, vagas e orientações de estacionamento explicadas com mapa e imagens. |
| 4 | Responder às mesmas 15 perguntas todos os dias, em vez de focar em crescer o seu negócio. | Todas as respostas centralizadas no guia — você ganha tempo pra focar no seu negócio. |
| 5 | Perder a nota 5 estrelas no Airbnb por pequenos erros de comunicação na chegada. | Experiência profissional do início ao fim, mais chance de avaliação 5 estrelas. |

## Sem alterações
- Layout, classes, ícones, cores e estrutura dos cards permanecem iguais.
- O texto inferior ("O hóspede acessa tudo em um link...") fica inalterado.
- Não mexer no array `antes`.
