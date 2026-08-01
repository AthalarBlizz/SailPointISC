# M9 — Python SDK — sailpoint 2.x

**Track:** SDKs & CLI  
**Est. time:** 3–4 hr  
**Goal:** Write automation with SDK 2.x resource APIs while literate in 1.4.x workshop code  
**Fluency refresh:** Path A `phase-5` in [curriculum.md](../curriculum.md)

## Senior outcomes

- Configure via env/keyring and call version-suffixed methods.
- Explain this repo’s 1.4.x pin vs greenfield 2.x target.
- Describe migrate_sdk.py / namespace → resource API changes.

## When to use

- Ops automation, data jobs, notebook-adjacent tooling
- Porting DevDays scenarios to production standards

## When not

- Browser/Node-only shops with no Python runtime
- External ITSM teams who should get REST sheets

## Core content

DevDays samples may import sailpoint.v2025 and yearly paths — great patterns for dry-run/governance, not the greenfield versioning target. New work → 2.x + /service/vN.

### Workshop 1.4.x vs production 2.x

- Greenfield: resource APIs + `list_accounts_v1` style methods via `Configuration()`.
- Workshop literacy: `sailpoint.v2025.api…` yearly namespaces still work until Q1 2029.
- Credentials: `load_credentials_into_env()` → keyring → `SAIL_*` env.

### Migration

- Use official `migrate_sdk.py` / SailPoint migration docs for Python 2.x.
- Year modules collapse to resource APIs; methods gain `_v1`/`_v2` suffixes.
- Re-test filters, pagination, and experimental headers after upgrade.

> Docs: https://developer.sailpoint.com/docs/tools/sdk/python/

## Failure modes

- Shipping new prod jobs on v2025 imports “because the workshop did.”
- Mixing 1.x and 2.x packages in one venv.
- Skipping verify GET after lifecycle mutations.

## Enterprise checklist

- [ ] Separate venv/lockfile for 2.x services
- [ ] keyring locally; vault in prod
- [ ] Dry-run flag on every mutator script
- [ ] Migration ticket tied to Q2 2028 / Q1 2029 dates

## Checkpoints

1. **Is sailpoint.v2025 broken in mid-2026?**
   - Not broken yet — legacy yearly APIs work until Q1 2029. Plan migration to SDK 2.x / per-service paths.
2. **What does the Python migration generally change?**
   - Year/beta namespaces → resource APIs; methods gain version suffixes (_v1/_v2); align with per-service paths.

## Interactive learning

Open **Path B → Python SDK** in the web app (`#/module/m9`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
