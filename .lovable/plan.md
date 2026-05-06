## Contexto

Hoje a logo da plataforma **Mr Flow** (não a logo que o cliente sobe em Configurações) é fixa em todos os lugares — a versão branca é usada na landing, no Auth, no convite e no AppShell. Em telas claras (modo claro do dispositivo / fundo claro), ela some.

Já existem duas versões no projeto:
- `src/assets/mrflow-logo-white.png` (para fundos escuros)
- `src/assets/mrflow-logo.png` (versão escura, para fundos claros)

## Proposta

Trocar a logo automaticamente conforme o tema do dispositivo (`prefers-color-scheme`), apenas onde isso faz sentido visual.

### Componente novo

Criar `src/components/brand/MrFlowLogo.tsx`:
- Renderiza um `<picture>` com duas `<source>`:
  - `media="(prefers-color-scheme: dark)"` → `mrflow-logo-white.png`
  - fallback (claro) → `mrflow-logo.png`
- Aceita `className` e `alt`.
- Variante `forceLight` / `forceDark` para casos onde o fundo é fixo (ex.: hero da landing tem fundo escuro permanente, então deve sempre usar a branca).

### Onde aplicar

| Arquivo | Comportamento |
|---|---|
| `src/pages/Index.tsx` (landing) | Fundo é sempre escuro → manter `forceLight` (sempre branca). Sem mudança visual. |
| `src/pages/Auth.tsx` | Trocar pela `MrFlowLogo` automática (segue o tema do dispositivo). |
| `src/pages/Invite.tsx` | Trocar pela `MrFlowLogo` automática. |
| `src/components/layout/AppShell.tsx` | Trocar pela `MrFlowLogo` automática (sidebar pode ser clara ou escura conforme o tema). |

### O que NÃO muda

- Logo do cliente (`tenant.logo_url`) — fora do escopo.
- Cores/estilos do app.
- Lógica de negócio.

## Resultado

Em dispositivos no modo escuro: logo branca (como hoje).
Em dispositivos no modo claro: logo escura, legível sobre fundos claros — sem necessidade de configuração pelo usuário.
