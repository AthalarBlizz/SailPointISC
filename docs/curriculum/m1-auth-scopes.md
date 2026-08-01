# M1 — Authentication, scopes, and least privilege

**Track:** Foundations  
**Est. time:** 2–3 hr  
**Goal:** Ship PAT-based integrations that fail closed and are diagnosable  
**Fluency refresh:** Path A `phase-1` in [curriculum.md](../curriculum.md)

## Senior outcomes

- Implement client-credentials token acquisition and reuse (~12 min TTL).
- Separate PAT owner user level from OAuth scopes when debugging 403.
- Specify least-privilege scopes per integration, not sp:scopes:all by default.

## When to use

- Any greenfield script, service, or integration-spec for another platform
- Incident response on 401/403/429
- PAT rotation / offboarding of integration identities

## When not

- End-user interactive OAuth for UI apps (different product surface)
- Connector-internal auth to the target SaaS (connector SDK concern)

## Failure modes



## Enterprise checklist



## Checkpoints



## Interactive learning

Open **Path B → Auth & scopes** in the web app (`#/module/m1`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
