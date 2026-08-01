# M13 — Rules — BeanShell when transforms are not enough

**Track:** Extensibility  
**Est. time:** 2–3 hr  
**Goal:** Use rules sparingly with review, install, and ops constraints understood  
**Fluency refresh:** Path A `phase-6` in [curriculum.md](../curriculum.md)

## Senior outcomes

- List rule types/use cases that transforms cannot cover.
- Explain SailPoint review/install constraints at a conversational level.
- Prefer connector customizers for SaaS source I/O mutation when applicable (M16).

## When to use

- Complex correlation or attribute logic beyond transform vocabulary
- Legacy patterns already standardized on reviewed rules

## When not

- Anything expressible as transform JSON
- Event-driven multi-step process (workflow)
- Calling arbitrary external APIs on every aggregate without capacity planning

## Failure modes



## Enterprise checklist



## Checkpoints



## Interactive learning

Open **Path B → Rules** in the web app (`#/module/m13`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
