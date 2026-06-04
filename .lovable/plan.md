## Objetivo

Adicionar nas telas iniciais (Dashboard e Imóveis) um card de ajuda com título "Precisa de ajuda para criar seu primeiro imóvel?" e subtítulo "Assista o vídeo e veja como criar sua propriedade em menos de 5 minutos!" que ao ser clicado abre um modal com o vídeo embedado (sem sair da página).

## Decisão de UX

Vou usar a opção **card visível** (não um "?" ao hover), porque:
- Maior descoberta para usuários novos (o objetivo é justamente ajudar quem ainda não criou imóvel).
- Combina com o estilo dos cards/CTAs já presentes nas duas telas.
- Hover-only é ruim em mobile.

Para não poluir, o card só aparece quando o usuário **ainda não tem imóveis cadastrados** (estado inicial das duas telas dos prints). Assim que cadastra o primeiro imóvel, o card some automaticamente.

## Arquivos a criar/editar

### 1. Novo componente `src/components/help/FirstPropertyHelpCard.tsx`
- Card clicável com ícone `PlayCircle` + título + subtítulo.
- Estado interno para abrir/fechar `Dialog`.
- Dentro do `DialogContent` (max-w-3xl), `<video controls autoPlay>` com `src` vindo de `@/assets/primeiro-imovel.mp4.asset.json` (vídeo completo já existente, 98 MB) e `poster` do `hub-rapido2-poster.jpg.asset.json`.
- Visual alinhado ao design system (bg `accent-soft`, border `accent/20`, hover sutil). Sem cores hardcoded.

### 2. `src/pages/dashboard/DashboardHome.tsx`
- Importar e renderizar `<FirstPropertyHelpCard />` condicionalmente quando `properties.length === 0`, logo abaixo do bloco "Imóveis recentes" (ou acima, conforme melhor encaixe visual após leitura do arquivo).

### 3. `src/pages/dashboard/PropertiesList.tsx`
- Importar e renderizar `<FirstPropertyHelpCard />` no empty state, abaixo do botão "Cadastrar primeiro imóvel".

## Notas técnicas
- Reusar `Dialog`/`DialogContent` de `@/components/ui/dialog` (já fecha com ESC, overlay e botão X).
- Vídeo: usar `import videoAsset from "@/assets/primeiro-imovel.mp4.asset.json"` e `<video src={videoAsset.url} />`. Pausar o vídeo ao fechar o modal via `onOpenChange`.
- Sem novas dependências, sem mudanças de backend.
