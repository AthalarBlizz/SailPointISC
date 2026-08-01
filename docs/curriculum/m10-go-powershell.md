# M10 — Go and PowerShell SDKs

**Track:** SDKs & CLI  
**Est. time:** 2–3 hr  
**Goal:** Select and migrate Go/PS clients with the same per-service mental model  
**Fluency refresh:** Path A `phase-5` in [curriculum.md](../curriculum.md)

## Senior outcomes

- Know when Go or PowerShell is the right official SDK vs REST.
- Expect resource APIs + versioned methods after SDK 2.x-style migrations.
- Point teams at SailPoint migration scripts for Go and PowerShell.

## When to use

- Windows ops / Exchange-adjacent automation (PowerShell)
- Compiled microservices / platform preference (Go)

## When not

- Forcing Go when the org’s ISC skill is Python/TS
- Embedding SDK into a system that only allows outbound HTTP policies via a gateway (REST may be clearer)

## Core content

SailPoint maintains official Go and PowerShell SDKs alongside TS/Python. Post-migration, expect the same story: stop year collections; call versioned service operations. Use CLI to init projects where supported.

### SDK fit

| SDK | Typical home |
| --- | --- |
| PowerShell | Windows admin runbooks, Entra/AD ops bridges |
| Go | Platform services, CLIs, high-concurrency workers |
| TypeScript | Node APIs, connectors, customizers |
| Python | Data/ops automation |

### Parity across languages

- Auth still PAT client-credentials → SAIL_* style config.
- Prefer /service/vN semantics even when the client hides URLs.
- Run language-specific migration scripts; review V2 outliers.

## Failure modes

- Assuming cmdlet names from 2024 blog posts still match post-2.x migration.
- Different languages in one flow without a shared ADR on versioning.
- PowerShell secrets in plaintext scripts on jump hosts.

## Enterprise checklist

- [ ] Language choice recorded in ADR with owner skill coverage
- [ ] Migration script executed per SDK
- [ ] Secret store integration (not script parameters in clear text)
- [ ] Parity tests against a golden REST call sheet

## Checkpoints

1. **What stays constant across TS/Python/Go/PS after the 2026 versioning change?**
   - Per-service API versions, PAT auth, name→id resolution, and method/operation version suffixes — not yearly collections.
2. **When is PowerShell the better default than Python for ISC automation?**
   - When the operating model is Windows-centric runbooks and existing PS skill/tooling outweighs Python packaging.

## Interactive learning

Open **Path B → Go & PowerShell** in the web app (`#/module/m10`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
