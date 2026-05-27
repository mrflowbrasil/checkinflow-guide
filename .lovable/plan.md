# Plano: Nova seção "Monte o guia em poucos minutos" (MacBook + vídeo)

## Objetivo
Substituir a `SolutionSection` atual (que usa `PhoneMockup`) por uma nova seção focada na experiência do **anfitrião** no painel administrativo, usando um mockup de MacBook com o vídeo `hub-rapido2.mp4` em loop. Manter a narrativa: primeiro o anfitrião cria → depois a demo mostra como o hóspede vê.

## Arquivo a alterar
- `src/pages/WelcomeHubLanding.tsx` — substituir a função `SolutionSection` (linhas ~260-319) por uma nova `HostBuilderSection`. A ordem na renderização principal já é: Solution → RealDemoPreview, então mantém-se a mesma posição.

## Asset
- Copiar `user-uploads://hub-rapido2.mp4` para `public/videos/hub-rapido2.mp4` (referenciado como `/videos/hub-rapido2.mp4` no `<video>`).
- Sem poster dedicado: usar `preload="metadata"` e fundo escuro na tela do notebook como fallback visual.

## Layout

```
┌──────────────────────────────────────────────────────────┐
│  [Badge: Para o anfitrião]                               │
│                                                          │
│  Monte o guia do seu      ┌──────────────────────┐      │
│  imóvel em poucos minutos │  ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄  │      │
│                           │  █  vídeo em loop  █  │     │
│  Subtítulo…               │  █   (MacBook)     █  │     │
│                           │  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀  │      │
│  ✓ bullet 1               │     ═══════════       │     │
│  ✓ bullet 2               │   (base do notebook)  │     │
│  ✓ bullet 3               └──────────────────────┘      │
│  ✓ bullet 4                                              │
│  ✓ bullet 5                                              │
│                                                          │
│  [Criar meu hub grátis] [Ver demo real]                  │
└──────────────────────────────────────────────────────────┘
```

- Desktop: grid 2 colunas (texto esquerda / notebook direita), `items-center`, gap generoso.
- Mobile: stack — texto primeiro, notebook depois.
- Fundo: transparente (a landing já tem fundo escuro). Atrás do notebook, halo radial ciano com `blur-3xl` (mesmo padrão usado na `RealDemoPreview`).

## Conteúdo

- **Badge**: "Para o anfitrião" — usar o estilo verde-limão atual (`bg-[#00FF00]/10 text-[#00FF00]`).
- **H2**: "Monte o guia do seu imóvel em poucos minutos"
- **Subtítulo**: "Crie páginas como Wi-Fi, check-in, checkout, regras da casa e dicas locais em um painel simples, com preview em tempo real e publicação instantânea."
- **Bullets** (com ícones pequenos em ciano `#00FFFF` dentro de quadrado arredondado, igual padrão atual):
  - Edit3 → "Edite informações da hospedagem sem depender de suporte técnico"
  - Layers → "Adicione páginas essenciais como Wi-Fi, check-in, regras e localização"
  - Smartphone → "Visualize como o hóspede verá o guia no celular"
  - RefreshCw → "Atualize conteúdos em tempo real sempre que precisar"
  - QrCode → "Publique e compartilhe por link ou QR Code"
- **Frase de fechamento (acima dos CTAs, em destaque sutil)**: "O anfitrião cria no painel. O hóspede acessa no celular. Tudo atualizado em tempo real."
- **CTAs**:
  - Primário: `Link to="/auth"` — "Criar meu hub grátis" (mesmo estilo dos CTAs ciano da landing).
  - Secundário: `<a href="#demo">` — "Ver demo real" (variant outline).

## Mockup de MacBook (CSS puro)

Componente local `LaptopMockup` (definido no mesmo arquivo, junto com `PhoneMockup`):

- **Moldura da tela**: `div` com `aspect-[16/10]`, `rounded-2xl` (corner superior), `border-[10px] border-[#1a2236]`, `bg-[#0a0f1c]`, sombra `shadow-[0_30px_80px_-20px_rgba(0,255,255,0.30)]`.
- **Notch da câmera**: barra fina cinza no topo (3px alt., centralizada).
- **Tela interna**: `overflow-hidden rounded-lg`, contém o `<video>`.
- **Base do notebook**: 2 divs abaixo da tela:
  1. Faixa fina (8px) cinza claro com gradiente lateral (representa a dobradiça).
  2. Faixa mais larga (16-20px) com `rounded-b-2xl` e leve concavidade central simulada com `clip-path` ou pseudo-elemento (entalhe do trackpad).
- Largura máxima ~640px no desktop, 100% no mobile.

## Vídeo

```html
<video
  src="/videos/hub-rapido2.mp4"
  autoPlay
  muted
  loop
  playsInline
  preload="metadata"
  className="h-full w-full object-cover"
  aria-hidden="true"
/>
```

- `object-cover` (preserva impacto visual da interface; se ficar cortando UI importante, trocar para `object-contain` com fundo `#0F172A`).
- Sem `controls`.

## Estilo / identidade visual

- Cores: `#00FFFF` (ciano destaque), `#F8FAFC` (texto), `#CBD5E1` (texto secundário), `#111827`/`#0F172A` (cartões), seguindo o restante da landing.
- Espaçamento: `py-20 lg:py-28` (igual outras seções).
- Animação de entrada: nenhuma nova lib — manter consistência com seções vizinhas (que não animam). Se houver `motion` já importado e usado, aplicar um `fade-in-up` sutil; caso contrário, deixar sem animação para não introduzir dependências.

## Posicionamento
A função `SolutionSection` é chamada hoje logo antes de `RealDemoPreview`. Substituindo-a por `HostBuilderSection` no mesmo lugar, a narrativa fica:

1. (nova) **Anfitrião cria no painel** — notebook + vídeo
2. **Hóspede vê no celular** — `RealDemoPreview` existente

## Remoções
- Função `SolutionSection` é removida por completo.
- Constante `solutionBenefits` (linhas 249-258) é removida.
- `PhoneMockup` permanece (ainda usado em outras seções, p.ex. hero) — verificar e manter apenas se for usado em outro lugar; caso seja exclusivo da `SolutionSection`, remover.

## Validação
- `bun run build` (automático).
- Inspeção visual: notebook renderiza correto desktop + mobile, vídeo dá autoplay (muted) e faz loop, CTAs navegam para `/auth` e `#demo`.