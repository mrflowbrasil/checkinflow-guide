## Nova secao: Quem esta por tras do Welcome Hub (Autoridade / Credibilidade)

### Objetivo
Inserir uma secao de autoridade e credibilidade logo acima da secao de planos de precos, seguindo fielmente a identidade visual da landing page Mr. Flow.

### Local de insercao
Arquivo: `src/pages/LpAnuncio.tsx`

Alteracao na ordem de renderizacao no `<main>` (linhas 95-105):

```
<HeroLp />
<RealDemoLight />
<AntesDepois />
<BulletsPro />
<Beneficios />
<VideoCriacao />
<QuemSomos />          <-- NOVO
<PlanosSection />
<Gatilhos />
<CtaFinal />
```

### Estrutura do componente `QuemSomos`

1. **Container da secao**
   - `<section>` com `py-16 lg:py-24 bg-white border-y border-slate-200/70`
   - Container padrao: `container max-w-6xl mx-auto px-5 sm:px-8`

2. **Layout principal (duas colunas)**
   - Grid: `grid lg:grid-cols-2 gap-12 items-center`
   - **Coluna esquerda (texto):**
     - H2: "Quem esta por tras do Welcome Hub?"
     - Subtitulo em `text-lg text-slate-600`
     - 3 blocos de texto escaneaveis, cada um com um pequeno icone decorativo (check ou bullet) e paragrafo curto
   - **Coluna direita (visual):**
     - Composicao visual elegante usando o logo `mrFlowLogo` em um card com sombra suave, sobreposto a gradientes radiais nos tons ciano e creme (`#F3EBDD`) — mesmo padrao de efeitos usados no Hero
     - Elementos flutuantes estilizados (circulos sutilmente desfocados) para criar profundidade sem usar foto real da equipe

3. **Grid de selos de confianca (abaixo das colunas, full-width)**
   - `grid sm:grid-cols-3 gap-5` com 3 cards pequenos
   - Cada card: icone em circulo colorido (usando os tons ja existentes no arquivo: ciano, creme, verde-agua), titulo em font-semibold e descricao em text-sm text-slate-600
   - Selos:
     - **Infraestrutura Robusta** — icone `ShieldCheck`
     - **Especialistas em Automacao** — icone `SettingsIcon`
     - **Suporte Dedicado** — icone `Headphones`

4. **Identidade visual**
   - Cores: ciano principal `hsl(186 100% 32%)`, fundo `#FAFAF7`, textos `slate-900` / `slate-600`
   - Tipografia: mesmo peso e tamanho das demais secoes (text-3xl lg:text-4xl font-bold para H2)
   - Bordas arredondadas: `rounded-3xl` nos cards, `rounded-2xl` nos icones
   - Espacamento generoso: `mt-12` entre o grid de colunas e o grid de selos
   - Mobile-first: empilhamento natural em telas pequenas, texto centralizado em mobile quando apropriado

5. **Textos (conforme solicitado)**
   - H2: "Quem esta por tras do Welcome Hub?"
   - Sub: "Conheca a tecnologia feita por especialistas em automacao para transformar o turismo e a hotelaria."
   - Bloco 1: "O Welcome Hub nasceu da Mr. Flow, uma plataforma de tecnologia e automacao especialista em simplificar processos de atendimento e comunicacao digital."
   - Bloco 2: "Desenvolvemos essa solucao porque entendemos o campo de batalha do anfitriao: a exaustao de responder as mesmas mensagens, o estresse dos check-ins desorganizados na madrugada e a importancia vital de manter uma nota 5 estrelas nas plataformas de reserva."
   - Bloco 3: "Nossa missao e colocar a tecnologia mais avancada de guias digitais e fluxos inteligentes para trabalhar por voce 24 horas por dia, 7 dias por semana. Assim, voce recupera o controle do seu tempo livre enquanto seus hospedes desfrutam de uma recepcao padrao hotelaria de luxo."

### Arquivos alterados
- `src/pages/LpAnuncio.tsx` apenas (novo componente + reordenacao no main)

### Nao sera alterado
- Nenhuma outra secao existente sera modificada
- Nenhuma nova dependencia sera instalada (usa apenas lucide-react ja importado)
- Nenhuma imagem externa sera carregada (usa logo existente + efeitos CSS)