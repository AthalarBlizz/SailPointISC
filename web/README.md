# ISC Developer Curriculum (web app)

Mobile-first dual-path learning app for SailPoint ISC.

## Paths

| Path | Focus |
|------|--------|
| **Fluency** | Conversational checkpoints, phases 0–8 |
| **Implementation** | Senior modules M0–M20 (APIs, SDKs, extensibility) |

Choose on first visit; switch anytime from the top bar. Progress is stored separately per path (`localStorage` v2).

## Local

```bash
cd web
npm install
npm run dev
```

## GitHub Pages

Deployed by [`.github/workflows/pages.yml`](../.github/workflows/pages.yml).

App URL: `https://athalarblizz.github.io/SailPointISC/`

Production builds use `VITE_BASE=/SailPointISC/`. HashRouter for deep links (`.../#/module/m2`).

## Content

- Path A: `src/content/phases.ts`
- Path B: `src/content/implementation/`
- Shared: snapshot, glossary, labs
