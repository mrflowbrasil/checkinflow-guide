## Diagnóstico

A rota `/` é servida por `src/pages/LpAnuncio.tsx`, não por `WelcomeHubLanding.tsx`. As animações que foram adicionadas no hero do `WelcomeHubLanding` nunca aparecem em `/`. As seções compartilhadas (`ParaQuemE`, `Funcionalidades`, `VideoCriacao`, `GarantiaSection`, `FaqSection`) já usam `<Reveal>`, então elas animam ao scrollar — mas o hero (primeira dobra) fica estático, dando a impressão de "nada mudou".

## Plano

1. **`src/pages/LpAnuncio.tsx`** — envolver os elementos do hero (badge, h1, subtítulo, parágrafo de apoio, CTA, mockup/imagem lateral, banner de prova social se houver) com `<Reveal immediate>` e pequenos `delay` escalonados (0 / 80 / 160 / 240 ms) para uma entrada suave em cascata sem esperar scroll.
2. Aplicar `<Reveal>` (sem `immediate`) em quaisquer outras seções de LpAnuncio que ainda não usem (ex.: faixa de logos de OTAs, blocos intermediários entre `VideoCriacao` e `GarantiaSection`), com stagger curto.
3. **`public/version.json`** — bump para forçar invalidação do `VersionWatcher` no preview.
4. Verificar no preview (`browser--view_preview` em `/`) que:
   - elementos do hero entram com fade + translateY logo no load;
   - ao scrollar, as seções aparecem progressivamente;
   - com `prefers-reduced-motion`, tudo aparece imediato (já garantido pelo CSS global).

## Fora do escopo

- Sem mudanças de layout, copy ou cores.
- Sem alterar `WelcomeHubLanding.tsx` (rota `/lp`) — já está animado.
- Sem novas libs.
