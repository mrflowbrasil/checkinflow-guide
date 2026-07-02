# Expiração real do contador em /oferta

## Objetivo
Hoje o contador `UrgencyCountdown` está em modo "rolling" (reseta sozinho ao zerar), então o botão de compra nunca é bloqueado. Vamos transformá-lo em uma expiração **de verdade por visitante** (15 min a partir da 1ª visita, persistido em `localStorage`), bloquear todos os CTAs quando expirar e abrir um modal informando que a oferta acabou.

## Comportamento final
- 1ª visita → deadline salvo em `localStorage` (`lp:urgente:deadline:15m`) por 15 min.
- Enquanto `agora < deadline`: tudo funciona como hoje.
- Quando `agora >= deadline`:
  - Contador congela em `00:00`, muda para tom "apagado" (cinza), e o rótulo vira **"Oferta expirada"**.
  - Todos os botões de compra da página ficam desabilitados (header "Garantir vaga", CTA do hero, CTA do bloco final, botão do `LaunchOffer`, botão do `ExitIntentDialog`). Visualmente ficam opacos, `cursor-not-allowed`, sem executar `openLaunchCheckout`.
  - Abre automaticamente 1 vez um modal **"Oferta expirada"** com:
    - Título: "Essa oferta encerrou"
    - Texto curto: as 100 vagas do lote de lançamento foram encerradas / o tempo acabou.
    - CTA primário: **"Ver planos disponíveis"** → navega para `/#planos` (seção de planos da home).
    - CTA secundário (link): **"Voltar para a página inicial"** → `/`.
  - O modal pode ser fechado, mas os CTAs continuam desabilitados enquanto o deadline estiver vencido.
- Refresh após expirado → estado expirado continua (deadline no `localStorage` já passou).

## Arquitetura

### 1. Novo hook `useOfferDeadline`
`src/hooks/useOfferDeadline.tsx` — fonte única da verdade sobre o estado da oferta, para não espalhar lógica de tempo.

Retorna:
```ts
{
  remainingMs: number;
  expired: boolean;
  deadline: number; // epoch ms
}
```
- Lê/inicializa o deadline no `localStorage` (mesma chave e duração do `CONFIG` atual).
- `setInterval(1000)` para atualizar `remainingMs` e `expired`.
- Uma vez `expired = true`, **não reseta mais** (diferente do rolling atual).

### 2. Contexto `OfferStatusContext` (escopo local à página)
`src/pages/LpAnuncioUrgente.tsx` cria um `OfferStatusProvider` que envolve toda a página e expõe `{ expired }` via `useOfferStatus()`. Assim, o `CTA` interno, o botão do header, o `LaunchOffer` e o `ExitIntentDialog` sabem se devem bloquear sem prop drilling.

### 3. Ajustes em `UrgencyCountdown`
`src/components/lp/UrgencyCountdown.tsx`:
- Adicionar prop opcional `stopOnZero?: boolean` (default `false` para não quebrar outros usos).
- Quando `stopOnZero` e chegou a zero: parar o interval, congelar em `00:00`, aplicar classe visual "expirada" (bg cinza em vez do gradiente vermelho) e trocar o `aria-label` para "Oferta expirada".
- Manter compatibilidade total com o modo rolling existente.

### 4. Bloqueio dos CTAs em `LpAnuncioUrgente.tsx`
- O componente interno `CTA` lê `useOfferStatus()`. Se `expired`, renderiza `<Button disabled>` com texto **"Oferta encerrada"** e sem `onClick`.
- Botão "Garantir vaga" do header idem.
- `LaunchOffer` já é reutilizado em outras páginas, então **não** vou alterá-lo globalmente. Em vez disso, envolvo a instância dessa página em um wrapper que, quando `expired`, sobrepõe uma camada com `pointer-events-none` + opacidade e mostra um badge "Oferta encerrada" por cima. (Alternativa mais limpa se preferir: aceitar uma prop `disabled` em `LaunchOffer` — posso fazer se você quiser tocar naquele componente.)
- `ExitIntentDialog`: quando `expired`, não abre mais (não faz sentido tentar reter para uma oferta que acabou).

### 5. Novo componente `OfferExpiredDialog`
`src/components/lp/OfferExpiredDialog.tsx` usando `Dialog` do shadcn:
- Abre automaticamente na primeira vez que `expired` vira `true` (efeito com flag em `useRef` para não reabrir se o usuário fechar).
- Ícone de relógio/alerta em tom neutro (sem tom hostil).
- Botões: "Ver planos disponíveis" (`window.location.href = "/#planos"`) e "Voltar ao início" (`<Link to="/">`).
- Dispara `track("view_urgente_expired_modal")` ao abrir.

### 6. Tracking
Adicionar em `LpAnuncioUrgente.tsx`:
- `track("urgente_offer_expired")` no momento em que `expired` transiciona para `true`.
- `track("click_urgente_expired_cta", { target: "planos" | "home" })` nos CTAs do modal.

## Arquivos afetados
- `src/hooks/useOfferDeadline.tsx` (novo)
- `src/components/lp/OfferExpiredDialog.tsx` (novo)
- `src/components/lp/UrgencyCountdown.tsx` (prop `stopOnZero`, visual expirado)
- `src/pages/LpAnuncioUrgente.tsx` (provider, wiring, wrapper do `LaunchOffer`, bloqueio dos CTAs, modal)

## Fora do escopo
- Não altero `LaunchOffer.tsx`, `LpAnuncio.tsx`, nem o comportamento em outras páginas — a expiração é local à `/oferta`.
- Não mexo em `SpotsRemaining` (vagas restantes continuam decrescendo como hoje).
- Sem mudanças de banco/edge functions.

## Validação
- Testar manualmente forçando `localStorage.setItem("lp:urgente:deadline:15m", String(Date.now() - 1000))` e recarregando `/oferta`: contador deve aparecer expirado, modal deve abrir, CTAs devem estar desabilitados.
- Testar fluxo normal: primeira visita → contador rodando → CTAs ativos.
- Rodar Playwright headless para screenshot do estado expirado e confirmar visualmente.
