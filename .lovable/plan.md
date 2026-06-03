## Objetivo
Adicionar gatilho de conversão sobre a imagem do mockup do celular (Vila Serena) e manter os CTAs externos indo para `/auth`.

## Mudanças em `src/pages/LpAnuncio.tsx`

### 1. Overlay clicável sobre o mockup
No bloco do hero (linhas ~184-218), envolver o `<img src={heroImg} />` em um container `relative` e adicionar 3-4 hotspots `<button>` absolutamente posicionados (porcentagem) sobre as regiões aproximadas dos cards Wi-Fi, Regras, Localização e Check-in da imagem.

- Hotspots invisíveis (`bg-transparent`) com `aria-label` descritivo, `cursor-pointer` e leve `hover:bg-[hsl(186_100%_32%)]/10 rounded-xl transition` para feedback sutil.
- `onClick` de qualquer hotspot → `setDemoCtaOpen(true)`.
- Mesmo tratamento no mockup pequeno lifestyle (canto superior direito) com um único hotspot cobrindo toda a tela.

### 2. Banner de conversão elegante
Estado local `const [demoCtaOpen, setDemoCtaOpen] = useState(false)`.

Renderizar logo abaixo do container do mockup (dentro do mesmo `<div className="relative">`), com animação de entrada (`transition-all duration-300`, `opacity`, `translate-y`):

```
[ícone Sparkles]  Gostou da facilidade?
                  Crie um guia igual a este para o seu imóvel.
                                                    [Criar Meu Guia Grátis →]  [x fechar]
```

Estilo: `rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 px-4 py-3`, título `text-slate-900 font-semibold`, CTA usando `ctaPrimary` reduzido (`h-11 px-5 text-sm`) em ciano `hsl(186 100% 32%)`. Botão fecha-se com ícone `X` discreto. Dispensa modal — é um banner inline para não bloquear a navegação.

O CTA do banner aponta para `/auth` via `<Link to="/auth">` (mesma regra dos demais).

### 3. CTAs externos
Confirmar que todos os botões "Criar meu guia grátis" continuam apontando para `/auth` (já é o caso). Nenhuma mudança de comportamento — apenas mantém a regra atual.

## Detalhes técnicos
- Sem libs novas; usa `useState` + classes Tailwind + `lucide-react` (`Sparkles`, `X`) já importados.
- Posicionamento dos hotspots: ajustado por tentativa visual usando `%` (ex.: `top-[38%] left-[12%] w-[24%] h-[14%]`). Como a imagem é fixa, posições são estáveis.
- Acessibilidade: cada hotspot recebe `aria-label="Ver demonstração de Wi-Fi"` etc., e o banner usa `role="status"` + `aria-live="polite"`.
- Mobile-first: hotspots cobrem áreas relativas, funcionam em qualquer largura; banner empilha em `flex-col sm:flex-row`.
- Tracking opcional: chamamos `window.dispatchEvent(new CustomEvent('lp_demo_hotspot_click'))` para reuso futuro (sem dependência nova).

## Fora do escopo
- Não criar mockup interativo "real" com telas trocando — fica como overlay sobre a imagem atual.
- Não alterar destino dos CTAs externos para `#planos`.
- Nenhuma mudança em outras seções ou na seção `PlanosSection`.