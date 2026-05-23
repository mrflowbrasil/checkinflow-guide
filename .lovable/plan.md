# Central de Ajuda

Criar uma página `/app/help` dentro do AppShell com tutoriais passo a passo de todas as funcionalidades da plataforma, navegável por tópicos.

## Estrutura

**Rota:** `/app/help` (autenticada, dentro do AppShell)
**Item no menu:** "Ajuda" com ícone `HelpCircle`, posicionado antes de "Configurações"

## Layout da página

```text
┌──────────────────────────────────────────────┐
│  Central de Ajuda                            │
│  Aprenda a usar todas as funcionalidades.    │
│  [campo de busca]                            │
├───────────┬──────────────────────────────────┤
│ Sumário   │  Conteúdo do tópico selecionado  │
│ (sticky)  │                                  │
│ • Imóveis │  Título do tópico                │
│ • Editor  │  ─────────────────────           │
│ • QR Code │  1. Passo um (com screenshot)    │
│ • ...     │  2. Passo dois                   │
│           │  Dica / aviso                    │
└───────────┴──────────────────────────────────┘
```

- Desktop: sidebar de tópicos à esquerda + conteúdo à direita
- Mobile: accordion único com todos os tópicos
- Busca filtra tópicos pelo título e palavras-chave

## Tópicos (em ordem)

1. **Criando seu primeiro imóvel** — botão "Novo imóvel", campos obrigatórios, salvar
2. **Imagem de capa** — formatos aceitos, proporção recomendada, como substituir
3. **Informações do imóvel** — título, descrição, link público, slug do QR Code
4. **Ativar e desativar páginas do guia** — toggle por página, efeito no guia público
5. **Reordenar blocos e páginas** — arrastar e soltar (drag handle), salvamento automático
6. **Blocos do editor de guia** — uma seção por tipo de bloco:
   - Texto, Subtítulo, Imagem, Vídeo, Passo a passo, Caixa de dica, Botão, Lista, Senha (Wi-Fi/fechadura), Linha divisória
   - Cada um com: para que serve + como inserir + campos disponíveis
7. **Copiar e colar blocos entre páginas** — selecionar, copiar, colar em outra página
8. **Gerar novo QR Code** — quando usar, aviso de que o link/QR antigo deixa de funcionar, como reimprimir
9. **Usar templates prontos** — onde escolher, como aplicar a um imóvel novo
10. **Duplicar uma propriedade** — copia páginas e blocos, ajustes pós-duplicação

## Implementação técnica

- `src/pages/dashboard/Help.tsx` — página com layout sidebar + conteúdo
- `src/pages/dashboard/help/topics.ts` — array tipado `{ id, title, keywords, sections: [{heading, body, tip?}] }` para conteúdo (sem precisar de banco)
- `src/pages/dashboard/help/HelpSidebar.tsx` — lista de tópicos + busca, scroll para âncora
- `src/pages/dashboard/help/HelpTopic.tsx` — render do tópico (markdown-like via componentes Tailwind, sem dependências novas)
- Registrar rota em `src/App.tsx` dentro do bloco `/app`
- Adicionar item `{ to: "/app/help", label: "Ajuda", icon: HelpCircle }` em `NAV` em `src/components/layout/AppShell.tsx`
- Tokens semânticos do design system (sem cores hardcoded)
- Conteúdo todo em português

## Fora do escopo

- Vídeos gravados / screenshots reais (usar placeholders ilustrativos descritivos; podem ser substituídos depois)
- Chat/suporte ao vivo
- Sistema de feedback "isso foi útil?"
