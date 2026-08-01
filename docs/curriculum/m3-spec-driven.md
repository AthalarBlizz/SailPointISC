# M3 — Spec-driven development — OpenAPI as ground truth

**Track:** Foundations  
**Est. time:** 2–3 hr  
**Goal:** Never invent endpoints — read local specs and generate typed clients from truth  
**Fluency refresh:** Path A `phase-2` in [curriculum.md](../curriculum.md)

## Senior outcomes

- Locate an operation in api-specs/idn (current sailpoint-api.yaml vs legacy yearly folders).
- Extract method, path, scopes, and required headers before writing code.
- Explain how agentic coding rules (CLAUDE.md) must prefer specs over model memory during the dual-world period.

## When to use

- Every new endpoint integration
- Code review when a PR “guesses” a path
- Updating workshop/legacy samples to per-service paths

## When not

- Pure process design with no HTTP yet (still sketch objects first in M0)

## Failure modes



## Enterprise checklist



## Checkpoints



## Interactive learning

Open **Path B → Spec-driven** in the web app (`#/module/m3`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
