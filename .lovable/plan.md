## Objetivo

Evitar que clientes fiquem presos a versões antigas do Mr Flow por causa de cache do navegador (caso ABMnb). Detectar automaticamente quando uma nova versão foi publicada e oferecer recarregar a página.

## Contexto

O projeto **não usa service worker / PWA com cache** (apenas `manifest.json` para instalabilidade — sem `vite-plugin-pwa`). Então o problema é puramente cache de bundle do navegador. A solução é leve: um `version.json` gerado no build + um watcher no frontend.

## Mudanças

### 1. Geração de versão no build

- `scripts/generate-version.mjs` (novo): escreve `public/version.json` com `{ "version": "<timestamp ms>", "builtAt": "<ISO>" }`.
- `package.json`: adicionar `"prebuild": "node scripts/generate-version.mjs"` e `"predev": "node scripts/generate-version.mjs"`.
- O arquivo `public/version.json` já é servido com `Cache-Control: no-store` pelo proxy da Lovable.

### 2. Snapshot da versão dentro do bundle

- `vite.config.ts`: injetar `define: { __APP_VERSION__: JSON.stringify(process.env.APP_VERSION || Date.now().toString()) }`.
- O script `generate-version.mjs` define `process.env.APP_VERSION` (na verdade escreve um arquivo que o vite.config.ts lê em paralelo via `fs.readFileSync('public/version.json')` antes de declarar `define`).
- `src/vite-env.d.ts`: declarar `declare const __APP_VERSION__: string;`.

### 3. Componente `VersionWatcher`

- `src/components/VersionWatcher.tsx` (novo):
  - A cada 60s + em `visibilitychange` (quando a aba volta ao foco), faz `fetch('/version.json?t=' + Date.now(), { cache: 'no-store' })`.
  - Se `remote.version !== __APP_VERSION__`, exibe um toast persistente (sonner):
    > "Nova versão disponível. Atualize para ver as últimas melhorias."
    > Botão: **Atualizar agora**
  - Ao clicar: limpa `caches` (`if ('caches' in window) await caches.keys().then(ks => ks.forEach(k => caches.delete(k)))`) e faz `window.location.reload()`.
  - Desativado em `import.meta.env.DEV`.
  - Só dispara o toast uma vez por sessão (flag em memória).

### 4. Limpeza defensiva de service workers órfãos

- `src/main.tsx`: ao carregar, executar uma vez:
  ```ts
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
  }
  ```
- Garante que dispositivos que algum dia tiveram SW registrado (mesmo por engano) não sirvam mais bundle antigo.

### 5. Montagem global

- `src/App.tsx`: renderizar `<VersionWatcher />` próximo ao `<Toaster />`, dentro do provider raiz — assim funciona tanto no dashboard quanto nas páginas de guia (`/g/:slug`).

## Detalhes técnicos

- Sem novas dependências (usa `sonner` já presente).
- Sem mudanças de banco, RLS, edge functions ou auth.
- `version.json` é `{ "version": "1779733527000", "builtAt": "2026-05-25T18:25:27Z" }`.
- Polling de 60s é leve (~200 bytes por request) e respeita `visibilitychange` (não roda em aba inativa).

## Arquivos afetados

- `scripts/generate-version.mjs` (novo)
- `package.json` (scripts `prebuild` + `predev`)
- `vite.config.ts` (`define: __APP_VERSION__`)
- `src/vite-env.d.ts` (declaração de tipo)
- `src/components/VersionWatcher.tsx` (novo)
- `src/main.tsx` (unregister de SW legados)
- `src/App.tsx` (monta `<VersionWatcher />`)

## Resultado para o cliente ABMnb

Após o deploy desta mudança, basta que ele faça **um único hard refresh** (`Ctrl+Shift+R`). A partir daí, qualquer nova publicação será detectada automaticamente em até 60s — ele verá o aviso "Nova versão disponível" e basta clicar em "Atualizar agora". Não precisará mais limpar cache manualmente.
