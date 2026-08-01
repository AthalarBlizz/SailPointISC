# M4 — REST in any language — integration specs

**Track:** API craft  
**Est. time:** 3–4 hr  
**Goal:** Produce a complete HTTP call sheet another system can implement without an SDK  
**Fluency refresh:** Path A `phase-5` in [curriculum.md](../curriculum.md)

## Senior outcomes

- Write method, URL, headers, body, expected status, and verify GET for a multi-step flow.
- Choose REST integration-spec when the caller is ITDR/SIEM/ServiceNow/webhook — not a long-running SDK app.
- Handle token reuse, pagination, and 429 in language-agnostic terms.

## When to use

- External platforms that already speak HTTP
- Vendor handoff where you cannot ship Python/TS runtime
- Contract-first reviews with security/architecture

## When not

- Standalone scheduled automation you own end-to-end (prefer SDK)
- SaaS connector implementation (M15)

## Core content

The wrong deliverable wastes weeks — handing ServiceNow a Python SDK forces their team to host a runtime they do not own, while giving yourself only a Postman collection skips retries, pagination, and typed clients you will need in production.

### SDK vs REST decision

| Caller | Deliverable |
| --- | --- |
| Your Python/TS job | Official SDK 2.x |
| ServiceNow / SOAR / custom Java | REST call sheet + PAT guidance |
| One-shot Postman collection | REST; graduate to SDK if it becomes a product |

### Emergency disable call-sheet skeleton

- POST `/oauth/token` (client_credentials).
- GET `/identities/v1?filters=alias eq "{alias}"`.
- GET lifecycle states on the identity profile → pick name == `"Terminated"`.
- POST `/identities/v1/{id}/set-lifecycle-state` with resolved `lifecycleStateId`.
- GET identity to verify after state.

> Rule of thumb: script-on-its-own → SDK. Other-system-calls-ISC → REST integration spec.

> Pin /service/vN. Document idempotency expectations and what “success” means if ISC accepted the call but provisioning is async.

## Failure modes

- Giving ServiceNow the Python SDK as the integration contract.
- Omitting verify GET — mutation assumed done.
- Hardcoding lifecycle state UUID in the call sheet.
- Using /v2026 or /latest in a “current” handoff doc.

## Enterprise checklist

- [ ] Base URL + auth + scope list
- [ ] Every step: method, path, sample body, status codes
- [ ] Name-resolution steps explicit
- [ ] Error matrix: 401/403/404/429/4xx business
- [ ] Owner team + PAT naming convention

## Checkpoints

1. **Should our ServiceNow team import the Python SDK?**
   - Usually no — give REST + PAT + per-service paths. SDKs are for runtimes you own.
2. **What four things must every mutation step include in a call sheet?**
   - Request (method/path/headers/body), expected success status, name→id resolution if needed, and a verify GET (before/after).

## Interactive learning

Open **Path B → REST any-language** in the web app (`#/module/m4`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
