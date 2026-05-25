## Tornar o tamanho do mockup ajustável manualmente

### Mudança única em `src/pages/WelcomeHubLanding.tsx`

1. **Adicionar constante no topo do arquivo** (perto do `DEMO_URL`):
   ```ts
   // Ajuste manual: largura máxima do mockup do celular no hero (ex.: "360px", "420px", "80%")
   const PHONE_MOCKUP_MAX_WIDTH = "420px";
   ```

2. **Aplicar no `<img>` do hero (linha ~190)**:
   - Trocar `className="relative z-0 w-full h-auto ..."` por `className="relative z-0 w-full h-auto mx-auto ..."`
   - Adicionar `style={{ maxWidth: PHONE_MOCKUP_MAX_WIDTH }}`

Resultado: a imagem fica centralizada na coluna direita e respeita a largura máxima definida. Para ajustar, basta editar o valor da constante — sem tocar em mais nada.

### Sugestão de valor inicial
`"420px"` (entre o "muito pequeno" anterior e o "grande demais" atual). Depois você ajusta no olho.

### Escopo
Apenas `src/pages/WelcomeHubLanding.tsx`. Sem mudanças nos chips, no fundo, no shader ou em outras seções.
