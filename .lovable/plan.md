## Atualização do Hero (`src/pages/Index.tsx`)

### Mudanças no bloco de texto

1. **Substituir a headline atual** ("Encante seu hóspede desde o primeiro momento...") pela nova frase:
   - **"Transforme a estadia do seu hóspede em uma experiência incrível"**
   - Manter a mesma tipografia e cor do parágrafo atual: `text-lg leading-relaxed` com `color: #00FF00`.

2. **Adicionar uma subleadline** logo abaixo, em tamanho menor e cor branca:
   - Texto: **"Encante desde o primeiro momento com um guia digital completo!"**
   - Estilo: `text-base text-white/90 mb-8` (menor que a headline, branco puro `#ffffff` com leve respiro).
   - Mover o `mb-8` da headline para a subleadline para preservar o espaçamento até o botão.

### Estrutura final do bloco

```tsx
<p className="text-lg leading-relaxed mb-3" style={{ color: "#00FF00" }}>
  Transforme a estadia do seu hóspede em uma experiência incrível
</p>
<p className="text-base mb-8" style={{ color: "#ffffff" }}>
  Encante desde o primeiro momento com um guia digital completo!
</p>
```

### Arquivo editado
- `src/pages/Index.tsx`
