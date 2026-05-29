## Adicionar 5 estrelas amarelas após "Airbnb" no H1

Atualizar o `h1` da landing `/checklist-inspecao-5-estrelas-airbnb` em `src/pages/seo/extras.tsx` (linha 407) para incluir, logo após a palavra "Airbnb", uma fileira de 5 ícones de estrela em amarelo.

### Implementação

- Importar `Star` de `lucide-react` no topo de `src/pages/seo/extras.tsx` (se ainda não importado).
- Substituir o `h1` por:

```tsx
h1={
  <>
    Checklist Gratuito de Inspeção <span style={{ color: "#00FF00" }}>5 Estrelas</span> para Airbnb
    <span className="inline-flex items-center gap-0.5 align-middle ml-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-6 w-6 lg:h-8 lg:w-8" fill="#FACC15" stroke="#FACC15" />
      ))}
    </span>
  </>
}
```

- Cor amarela: `#FACC15` (tom amarelo-âmbar consistente com avaliações 5 estrelas).
- Estrelas preenchidas (`fill` + `stroke` no mesmo tom) para leitura imediata.
- Tamanho responsivo proporcional ao H1 (24px mobile / 32px desktop).
- `inline-flex` + `align-middle` para alinhar com a linha base do texto sem quebrar o layout do título.

### Arquivos tocados

- `src/pages/seo/extras.tsx` — import de `Star` + atualização do `h1` do `ChecklistInspecao5EstrelasAirbnb`.
