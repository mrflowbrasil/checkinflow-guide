## Plano

Criar uma página pública de Termos de Serviço com o conteúdo completo do arquivo anexo (512 linhas).

### Passos

1. **Copiar o conteúdo do arquivo** `user-uploads://TERMOS_DE_SERVIÇO_-_MR_FLOW_WELCOME.txt` para `src/content/terms-of-service.ts` como string exportada (preservando quebras de parágrafo e seções numeradas).

2. **Criar `src/pages/Terms.tsx`**:
   - Layout simples e legível (container `max-w-3xl mx-auto`, tipografia `prose`).
   - Cabeçalho com logo Mr Flow + título "Termos de Serviço" + link "Voltar ao início".
   - Renderização do conteúdo dividindo por parágrafos; títulos numerados (ex.: "1. CONCEITOS...") detectados via regex e renderizados como `<h2>`.
   - Componente `<Seo>` com title/description/canonical para `/termos` (noindex = false).
   - Rodapé simples com data da última atualização.

3. **Registrar rota em `src/App.tsx`**:
   - `const Terms = lazy(() => import("./pages/Terms"))`
   - `<Route path="/termos" element={<Terms />} />`

4. **Adicionar link no rodapé da landing** (`WelcomeHubLanding.tsx`) apontando para `/termos`, se já existir rodapé com links legais — caso contrário, apenas a rota fica disponível.

5. **Atualizar `public/sitemap.xml`** incluindo `/termos`.

### Observações técnicas

- Conteúdo armazenado como constante TS (não JSON) para evitar problemas com aspas curvas/acentos.
- Sem alterações de backend, sem novas dependências.
- Usa tokens do design system existente (sem cores hardcoded).
