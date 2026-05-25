## Objetivo

Instalar o componente `StickyFeatureSection` em `src/components/ui/sticky-scroll-cards-section.tsx`, com:
- Paleta **ciano** (substituindo os tons amarelo/âmbar do exemplo)
- Conteúdo dos 4 cards **adaptado em PT-BR** para o WelcomeHub / Mr Flow
- Componente apenas instalado (não inserido em nenhuma página por enquanto)

## O que será criado

**Arquivo único:** `src/components/ui/sticky-scroll-cards-section.tsx`

O JSX colado pelo usuário veio incompleto/quebrado (markup ausente). Vou reconstruir o componente preservando o comportamento descrito:

- Header animado com fade-in via `IntersectionObserver` (hook `useScrollAnimation`)
- Lista de 4 cards em layout sticky: cada card "gruda" no topo enquanto o próximo sobe por baixo (efeito de stacking via `sticky top-*` + offsets crescentes)
- Cada card tem: título, descrição, e imagem à direita; layout responsivo (stack no mobile, 2 colunas no desktop)
- Fallback de imagem com `onError` apontando para placeholder

## Paleta (amarelo → ciano)

Mapeamento aplicado em `bgColor` de cada card e nos textos:

```text
bg-yellow-200  → bg-cyan-100
bg-amber-200   → bg-cyan-200
bg-orange-200  → bg-sky-200
bg-yellow-300  → bg-cyan-300
text-gray-700  → text-cyan-950 (alto contraste em fundos claros)
```

Variantes `dark:` seguem o mesmo padrão (`dark:bg-cyan-900`, etc.).

## Conteúdo PT-BR dos 4 cards

1. **Link único para hóspedes** — Um único link inteligente que abre o guia digital da sua propriedade em qualquer celular, sem app, sem download.
2. **Multi-idioma automático** — Traduza o guia inteiro para o idioma do hóspede com um clique. Inglês, espanhol, francês e mais.
3. **Check-in digital sem fricção** — Envie boas-vindas, regras da casa e instruções de acesso antes da chegada. Reduza mensagens repetidas no WhatsApp.
4. **PWA instalável + PDF offline** — Hóspedes salvam seu guia como app no celular ou baixam em PDF para consultar sem internet.

Imagens: usarei placeholders neutros do Unsplash relacionados a hospitalidade/viagem (hotel, mapa, celular, recepção) para combinar com o tema.

## Detalhes técnicos

- `'use client'` não é necessário (Vite/React, não Next).
- Tipagem TS adequada: hook tipado como `<T extends HTMLElement>() => [RefObject<T>, boolean]`.
- Sem dependências novas — apenas React + Tailwind (já no projeto).
- Não toca em `index.css`, `tailwind.config.ts`, nem em `WelcomeHubLanding.tsx`.
- Export nomeado `StickyFeatureSection` (igual ao import do demo), para uso futuro via:
  ```ts
  import { StickyFeatureSection } from "@/components/ui/sticky-scroll-cards-section";
  ```

## Fora do escopo

- Não insiro o componente em nenhuma rota/página.
- Não crio o `demo.tsx`.
- Não altero a seção `#beneficios` existente.
