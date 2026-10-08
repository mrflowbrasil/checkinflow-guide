# Architecture rules

- Define authentication context in a separate non-component module shared by the provider and consumers, so hot reloads cannot split their context identity.