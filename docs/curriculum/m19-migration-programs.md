# M19 — Migration programs — yearly to per-service at scale

**Track:** Senior delivery  
**Est. time:** 3–4 hr  
**Goal:** Run an org-wide migration with inventory, scripts, and executive dates  
**Fluency refresh:** Path A `phase-2` in [curriculum.md](../curriculum.md)

## Senior outcomes

- Build an inventory across scripts, SDKs, workflows, and ITSM.
- Apply official migration scripts + path tables; quarantine V2 outliers.
- Communicate Q2 2028 support end and Q1 2029 hard EOL.

## When to use

- Enterprise IAM platform programs
- Post–July 2026 versioning strategy updates

## When not

- Single-file rewrite with no dependents (still use the table, but skip PMO theater)

## Core content

Per-service versioning is current. Legacy yearly/v3/beta remain until Q1 2029; support tickets through Q2 2028. Pin /service/vN and SDK 2.x — /latest is not a production strategy.

### Program shape

- Inventory: repos, workflow HTTP actions, ServiceNow, RPA, notebooks.
- Classify: already /service/vN, yearly, /latest, experimental.
- Automate: SDK migration scripts (TS/Python/Go/PS) + Workflow Analyzer.
- Manual: V2 outliers (e.g. some entitlements / access-request-config).
- Prove: contract tests; dual-run if needed; cut /latest.
- Govern: CI deny-lists for /v2024|/v2025|/v2026|/latest in new code.

> Migration guide: https://developer.sailpoint.com/docs/api/api-versioning-migration/

> Strategy update (2026-07-14): https://developer.sailpoint.com/discuss/t/api-versioning-strategy-update-whats-changed-and-how-to-migrate/216376

## Failure modes

- Migrating app code but not workflows.
- Big-bang without inventory — surprise ITSM breakages.
- Declaring done when SDKs upgraded but /latest cron remains.

## Enterprise checklist

- [ ] Inventory spreadsheet / SCORE ticket set
- [ ] Workflow Analyzer evidence
- [ ] V2 outlier register
- [ ] CI lint for banned path prefixes
- [ ] Executive timeline published

## Checkpoints

1. **Outline a migration plan for v2024 scripts, v2025 workflows, and one /latest job.**
   - Inventory → map via official table → SDK migration scripts for code → Workflow Analyzer for HTTP actions → replace /latest with pinned /service/vN → test → track to Q2 2028/Q1 2029.
2. **Why call out V2 outliers explicitly?**
   - Not every legacy path maps to v1; blind search-replace to /v1 breaks entitlements/config endpoints that moved to v2.

## Interactive learning

Open **Path B → Migration programs** in the web app (`#/module/m19`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
