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

## Failure modes



## Enterprise checklist



## Checkpoints



## Interactive learning

Open **Path B → REST any-language** in the web app (`#/module/m4`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
