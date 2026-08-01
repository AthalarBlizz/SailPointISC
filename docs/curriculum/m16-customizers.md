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

## Core content

Customizers intercept SaaS connector operations in TypeScript — more flexible than classic rules for many SaaS sources, lighter than rewriting a connector.

### Weight of approaches

| Approach | Weight |
| --- | --- |
| Transform | Lowest — identity attribute mapping |
| Customizer | Medium — connector I/O mutation |
| Full connector | Highest — protocol + schema ownership |
| Rule | Heavy process — use when required |

### Delivery practice

- Keep customizer pure and well-logged — provisioning failures are costly.
- Version with the source; do not “hot fix only in prod.”
- Add contract tests: sample input plan → expected mutated output.
- Hooks shape: `beforeStdAccountCreate` / `afterStdAccountList` (follow current framework docs).

## Failure modes

- Customizer silently dropping entitlements.
- Logic that belongs in transforms living in customizers “because TS.”
- No sandbox proof before prod attach.

## Enterprise checklist

- [ ] Customizer repo + CI
- [ ] Fixture-based tests for before/after
- [ ] Source attachment documented
- [ ] Rollback: detach customizer procedure

## Checkpoints

1. **Customizer or full connector?**
   - Customizer when an existing SaaS/OOTB connector is nearly correct. Full connector when you own the protocol/schema end-to-end.
2. **Why might customizers beat classic rules for SaaS sources?**
   - TypeScript before/after hooks on connector I/O are often more flexible and maintainable than BeanShell rules for SaaS connectivity paths.

## Interactive learning

Open **Path B → Customizers** in the web app (`#/module/m16`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
