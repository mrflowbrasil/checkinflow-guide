## Objetivo

Adicionar campos de **Instagram** e **Facebook** no workspace (tenant) e exibir ícones clicáveis na página pública do hóspede quando preenchidos.

## 1. Banco de dados

Adicionar duas colunas na tabela `tenants`:
- `instagram_url` (text, nullable)
- `facebook_url` (text, nullable)

Aceitar tanto URL completa (`https://instagram.com/usuario`) quanto username (`@usuario` ou `usuario`) — normalizar no frontend antes de salvar para sempre virar URL válida.

## 2. Tela de Configurações (`src/pages/dashboard/Settings.tsx`)

Criar um novo card **"Redes sociais"** logo abaixo do card de "Atendimento ao hóspede", contendo:
- Input "Instagram" com ícone do Instagram, placeholder `@seuperfil` ou URL completa
- Input "Facebook" com ícone do Facebook, placeholder URL da página
- Texto auxiliar: "Quando preenchidos, aparecem como botões na capa do guia do hóspede."

Estado local + persistência junto com o `save.mutate()` existente (mesmo botão "Salvar alterações"). Validação leve: se for username, prefixar com `https://instagram.com/` ou `https://facebook.com/`.

## 3. Página pública (`src/pages/GuestGuide.tsx`)

Buscar `instagram_url` e `facebook_url` no select do tenant.

Renderizar um pequeno cluster de **botões flutuantes circulares no canto inferior esquerdo da capa** (espelhando o `LanguageSwitcher` que fica no canto superior direito):
- Mesma estética: pill/círculo branco semitransparente com `backdrop-blur`, sombra suave, ícone colorido com a cor da rede
- Só aparecem se a URL correspondente estiver preenchida
- Abrem em nova aba (`target="_blank" rel="noreferrer noopener"`)
- `z-30`, posicionados sobre o gradiente da capa para garantir contraste

Optei pelo **canto inferior esquerdo da capa** (sua primeira opção) porque:
- Não compete visualmente com o grid de ícones logo abaixo
- Mantém simetria com o seletor de idioma (sup. direito ↔ inf. esquerdo)
- Em mobile não empurra o conteúdo principal

## 4. Detalhes técnicos

- Ícones: usar `Instagram` e `Facebook` do `lucide-react` (já é a stack do projeto)
- Sem necessidade de tradução (são links externos sem texto visível, só `aria-label`)
- Nenhuma alteração no edge function de tradução, no template ou em cores semânticas
- Responsivo: tamanho 40x40px em mobile, 44x44px em desktop

## Estimativa de créditos Lovable

| Etapa | Créditos |
|---|---|
| Migração (2 colunas em `tenants`) | ~1 |
| Card de redes sociais em Settings + normalização de URL | ~2 |
| Componente `SocialLinks` flutuante + integração no `GuestGuide` | ~2 |
| Ajustes visuais/QA | ~1 |
| **Total** | **~5–6 créditos** |

Sem custo de runtime (sem chamadas de IA, sem novas tabelas com RLS complexa).

## Fora de escopo

- WhatsApp/TikTok/YouTube (posso adicionar depois se quiser)
- Validação rigorosa de URL no servidor
- Ícones de redes sociais em outros lugares (footer, link expirado, etc.)

Posso prosseguir com a implementação?