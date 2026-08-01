# M14 — Workflows — event-driven automation and HTTP actions

**Track:** Extensibility  
**Est. time:** 3–4 hr  
**Goal:** Design workflows that stay on current API versions and clear ownership  
**Fluency refresh:** Path A `phase-6` in [curriculum.md](../curriculum.md)

## Senior outcomes

- Place workflows vs external SDK jobs vs transforms correctly.
- Scan workflow HTTP actions for legacy /v2025|/v2026|/latest paths.
- Define error handling, secrets, and idempotency for HTTP actions.

## When to use

- Identity events triggering tickets, Slack, or follow-on ISC calls
- Low-code orchestration with approvals baked in

## When not

- Heavy bulk reconciliation (external job + SDK)
- Attribute normalize on aggregate (transform)

## Core content

Workflows shine for event-driven process automation inside ISC. External scripts still win for complex data joins, large batch, and sophisticated testing harnesses.

### HTTP action checklist

- Pin per-service paths — no `/latest`.
- Resolve object IDs in earlier steps by name.
- Handle non-2xx with explicit branches; don’t swallow failures.
- Secrets via workflow secret store — not hardcoded.

> HTTP actions often still call `/v2025/...` or `/latest`. Use Workflow Analyzer and migrate to `/service/vN` before Q1 2029.

## Failure modes

- Workflow HTTP still on yearly paths after app code migrated.
- Infinite loops (workflow mutates identity → retriggers same workflow).
- No owner for failed executions.

## Enterprise checklist

- [ ] Workflow Analyzer in migration pipeline
- [ ] Execution monitoring + alerting
- [ ] Idempotency keys / guards against re-entry
- [ ] Documented trigger events and side effects

## Checkpoints

1. **Workflow HTTP action still on /v2025/... — what’s the risk?**
   - Legacy yearly APIs lose support Q2 2028 and stop Q1 2029; action fails in prod if not migrated to /service/vN.
2. **Bulk CSV compliance — workflow or SDK job?**
   - Usually SDK/external job with dry-run. Workflows fit event-sized units of work, not large file crunching.

## Interactive learning

Open **Path B → Workflows** in the web app (`#/module/m14`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
