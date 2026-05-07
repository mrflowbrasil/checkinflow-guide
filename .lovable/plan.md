Corrigir `src/components/brand/MrFlowLogo.tsx` para basear a escolha da variante (clara/escura) na classe `.dark` do `<html>` (tema real do app, controlado pelo Tailwind `darkMode: "class"`) em vez de `prefers-color-scheme` (tema do sistema operacional).

Implementação:
- Adicionar hook interno `useIsDarkTheme()` que lê `document.documentElement.classList.contains("dark")` e escuta mudanças via `MutationObserver` na `class` do `<html>`.
- Renderizar `<img>` único com `mrFlowLogoDark` quando o tema do app for escuro, senão `mrFlowLogoLight`.
- Preservar props `forceLight` e `forceDark` como override manual.

Resultado: no dashboard atual (tema claro), a logo colorida/escura será sempre exibida, independente do tema do SO do usuário.