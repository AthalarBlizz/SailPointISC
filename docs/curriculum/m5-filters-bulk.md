# M5 — Filters, Search, PATCH, and bulk patterns

**Track:** API craft  
**Est. time:** 3–4 hr  
**Goal:** Query and update at enterprise scale without foot-guns  
**Fluency refresh:** Path A `phase-3` in [curriculum.md](../curriculum.md)

## Senior outcomes

- Write standard collection filters with eq/sw/co/in/and and correct quoting.
- Choose list filters vs Search (searchAfter) for the right workload.
- Apply JSON Patch (application/json-patch+json) and respectful bulk/pagination.

## When to use

- Lookups by alias, status, source, created date
- Reporting and reconciliation jobs
- Partial updates where PUT would clobber fields

## When not

- Real-time disable when you already have the identity id (skip search theater)
- Replacing governed access changes with blind PATCH of assignments

## Failure modes



## Enterprise checklist



## Checkpoints



## Interactive learning

Open **Path B → Filters & bulk** in the web app (`#/module/m5`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
