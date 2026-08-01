# M12 — Transforms — attribute mapping without code

**Track:** Extensibility  
**Est. time:** 3–4 hr  
**Goal:** Prefer transforms for deterministic attribute calculate/map on aggregate/provision  
**Fluency refresh:** Path A `phase-6` in [curriculum.md](../curriculum.md)

## Senior outcomes

- Author/read transform JSON (type, attributes, input) for common patterns.
- Decide transform vs rule with a clear complexity boundary.
- Reference transforms from identity profiles without hardcoding opaque IDs in docs only — resolve in APIs.

## When to use

- Concat, lower/upper, substring, date format, conditional firstValid/lookup
- Standardizing email, UPN, displayName across sources

## When not

- Multi-source orchestration with approvals (workflow)
- Logic that needs complex loops / external calls beyond transform vocabulary (rule or external)

## Failure modes



## Enterprise checklist



## Checkpoints



## Interactive learning

Open **Path B → Transforms** in the web app (`#/module/m12`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
