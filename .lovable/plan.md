## Objetivo
Substituir os avatares com iniciais (DS / JM / PS) na seção `Depoimentos` por fotos reais das três pessoas, exibidas em formato circular.

## Mudanças

### 1. Upload das 3 fotos como Lovable Assets
Subir via `lovable-assets create` a partir de `/mnt/user-uploads/`, salvando pointers em `src/assets/lp/avatars/`:
- `denize.jpg` ← `user-uploads://image-150.png`
- `pablo.jpg` ← `user-uploads://image-151.png`
- `juliana.jpg` ← `user-uploads://image-152.png`

### 2. Atualizar `Depoimentos` em `src/pages/LpAnuncio.tsx` (linhas 1178-1247)
- Importar os 3 `.asset.json` no topo do arquivo.
- Trocar o campo `initials` + `bg` por `photo` em cada item do array.
- Substituir o `<div>` com iniciais (linhas 1224-1229) por um `<img>` circular:
  ```tsx
  <img
    src={t.photo}
    alt={t.name}
    className="h-14 w-14 rounded-full object-cover shadow-sm shrink-0"
    loading="lazy"
  />
  ```
  O `object-cover` + `rounded-full` aplica o crop circular automaticamente sem precisar editar os arquivos (as fotos já são praticamente quadradas).

## Fora do escopo
- Não alterar texto, ordem ou layout dos depoimentos.
- Não mexer em outras seções da LP.