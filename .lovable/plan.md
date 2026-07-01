## Plano de correção definitiva do degradê da capa

1. **Eliminar a causa provável do erro atual**
   - Hoje o degradê depende de um elemento absoluto (`.guide-cover-transition`) posicionado no fim da capa, com altura negativa/externa ao bloco da imagem.
   - Em alguns navegadores mobile, especialmente Android, esse tipo de overlay pode ficar atrás do conteúdo, ser cortado pelo contexto de empilhamento ou parecer uma linha branca, como no print.

2. **Trocar a implementação por uma solução estrutural simples**
   - Manter o overlay de legibilidade escuro sobre a imagem apenas para leitura do título.
   - Para o modo `Degradê`, aplicar o fade diretamente como uma camada visual que cobre a parte inferior da imagem e continua sobre a área inicial do conteúdo.
   - O objetivo é que a imagem desapareça suavemente para a cor real de fundo do template, sem depender de `mask-image`, sem valores HSL com alpha e sem elemento de 1px.

3. **Garantir que a cor de destino seja a mesma do template**
   - Usar variáveis RGB já existentes por template (`--guide-bg-rgb`) como fonte única da cor final.
   - Ajustar qualquer template que ainda esteja sem RGB correto para evitar degradê branco quando o fundo não for branco.

4. **Corrigir a tela real e a prévia**
   - Aplicar a mesma lógica em:
     - Guia público (`src/pages/GuestGuide.tsx`)
     - Prévia de templates (`src/components/templates/TemplatePreviewDialog.tsx`)
   - Remover inconsistências como a prévia fixa em `data-cover-style="line"`, para que a prévia não mascare o problema.

5. **Plano B, se a opção continuar frágil**
   - Se a implementação ainda apresentar instabilidade visual no Android, remover a função de `Transição da capa` da tela de personalização.
   - Nesse caso, todos os guias voltarão para o modo seguro `Linha`, preservando capa, botões e templates sem risco visual.

6. **Validação**
   - Verificar no viewport mobile o guia público com `data-cover-style="gradient"` e confirmar visualmente que:
     - não existe faixa branca dura entre capa e conteúdo;
     - o degradê aparece sobre a transição imagem → fundo;
     - os botões e o restante do guia não são cobertos pelo overlay.