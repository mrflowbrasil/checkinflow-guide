# Architecture rules

- Define authentication context in a separate non-component module shared by the provider and consumers, so hot reloads cannot split their context identity.
- Route public guest phone submissions through an Edge Function and share payload validation with the client; this avoids browser CORS dependencies and prevents success before upstream acceptance.
- Resolve guest-phone webhook integration context server-side for the active workspace and forward only allowlisted fields to the fixed webhook; never expose integration credentials in guest responses or browser code.
- Resolve guest phone pages by the tenant slug and its history using a shared resolver; reuse the existing tenant slug RPCs in settings so uniqueness and catalog addresses remain consistent.