# ISC Developer Curriculum (web app)

Mobile-first learning app for the SailPoint ISC developer curriculum.

## Local

```bash
cd web
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173/`).

```bash
npm run build    # production build → dist/
npm run preview  # preview production build
```

## GitHub Pages

Deployed by [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) on push to `main` when `web/` changes.

One-time repo setup:

1. **Settings → Pages → Build and deployment → Source:** GitHub Actions
2. Push to `main` (or run the workflow manually)
3. App URL: `https://<user>.github.io/SailPointISC/`

Production builds use `VITE_BASE=/SailPointISC/` so assets resolve under the project path. HashRouter is used so deep links work without server rewrites (`.../#/phase/phase-2`).

## Embed later / Capacitor later

- Set `VITE_BASE` to the path prefix where the app will live (e.g. `/learn/`).
- Progress uses a `StorageAdapter` (`localStorage` today) — swap for Capacitor Preferences when wrapping native apps.
- No backend; works offline after first load (content is bundled).

## Content

Runtime content lives in `src/content/`. Editorial source of truth for curriculum text remains [`docs/curriculum.md`](../docs/curriculum.md) — port changes into the typed modules when updating.
