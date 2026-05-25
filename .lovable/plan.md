# Ajustes na landing /welcome-hub

## 1. Cor sólida #00FFFF no lugar do degradê
Em `src/pages/WelcomeHubLanding.tsx`, substituir todas as ocorrências de `bg-gradient-to-r from-[#00FFFF] to-[#00FF00]` (e variações `to-br`) por cor sólida `bg-[#00FFFF]` nos seguintes elementos:
- Texto destacado "experiência digital" do H1 do hero (trocar `bg-clip-text text-transparent` por `text-[#00FFFF]`).
- Botões CTA: "Criar meu hub grátis" (header desktop + menu mobile), "Começar grátis" do hero, CTA do bloco demo, CTA do plano destacado e CTA final.
- Demais usos decorativos (glows, badges, ícones, blobs do mockup, gradiente do número de passos, etc.) permanecem como estão para não achatar a identidade visual.

## 2. Logo no cabeçalho
Substituir o quadradinho "M" + textinho do header (linhas ~42–50) pelo componente `<MrFlowLogo forceDark className="h-8 w-auto" />` de `@/components/brand/MrFlowLogo`. Aplicar a mesma troca no logo do rodapé (linha ~754) e no logo do menu mobile, se houver.

## 3. Mockup do celular (imagem real) no hero
- Copiar `user-uploads://download.png` para `src/assets/welcome-hub-phone-mockup.png` (já vem com o celular em perspectiva sobre fundo xadrez de transparência — precisamos remover o fundo).
- Usar `imagegen--edit_image` com `transparent_background: true` para gerar `src/assets/welcome-hub-phone-mockup.png` limpo (PNG transparente, mantendo apenas o celular).
- No hero (seção que hoje renderiza `<PhoneMockup><HeroMockupContent/></PhoneMockup>`, ~linha 190), substituir por um `<img>` da nova imagem, preservando o glow externo cyan/verde já existente atrás dele. O componente `PhoneMockup`/`HeroMockupContent` continua sendo usado nas outras seções (bloco "Solução") — não remover.

## 4. Shader animado de fundo
- Importar `ShaderBackground from "@/components/ui/shader-background"` em `WelcomeHubLanding.tsx`.
- Envolver o conteúdo da página num wrapper `relative` e adicionar `<ShaderBackground className="pointer-events-none fixed inset-0 -z-0 h-full w-full opacity-60" />` logo após o `<Seo />`, com `z-10` no conteúdo principal, igual ao padrão de `Index.tsx` e `SeoLandingLayout.tsx`. Manter o `PAGE_BG` radial atual por baixo para preservar o tom escuro.

## Detalhes técnicos
- Sem mudanças em rotas, dados ou backend.
- Sem alteração no design system global (tokens em `index.css`/`tailwind.config.ts`).
- Arquivos tocados: `src/pages/WelcomeHubLanding.tsx`, `src/assets/welcome-hub-phone-mockup.png` (novo).
