# ISC Developer Curriculum (web app)

Mobile-first dual-path learning app for SailPoint ISC — with XP, ranks, streaks, badges, sequential unlocks, Mermaid diagrams, and section micro-checks.

## Paths

| Path | Focus |
|------|--------|
| **Fluency** | Conversational checkpoints, phases 0–8 |
| **Implementation** | Senior modules M0–M20 (APIs, SDKs, extensibility) |

Choose on first visit; switch anytime from the top bar. Progress is stored separately per path (`localStorage` key `isc-curriculum-progress-v4`).

## Gamification (offline)

- **XP** from quizzes, drills, labs, and cleared units
- **Ranks:** Novice → Practitioner → Fluent/Builder → Senior → Architect
- **Streaks** on daily activity
- **Badges** on Achievements (`#/achievements`)
- **Unlocks:** clear a unit (all micro-checks + rated checkpoints) to open the next

Export/import progress JSON from Home to back up across devices.

## Listen mode

On any unlocked phase or module, tap **Listen**. The app narrates a coach-style spoken lesson (not a screen dump): authored scripts for Phase 0–2 / M0–M2; other units use a rewrite engine that summarizes tables, skips code/URLs, and pauses for micro-checks.

- Play / Pause / Next / Prev, rate, and voice picker
- Keep the curriculum tab open — some browsers pause speech when the tab is fully backgrounded
- Space toggles play/pause

Requires browser Web Speech API (Chrome, Edge, Safari).

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
- Diagrams: `src/content/diagrams.ts`
- Listen scripts: `src/content/listenScripts.ts`
- Badges: `src/content/badges.ts`
- Shared: snapshot, glossary, labs
