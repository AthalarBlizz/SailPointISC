# M16 — Connector customizers — before/after hooks in TypeScript

**Track:** Extensibility  
**Est. time:** 2–3 hr  
**Goal:** Mutate SaaS connector I/O without forking the whole connector  
**Fluency refresh:** Path A `phase-6` in [curriculum.md](../curriculum.md)

## Senior outcomes

- Explain customizer vs full custom connector vs classic rule.
- Identify before/after operation hooks as the extension point.
- Plan testing so customizer bugs do not corrupt provisioning quietly.

## When to use

- OOTB or SaaS connector is almost right — need payload tweaks
- Attribute reshaping / filtering on connector read/write

## When not

- Net-new protocol implementation (build connector)
- Identity-profile-only attribute mapping (transform)

## Failure modes



## Enterprise checklist



## Checkpoints



## Interactive learning

Open **Path B → Customizers** in the web app (`#/module/m16`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
