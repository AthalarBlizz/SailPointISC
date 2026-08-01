# M2 — API versioning — per-service vN vs legacy yearly

**Track:** Foundations  
**Est. time:** 3–4 hr  
**Goal:** Advise greenfield pins and brownfield migration with July 2026 facts  
**Fluency refresh:** Path A `phase-2` in [curriculum.md](../curriculum.md)

## Senior outcomes

- Map /v2026/{resource} → /{resource}/vN using the official migration table.
- Explain why /latest is unsafe for production under the new strategy.
- State support (through Q2 2028) and hard EOL (Q1 2029) for legacy yearly/v3/beta.

## When to use

- Any new integration design review
- Inventory of existing scripts, workflows, and ServiceNow integrations
- SDK major-version upgrades

## When not

- Choosing transform vs rule (extensibility track)
- Debugging filter syntax (M5)

## Failure modes



## Enterprise checklist



## Checkpoints



## Interactive learning

Open **Path B → Versioning** in the web app (`#/module/m2`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
