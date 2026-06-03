## Diagnóstico

A rota `/` (home) renderiza `src/pages/LpAnuncio.tsx`, **não** `src/pages/Index.tsx` (que está em `/welcome-hub`). Por isso a seção Planos adicionada anteriormente não aparece — ela foi inserida no arquivo errado.

## Plano

1. **Remover** a `PlanosSection` (e constantes `LP_PLANS`, `LP_PLAN_FEATURES`, `ENTERPRISE_BENEFITS`, `formatBRL`, `CYAN`, `ENTERPRISE_WHATSAPP`) de `src/pages/Index.tsx`, restaurando o arquivo ao estado anterior.

2. **Adicionar** a mesma `PlanosSection` em `src/pages/LpAnuncio.tsx`:
   - Inserir `<PlanosSection />` no JSX principal entre `<BulletsPro />` e `<Gatilhos />` (posição natural: depois dos benefícios e antes dos gatilhos finais).
   - Copiar para o final do arquivo o componente `PlanosSection` e as constantes auxiliares (`LP_PLANS`, `LP_PLAN_FEATURES`, `ENTERPRISE_BENEFITS`, `formatBRL`, `CYAN`, `ENTERPRISE_WHATSAPP`).
   - Adicionar imports necessários: `useState`, `Tabs`, `TabsList`, `TabsTrigger`, `Badge`, `Card`, ícones `Sparkles`, `Check`, `Building2`, `Gift`, `MessageCircle`, `Headphones`, `Rocket`, `Settings as SettingsIcon`, `TrendingUp` (mantendo os já existentes).

3. **Conteúdo da seção** (idêntico ao já criado):
   - Título: "Mais paz para você. Mais clareza para o hóspede. Por menos que um cafezinho por imóvel."
   - Subtítulo: "Comece com 30 dias grátis, sem cartão de crédito. Teste sem compromisso e continue apenas se fizer sentido para sua operação."
   - Toggle Mensal/Anual (−17%), 5 planos (Single, Starter, Pro, Business, Enterprise), CTAs para `/auth` e WhatsApp Enterprise.
   - `id="planos"` para anchor.

## Escopo

- Arquivos alterados: `src/pages/Index.tsx` (remoção) e `src/pages/LpAnuncio.tsx` (adição).
- Sem mudanças em rotas, backend, RLS ou outros componentes.
- Não inclui adicionar "Planos" ao header (não foi pedido nesta mensagem).