## Causa de você não ver as alterações

A rota `/` (a que aparece no preview) renderiza `src/pages/LpAnuncio.tsx`. As alterações da última iteração foram aplicadas em `src/pages/WelcomeHubLanding.tsx`, que está em `/lp`. Por isso a página principal continua igual. Vou replicar as duas mudanças no `LpAnuncio`.

## 1. Mockup secundário sobreposto à hero

- A hero principal do `LpAnuncio` usa `src/assets/lp/hero-guest-phone.jpg` (mulher no sofá com o celular) — diferente da imagem usada em `/lp`. Para manter "como se a mulher da foto estivesse visualizando a tela", vou gerar um mockup novo a partir **dessa** imagem, e não reutilizar o `hero-mockup-lifestyle.jpg` (que foi gerado em outro ambiente).
- Ferramenta: `imagegen--edit_image` sobre `src/assets/lp/hero-guest-phone.jpg`.
- Prompt: enquadrar um close vertical do celular que ela segura, com a tela mostrando o Hub "Suíte Premium · Vila Serena" (tiles Como chegar, Check-in, Wi-Fi, Regras), mesma iluminação quente do sofá ao fundo desfocado.
- Aspect ratio `3:4`, salvar em `src/assets/lp/hero-mockup-lifestyle.jpg`.
- Inserir como card flutuante no container da imagem (linha ~166–186 de `LpAnuncio.tsx`), simétrico ao balão "+ avaliações 5 estrelas" mas no canto **superior**:
  - `absolute -top-5 -right-5 hidden sm:block z-20`
  - largura ~140–170px, `rounded-2xl`, `bg-white`, `ring-1 ring-slate-200`, `shadow-lg`, leve `rotate-3`
  - `loading="lazy"` e `decoding="async"`
- Mantém o balão de avaliações onde está.

## 2. Botão "Receber Guia no meu WhatsApp" + Modal

- Reutilizar **o componente já criado** `src/components/lp/WhatsAppGuideDialog.tsx` (Dialog shadcn + validação zod + POST `no-cors` para `https://n8n.mrflow.com.br/webhook/disparo-hub`). Sem duplicar lógica.
- Em `LpAnuncio.tsx`:
  - Importar `WhatsAppGuideDialog` e `MessageCircle` (lucide).
  - Adicionar estado `waOpen` em `HeroLp` (transformar em componente com `useState`, já é função React).
  - Inserir terceiro botão verde após os dois CTAs (linha ~137–148):
    - `bg-[#25D366] hover:bg-[#1ebe5a] text-white`, mesma altura/raio dos demais, com ícone `MessageCircle`.
    - Texto: "Receber Guia no meu WhatsApp".
    - `onClick={() => setWaOpen(true)}`.
  - Renderizar `<WhatsAppGuideDialog open={waOpen} onOpenChange={setWaOpen} />` ao final do `section`.

## O que NÃO muda

- Layout, copy, demais seções, hero principal, balão de avaliações.
- A versão em `/lp` (WelcomeHubLanding) já tem as alterações e fica como está.

## Pergunta opcional

Quer que eu **também remova** a rota `/lp` ou redirecione `/lp` → `/` para evitar a duplicação de landing? (Por padrão deixo as duas como estão.)
