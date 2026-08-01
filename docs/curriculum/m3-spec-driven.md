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

## Core content

During the dual-world period, model memory and old blog posts still invent /v2025 paths. Specs are the only ground truth that survive the July 2026 migration.

### Where truth lives

| Asset | Use for |
| --- | --- |
| api-specs/idn/sailpoint-api.yaml | Current per-service v1 collection |
| api-specs/idn/v2025|v2026/ | Reading legacy code / workshop samples |
| developer.sailpoint.com docs/api | Human navigation + migration table |
| SDK stubs 2.x | Method names after you confirm the operation exists |

### Spec-first workflow

- Find the operation in the highest-relevance current spec.
- Note path `/service/vN`, required scopes, experimental flag.
- Only then choose SDK method or write REST call sheet.
- After mutate: plan the verifying GET from the same spec.

### Agentic + CI discipline

- Keep api-specs git-pulled. Point agents at CLAUDE.md + YAML.
- Reject PRs that introduce yearly paths or /latest without an explicit waiver.
- Prefer generated/typed clients over hand-rolled URLs.

## Failure modes

- Copying v2025 paths from blog posts dated before July 2026 migration push.
- Trusting LLM endpoint memory during the dual-world transition.
- Generating SDK calls for operations that only exist under experimental headers.

## Enterprise checklist

- [ ] api-specs clone in repo or submodule; pull cadence defined
- [ ] PR template asks for spec path / operationId
- [ ] Experimental ops require ADR + non-prod flag
- [ ] Contract tests or recorded fixtures for critical paths

## Checkpoints

1. **Before writing list-accounts code, what do you open first?**
   - Current OpenAPI (sailpoint-api.yaml or docs for /accounts/v1) — confirm path, params, scopes — then SDK/REST.
2. **Why keep legacy yearly YAML around after migrating?**
   - To read and migrate existing code and workshop samples accurately until Q1 2029, not as a greenfield target.

## Interactive learning

Open **Path B → Spec-driven** in the web app (`#/module/m3`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
