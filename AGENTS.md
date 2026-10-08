# Architecture rules

- Define authentication context in a separate non-component module shared by the provider and consumers, so hot reloads cannot split their context identity.
- Route public guest phone submissions through an Edge Function and share payload validation with the client; this avoids browser CORS dependencies and prevents success before upstream acceptance.