## Nova Landing Page `/lp` — Meta Ads (clean & acolhedora)

Criar uma landing page de campanha em `/lp`, mais clara e emocional que o site principal, mantendo a identidade Mr Flow (ciano da marca + logo), focada em conversão de tráfego pago vindo do Meta Ads.

### Posicionamento visual

- Fundo **off-white** (ex. `#FAFAF7`) com cards brancos e sombras suaves.
- Acento principal: **ciano Mr Flow** (`#00FFFF` / `hsl(180 100% 50%)`).
- Tons de apoio inspirados em hospitalidade: areia (`#F3EBDD`), verde claro (`#D8EBD9`), azul claro (`#E2F1F8`) e coral discreto (`#F4C9B8`) — usados só em backgrounds suaves e badges.
- Tipografia e botões (`Button` shadcn) já existentes — sem mudanças globais.
- Mobile-first: hero compacto, CTAs grandes (`h-14`), espaçamentos generosos.

### Estrutura da página

1. **Header enxuto** — logo Mr Flow + selo "Welcome Hub" + botão "Entrar" (igual ao layout SEO, mas em versão clara).
2. **Hero**
   - Headline: "Pare de repetir as mesmas instruções no WhatsApp. **Encante seu hóspede** com um guia digital em poucos minutos." (palavras-chave em ciano).
   - Subheadline conforme briefing.
   - CTA primário: **"Criar meu guia grátis"** → `/auth`.
   - CTA secundário **destacado**: **"Ver guia demo como hóspede"** → rola até a seção `RealDemoPreview` (mesma usada em `/`).
   - Microcopy: "Leva menos de 5 minutos. Não precisa de cartão."
   - Imagem hero (gerada via IA): hóspede sorrindo usando celular em sala moderna e acolhedora.
3. **Seção "Seu hóspede não quer procurar informação. Ele quer chegar tranquilo."**
   - Comparação **Antes × Depois** em dois cards lado a lado (stack no mobile).
   - Antes: lista de perguntas repetidas com balões de chat cinza.
   - Depois: lista dos ganhos com checks ciano.
4. **Benefícios** — título "Menos mensagens repetidas. Mais autonomia para o hóspede. Mais chance de avaliação 5 estrelas." + 4 cards (link único, check-in tranquilo, QR Code, atualização em tempo real), cada um com ícone `lucide-react` e fundo pastel rotativo.
5. **RealDemoPreview** — reaproveitar o componente já usado em `/` (alvo da âncora `#demo`).
6. **Seção "Operação profissional sem suporte técnico"** — bullets do briefing + frase de apoio "O hóspede sente organização. Você ganha tempo. A estadia começa melhor.", com imagem (IA) de painel/celular mostrando o guia.
7. **Gatilhos de conversão** — faixa horizontal com 5 chips ("Não precisa de cartão", "Crie seu primeiro hub grátis", "Ideal para Airbnb, pousadas e casas de temporada", "Funciona por link, QR Code e celular", "Sem aplicativo para o hóspede baixar").
8. **CTA final** — bloco grande off-white com gradiente suave ciano→areia, CTA primário + secundário.
9. **Footer** — mesmo footer minimal das LPs SEO (CNPJ + link mrflow.com.br).

CTAs primários repetidos em hero, após benefícios, após bullets e no bloco final.

### Imagens (geradas via IA, fotorrealistas)

Salvar em `src/assets/lp/`:

- `hero-guest-phone.jpg` (16:9) — hóspede em apartamento moderno e claro, sorrindo enquanto olha celular, luz natural, paleta off-white + madeira clara + toques ciano.
- `guide-panel-mockup.jpg` (4:3) — celular sobre mesa de madeira mostrando guia digital (mockup limpo), ambiente acolhedor.
- `qrcode-frame.jpg` (1:1) — moldura na parede de casa de temporada com QR code do guia, plantas e iluminação suave.

Geradas com `imagegen--generate_image` (model `standard`).

### SEO

- Indexada normalmente: entra no `public/sitemap.xml`.
- `<Seo>` component com `title`, `description`, canonical `https://hub.mrflow.com.br/lp`, OG image (`hero-guest-phone.jpg`), JSON-LD `WebPage` + `FAQPage` (FAQ curto opcional — confirmar se deve incluir; por ora **omitir FAQ** para manter foco em conversão).

### Detalhes técnicos

- Novo arquivo: `src/pages/LpAnuncio.tsx` (componente standalone, sem `SeoLandingLayout` — esse layout é dark e voltado a posts de blog; aqui precisamos do tema claro).
- Componentes auxiliares internos no mesmo arquivo: `HeroLp`, `AntesDepois`, `Beneficios`, `BulletsPro`, `Gatilhos`, `CtaFinal`.
- Reaproveitar `RealDemoPreview` de `src/pages/WelcomeHubLanding.tsx` — extrair para `src/components/landing/RealDemoPreview.tsx` se ainda não estiver isolado (verificar primeiro; se acoplado demais, encapsular em wrapper exportável).
- Rota nova em `src/App.tsx`: `<Route path="/lp" element={<LpAnuncio />} />` (lazy load).
- Adicionar `/lp` ao `public/sitemap.xml` com `<priority>0.9</priority>`.
- Sem alterações em `index.css` / `tailwind.config.ts`: cores pastéis aplicadas inline (`bg-[#F3EBDD]/60`) por serem específicas desta LP. Caso o usuário queira reuso, depois promovemos a tokens.
- Botões: `Button` shadcn com `className="bg-[hsl(180_100%_45%)] hover:bg-[hsl(180_100%_40%)] text-slate-900 font-semibold"` para CTA primário; `variant="outline"` para secundário.
- Tracking: `MetaPixelTracker` e `GoogleAnalyticsTracker` já são globais — eventos de pageview funcionam automaticamente. Sem eventos custom nesta entrega.

### Arquivos a tocar

- **Novos**
  - `src/pages/LpAnuncio.tsx`
  - `src/assets/lp/hero-guest-phone.jpg`
  - `src/assets/lp/guide-panel-mockup.jpg`
  - `src/assets/lp/qrcode-frame.jpg`
  - (Opcional) `src/components/landing/RealDemoPreview.tsx` se extração for necessária.
- **Editados**
  - `src/App.tsx` — registrar rota lazy `/lp`.
  - `public/sitemap.xml` — adicionar entrada `/lp`.
  - `public/version.json` — bump.
