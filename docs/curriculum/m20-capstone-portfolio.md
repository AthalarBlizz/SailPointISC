# M20 — Capstone portfolio overview

**Track:** Senior delivery  
**Est. time:** ongoing  
**Goal:** Prove senior delivery via labs A–H spanning REST, SDK, extensibility, and ADR  
**Fluency refresh:** Path A `phase-8` in [curriculum.md](../curriculum.md)

## Senior outcomes

- Complete or design Path A capstones A–D on current /service/vN paths.
- Deliver Path B capstones E–H: transform, workflow, connector, ADR.
- Pass decision drills that force extension-point selection under constraints.

## When to use

- End of Path B / interview prep / team enablement demos

## When not

- Skipping foundations — do not start here cold

## Core content

Treat labs as an evidence pack for promotion/interview. Link modules M4–M19 as citations inside each deliverable.

### Portfolio map

| Lab | Proves |
| --- | --- |
| A Emergency disable | REST integration spec + lifecycle by name |
| B Compliance bridge | SDK automation + dry-run |
| C Peer provisioner | Access requests + SDK 2.x naming |
| D Migration advisory | Program timeline + tooling |
| E Transforms | JSON transform design |
| F Workflow | HTTP actions on /service/vN |
| G Connector | SaaS Connectivity sketch |
| H ADR | Senior standards doc |

### Definition of done (senior)

- Current paths only (`/accounts/v1` style); SDK methods *V1/*V2.
- Name→id resolution; verify GETs; dry-run where mutating bulk.
- Explicit whenNot: transform vs rule vs workflow vs connector justified.
- Secrets story; no credentials in artifacts.

## Failure modes

- Capstone still demos /v2026 as “the” standard.
- Beautiful ADR with no inventory or lab evidence.
- Connector capstone that is actually a cron script.

## Enterprise checklist

- [ ] All A–H briefs read
- [ ] At least one REST + one SDK + one extensibility artifact complete
- [ ] Decision lab scenarios answered with rationale
- [ ] Personal glossary of tenant-specific names to resolve

## Checkpoints

1. **Which labs prove extensibility vs API craft?**
   - Extensibility: E transforms, F workflow, G connector, decision lab. API craft: A–C, REST/SDK implementation labs.
2. **What must every mutator capstone show?**
   - Resolve by name, pin /service/vN or SDK V1 methods, and verify with GET (plus dry-run for bulk).
3. **Point to the lab for an architecture decision record.**
   - lab-capstone-h (ADR) — also supported by M17–M19 content.

## Interactive learning

Open **Path B → Capstone portfolio** in the web app (`#/module/m20`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
