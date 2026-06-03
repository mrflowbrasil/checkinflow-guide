Swap the order of the `<Beneficios />` and `<BulletsPro />` component calls inside the `<main>` element of `src/pages/LpAnuncio.tsx`.

Current order (lines 96-100):
```
<HeroLp />
<RealDemoLight />
<AntesDepois />
<Beneficios />
<BulletsPro />
<VideoCriacao />
```

New order:
```
<HeroLp />
<RealDemoLight />
<AntesDepois />
<BulletsPro />
<Beneficios />
<VideoCriacao />
```

No other file changes are required. The component definitions for `Beneficios` and `BulletsPro` remain in their current positions in the same file.