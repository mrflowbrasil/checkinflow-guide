## Plano: Mockup secundário + Botão "Receber Guia no WhatsApp" na Hero

### 1. Mockup secundário sobreposto (mulher visualizando o hub)

**1.1 Gerar a imagem com `imagegen--edit_image`**
- Input: `user-uploads://banner_1.webp` (imagem do iPhone com hub em cima da mesa de madeira + suculenta + chave).
- Prompt: ajustar a cena para incluir uma mulher segurando/visualizando o celular, no mesmo ambiente (mesa de madeira clara, iluminação quente, suculenta e chave visíveis ao fundo desfocado), tela do celular mostrando o Hub "Suíte Premium · Vila Serena" com tiles (Como chegar, Check-in, Wi-Fi etc.). Estilo lifestyle, foto realista, iluminação natural.
- `aspect_ratio: "1:1"`, salvar em `src/assets/hero-mockup-lifestyle.jpg` (sem transparência).

**1.2 Adicionar à Hero (`src/pages/WelcomeHubLanding.tsx`, função `Hero`)**
- Importar a nova imagem: `import heroLifestyle from "@/assets/hero-mockup-lifestyle.jpg"`.
- Dentro do container do mockup (linha ~191), adicionar um card flutuante absoluto na parte **superior** do mockup (espelhando a posição do balão de avaliações que fica na parte inferior). Estrutura:
  ```
  - Card oval/arredondado (rounded-2xl), bg #111827/85 + backdrop-blur + border sutil
  - Imagem dentro, ~140–160px de largura, rounded-xl, com sombra
  - Posição: absolute -top-4 -right-2 (desktop) / oculto em mobile (md:block) para não poluir
  - z-index acima do phoneMockup
  ```
- Mantém o estilo visual coerente com os `FloatingChip` existentes.

### 2. Botão "Receber Guia no meu WhatsApp" + Modal

**2.1 Novo componente `src/components/lp/WhatsAppGuideDialog.tsx`**
- Usa `Dialog` do shadcn (`@/components/ui/dialog`) + `Input` + `Button` + `Label`.
- Estado local: `{ name, whatsapp, email, loading, sent }`.
- Validação com `zod`:
  - `name`: string, trim, 2–100 chars
  - `whatsapp`: string, trim, regex de dígitos/formatação BR, 10–20 chars
  - `email`: email válido, máx 255
- Máscara simples no WhatsApp (apenas dígitos + formato `(XX) XXXXX-XXXX`).
- Submit: `fetch("https://n8n.mrflow.com.br/webhook/disparo-hub", { method: "POST", mode: "no-cors", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ name, whatsapp, email, source: "welcome-hub-landing", timestamp: new Date().toISOString() }) })`.
- Como `no-cors` não retorna status, tratamos como sucesso após a request: mostrar tela de confirmação ("Pronto! Em instantes você receberá o guia no seu WhatsApp.") e usar `toast` de sucesso (`useToast`).
- Em erro de rede: toast destrutivo.

**2.2 Integrar na Hero**
- Logo abaixo do bloco de CTAs (linha ~181–188), adicionar terceiro botão verde-WhatsApp:
  - `bg-[#25D366] hover:bg-[#1ebe5a] text-white` com ícone `MessageCircle` (lucide) ou `Phone`.
  - Texto: "Receber Guia no meu WhatsApp".
  - `onClick` abre o `WhatsAppGuideDialog` (estado controlado dentro de `Hero`).

### 3. Segurança / boas práticas
- Validação client-side com `zod` antes do POST.
- Sem logs de dados sensíveis no console.
- `encodeURIComponent` não é necessário (corpo JSON).
- Sem expor nenhuma chave: webhook é público do n8n.

### O que NÃO muda
- Layout geral da Hero, textos, demais seções, mockup principal do celular.

### Perguntas rápidas (responda só se quiser ajustar)
1. **Imagem**: posso prosseguir com a edição da foto anexa adicionando uma mulher segurando o celular no mesmo ambiente, ou prefere que eu apenas reposicione/use a foto original como está (sem mulher)?
2. **Cor do botão WhatsApp**: verde oficial `#25D366` ou manter a paleta cyan/verde-neon do site?
