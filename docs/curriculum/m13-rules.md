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

## Core content

Rules are BeanShell, reviewed, and operationally heavier. Treat them as privileged platform code — version, peer review, and document blast radius.

### Transform vs rule boundary

| Need | Prefer |
| --- | --- |
| String/date/lookup mapping | Transform |
| Complex branching + state | Rule (or external + API) |
| Before/after SaaS connector ops | Customizer (TS) |
| Approvals + HTTP side effects | Workflow |

### Enterprise ops notes

- Track which identity profiles / sources depend on each rule.
- Avoid silent dual-maintenance of transform and rule for the same attribute.
- For new SaaS sources, evaluate customizers before new classic rules.

## Failure modes

- Rule sprawl for trivial string ops.
- Undocumented rule dependencies → broken aggregates after cleanup.
- Assuming rules deploy like a normal git push without SailPoint process.

## Enterprise checklist

- [ ] Inventory of rules with owners
- [ ] Justification recorded when transform was insufficient
- [ ] Test plan on sandbox identities
- [ ] Rollback / previous version retained

## Checkpoints

1. **Transform or rule?**
   - Default transform. Rule only when transform vocabulary cannot express the logic or platform constraints require it.
2. **For mutating SaaS connector payloads, what should you consider before a classic rule?**
   - TypeScript connector customizers — often more flexible for SaaS source I/O.

## Interactive learning

Open **Path B → Rules** in the web app (`#/module/m13`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
