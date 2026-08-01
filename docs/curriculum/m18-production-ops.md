# M18 — Production operations — reliability, security, observability

**Track:** Senior delivery  
**Est. time:** 3–4 hr  
**Goal:** Operate integrations like production software, not desk scripts  
**Fluency refresh:** Path A `phase-7` in [curriculum.md](../curriculum.md)

## Senior outcomes

- Implement token reuse, 429 backoff, and pagination budgets.
- Log request/correlation IDs without secrets or unnecessary PII.
- Define SLOs for disable and access-request automations.

## When to use

- Production readiness review
- Incident retrospectives on failed JML/ITDR runs

## When not

- Learning filters for the first time (M5)

## Core content

Integrations fail in production from rate limits, expired PATs, and unverified mutations — treat them like shipped software with SLOs, secrets hygiene, and observability.

### Example SLO framing

| Flow | SLO sketch |
| --- | --- |
| ITDR disable accept | API accept < 30s; verify lifecycle visible < 2m |
| Access request submit | Submit success < 1m; track approval separately |
| Nightly compliance | Finish dry-run report before change window |

### Ops topics that matter

- Secrets: PAT per integration; rotate; revoke on offboarding; keyring local / vault prod.
- Idempotency & verify: GET before/after mutations (project standard).
- Rate limits: ~100 req / access_token / 10s order of magnitude — batch and backoff.
- Object ID discipline: resolve by name every run.
- Change management: pin /service/vN; experimental non-prod; watch X-Deprecated.
- Observability: request IDs, named PATs, dashboards on error rates and lag.

## Failure modes

- Logging bearer tokens or full identity payloads.
- No alarms on 401 spikes after PAT expiry.
- Fire-and-forget mutations with no verify.

## Enterprise checklist

- [ ] Runbook with PAT rotation
- [ ] Dashboards + on-call owner
- [ ] Dry-run in lower env required before prod mutate
- [ ] PII redaction in logs
- [ ] Deprecation header alerts

## Checkpoints

1. **Name three production craft requirements after a lifecycle mutation.**
   - Verify with GET (before/after), structured logs with request IDs (no secrets), and clear owner/SLO for async provisioning lag.
2. **How do you respond to 429s correctly?**
   - Reuse one token, reduce concurrency, exponential backoff with jitter, and respect bulk/pagination design — do not stampede new tokens.

## Interactive learning

Open **Path B → Production ops** in the web app (`#/module/m18`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
