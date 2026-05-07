## Redesign do cartão de boas-vindas (PDF A4)

Reescrita do `src/lib/welcome-pdf.ts` para um layout mais elegante, centralizado e tipograficamente refinado, mantendo as opções de cor (template / preto e branco) e o aviso já existente no diálogo.

### 1. Estrutura e eixo central
- Eixo vertical único: logo → título → subtítulo (nome da propriedade) → QR Code → texto explicativo → rodapé.
- Tudo alinhado ao centro horizontal da página (105 mm).
- Largura útil de conteúdo limitada a ~130 mm para garantir boas quebras de linha e respiro lateral.
- Espaçamentos generosos e consistentes entre blocos (ritmo vertical baseado em múltiplos de 8 mm).

### 2. Logo do cliente (topo, centralizada, circular)
- Posicionada no topo, centralizada horizontalmente, ~28 mm de diâmetro, ~25 mm do topo.
- Renderização circular real no PDF:
  - desenhar a imagem dentro de um clip circular usando `doc.circle(...).clip()` seguido de `doc.addImage(...)`;
  - como o `LogoCropDialog` já exporta um PNG quadrado com a logo perfeitamente enquadrada (cropShape round + objectFit contain), basta encaixar a imagem no bounding box do círculo para preservar o crop do usuário;
  - borda sutil em cinza claro (`setDrawColor(230,230,230)`) ao redor do círculo para destacar suavemente sobre o fundo.
- Espaço de ~16 mm entre logo e título.

### 3. Tipografia elegante (fontes customizadas no jsPDF)
- Carregar fontes Google via `fetch` + `addFileToVFS` + `addFont` em runtime (cacheadas em módulo):
  - **Playfair Display** (700) — título "SEJA BEM-VINDO" (escolhida como mais segura/disponível entre as sugeridas; comportamento próximo a Hollanda).
  - **Montserrat** (500) — subtítulo (nome da propriedade).
  - **Inter** (400) — texto explicativo e rodapé.
- Fallback automático para Helvetica se o fetch falhar (ambiente offline / bloqueio CORS), com log silencioso.
- Hierarquia:
  - Título: 32 pt, tracking ~1.5, cor de destaque (primary ou preto no modo B&W).
  - Subtítulo: 16 pt, peso médio, cor `#3a3a3a`.
  - Texto explicativo: 11.5 pt, line-height 1.6, cor `#5a5a5a`.

### 4. QR Code
- Centralizado, 80 mm, com margem uniforme.
- Moldura sutil arredondada (raio 3 mm) em cinza muito claro, com 4 mm de padding interno.
- Cor dos módulos: primary no modo "color", preto no modo "bw".

### 5. Texto explicativo
- Largura máxima 110 mm, alinhamento central, 2–3 linhas equilibradas.
- Texto: "Aponte a câmera do seu celular para o QR Code acima e acesse todas as informações da sua estadia: check-in, Wi-Fi, regras da casa e dicas da região."
- Pequeno título acima ("Como acessar seu hub de boas-vindas") em 12 pt, cor de destaque, com leve tracking.

### 6. Rodapé
- Remover completamente o logo Mr.Flow do PDF (import deixa de ser usado).
- Linha divisória fina opcional 12 mm acima do texto.
- Texto único centralizado a ~14 mm da base:
  `Desenvolvido por: www.hub.mrflow.com.br`
- Inter 9 pt, cor `#9a9a9a`.

### 7. Paleta e modo de cor
- Modo "color": usa `tenant.primary_color` para título, micro-título acima do texto e módulos do QR.
- Modo "bw": tudo em escala de cinza (título preto, textos em tons de cinza), QR preto.
- Fundo da página permanece branco para impressão econômica; tons sugeridos (verde/bege) entram apenas via a cor primary do tenant quando aplicável — não introduzimos cores fixas para não conflitar com a marca do cliente.

### 8. Sem alterações em outras áreas
- `WelcomeCardDialog.tsx` permanece igual (mantém aviso âmbar e seletor de modo).
- `PropertyDetail.tsx` permanece igual.
- Nenhuma mudança de schema, rota ou lógica de negócio.

### Detalhes técnicos
- Arquivo afetado: `src/lib/welcome-pdf.ts` (reescrita completa da função `generateWelcomePdf`).
- Novas helpers internas:
  - `ensureFontsLoaded(doc)` — carrega Playfair/Montserrat/Inter sob demanda, com cache em módulo.
  - `drawCircularImage(doc, dataUrl, cx, cy, r)` — usa `doc.circle(cx, cy, r).clip()` + `doc.addImage` + `discardPath()` para clipping circular real.
- Remove import de `mrFlowLogo` (não é mais usado).
- Mantém assinatura pública `generateWelcomePdf(opts: WelcomePdfOptions)` para não quebrar o `WelcomeCardDialog`.
