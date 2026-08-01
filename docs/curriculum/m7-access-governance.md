# M7 — Access requests, roles, and certifications

**Track:** API craft  
**Est. time:** 3–4 hr  
**Goal:** Automate access without bypassing governance  
**Fluency refresh:** Path A `phase-3` in [curriculum.md](../curriculum.md)

## Senior outcomes

- Submit access requests for roles/access profiles/entitlements with approvals intact.
- Design peer-clone as dry-run → request, not direct grant.
- Know where certification and request-config APIs sit (including v2 outliers).

## When to use

- Joiner role packages, peer clone, training enrollment
- Status/cancel/close automations around request lifecycle
- Certification campaign integrations / reporting

## When not

- Emergency revoke for compromised user (lifecycle/disable — M6)
- SoD policy authoring in BeanShell (different admin surface)

## Core content

Prefer /access-requests/v1 for create/status patterns. Some configuration endpoints migrate to v2 — check the migration table. Approvals still apply; automation is a requester, not a backdoor.

### Peer clone pattern

- Collect peer roles/entitlements → dry-run for manager → submit access requests.
- Never copy accounts by raw entitlement assignment APIs unless policy explicitly allows.

### Certifications (integration literacy)

- Campaigns review and revoke access on a schedule — integrations usually report, kick off, or sync decisions.
- Do not confuse certification revoke with ITDR emergency disable.
- Read scopes carefully; campaign APIs are easy to over-privilege.

## Failure modes

- Direct entitlement assignment to skip approvals.
- Submitting requests with sandbox role GUIDs in prod.
- Ignoring pending approval SLAs in “automation success” metrics.
- Leaving access-request-config calls on legacy yearly paths.

## Enterprise checklist

- [ ] Request types and item types documented
- [ ] Dry-run artifact for manager/audit
- [ ] Status polling / webhook strategy
- [ ] Cancel/close error handling
- [ ] Certification vs request vs lifecycle decision tree

## Checkpoints

1. **Why must peer clone submit access requests?**
   - To preserve approvals, SoD, and audit. Direct grants bypass governance the business relies on.
2. **Name one migration foot-gun specific to access APIs.**
   - `access-request-config` has v1 and v2; entitlements prefer `/entitlements/v1` in local OpenAPI, but the migration table may list v2 for some v2026 cases — verify both.

## Interactive learning

Open **Path B → Access & governance** in the web app (`#/module/m7`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
