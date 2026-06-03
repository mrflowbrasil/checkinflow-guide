## Objetivo
Remover os hotspots invisíveis e o banner de conversão da imagem do hero. Em vez disso, o banner "Gostou da facilidade? Criar Meu Guia Grátis" deve aparecer na seção **Demo real**, logo abaixo (ou ao lado) do mockup do celular, sempre que o visitante fechar uma das páginas internas (Wi-Fi, Check-in, Regras, etc.) abertas dentro da demo.

## Por que é possível
O iframe da Demo aponta para `hub.mrflow.com.br/g/...`, mesmo origin do site publicado. Podemos usar `postMessage` da página do hóspede para a LP — sem violar políticas de cross-origin em produção.

## Mudanças

### 1. `src/pages/GuestGuide.tsx`
Notificar o parent quando o hóspede fecha uma página (Sheet `onOpenChange` indo de aberto → fechado).
- Dentro do `onOpenChange` do `<Sheet>` (linha 279), quando `o === false` e havia `activePageKey`, além de `setActivePageKey(null)`, chamar:
  ```ts
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "wh_demo_page_closed", pageKey: activePageKey }, "*");
  }
  ```
- Não altera nada do fluxo visual do guia.

### 2. `src/pages/LpAnuncio.tsx` — `HeroLp` (linhas 130–308)
- Remover os 4 botões hotspot sobre o mockup (linhas 211–235) e a `pointer-events` wrapper.
- Remover o `onClick={openDemoCta}` do card lifestyle (linha 241) — volta a ser uma imagem decorativa estática.
- Remover o banner inline `demoCtaOpen` do hero (linhas 263–306).
- Remover o estado `demoCtaOpen`, `openDemoCta`, `hotspotClass` e o evento `lp_demo_hotspot_click`.

### 3. `src/pages/LpAnuncio.tsx` — `RealDemoLight` (linhas 506–581)
- Adicionar estado local `const [ctaOpen, setCtaOpen] = useState(false)`.
- Adicionar `useEffect` que escuta `window.addEventListener("message", ...)`: quando `event.origin` for `https://hub.mrflow.com.br` (ou contiver `mrflow.com.br`) e `event.data?.type === "wh_demo_page_closed"`, chamar `setCtaOpen(true)` e, opcionalmente, fazer `scrollIntoView` suave no banner.
- Adicionar fallback para o ambiente de preview Lovable (origin diferente): aceitar também se `event.data?.type === "wh_demo_page_closed"` sem checar origin estritamente quando o data shape bater (mensagem é inofensiva).
- Renderizar o mesmo banner "Gostou da facilidade? — Criar Meu Guia Grátis" (transplantado do hero) logo abaixo do mockup do celular, dentro da coluna direita do grid (após o `</div>` do mockup, linha 575). Mostrar/ocultar com a mesma transição `opacity/translate-y` baseada em `ctaOpen`, com botão de fechar (`X`) que faz `setCtaOpen(false)`.

### 4. Sem mudanças em outros CTAs
Os botões "Criar meu guia grátis" / "Abrir demo completa" continuam apontando para `/auth` e `DEMO_URL` como hoje. Nenhum outro componente é afetado.

## Fora do escopo
- Não mudar visual do hero além da remoção dos hotspots/banner.
- Não criar nova rota nem alterar `GuestPagePreview`.
- Não tocar em backend, analytics ou tracking existentes.
