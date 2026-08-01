# M8 — TypeScript SDK — sailpoint-api-client 2.x

**Track:** SDKs & CLI  
**Est. time:** 4–5 hr  
**Goal:** Ship typed Node/TS clients using resource APIs and V1 method suffixes  
**Fluency refresh:** Path A `phase-4` in [curriculum.md](../curriculum.md)

## Senior outcomes

- Scaffold Configuration + AccountsApi/IdentitiesApi and call list*V1 methods.
- Distinguish API SDK vs Connector SDK vs customizers (all TypeScript, different jobs).
- Run/describe the 1.x → 2.0 migration script (AccountsV2025Api → AccountsApi).

## When to use

- Node services, modern backends, shared TS monorepos
- Teams already on sailpoint-api-client
- Companion sketches next to REST call sheets

## When not

- Custom SaaS connector (use @sailpoint/connector-sdk — M15)
- ServiceNow Mid Server Java caller (REST spec — M4)

## Core content

TypeScript appears in three SailPoint surfaces — API SDK, SaaS Connectivity, and customizers. Conflating them leads to the wrong package and the wrong runtime.

### Three TypeScript surfaces

| Surface | Package | Job |
| --- | --- | --- |
| ISC API SDK | sailpoint-api-client | Call ISC REST from Node/TS |
| SaaS Connectivity | @sailpoint/connector-sdk + spcx | Custom cloud connectors |
| Customizers | Customizer framework | Mutate before/after connector ops |

### 2.x client pattern

- CLI: `sail sdk init typescript my-project`; `sail sdk init config`.
- Migration: `migrationScript.js` rewrites year APIs to resource + V1/V2 suffixes.
- Pin dependency major 2.x; review changelogs when SailPoint ships new service majors.
- Pattern: `AccountsApi` + `listAccountsV1({ limit, filters })` from `sailpoint-api-client`.

> Docs: https://developer.sailpoint.com/docs/tools/sdk/typescript/

## Failure modes

- Importing AccountsV2025Api in new code after 2.x upgrade.
- Using API SDK inside a connector where connector SDK is required.
- Committing SAIL_CLIENT_SECRET in .env to “make CI work.”

## Enterprise checklist

- [ ] sailpoint-api-client ^2 locked in package.json
- [ ] Config from env/vault — no secrets in repo
- [ ] Shared client wrapper: retries, 429, request IDs
- [ ] Migration script runbook for legacy packages

## Checkpoints

1. **Show how method versioning works in TS SDK 2.x.**
   - Resource class (AccountsApi) + version suffix on methods (listAccountsV1). Legacy used year-named classes like AccountsV2025Api.
2. **API SDK vs Connector SDK — nightly compliance job vs new SaaS HR app?**
   - Nightly compliance → API SDK (or Python). New SaaS HR with no OOTB connector → Connector SDK / SaaS Connectivity.

## Interactive learning

Open **Path B → TypeScript SDK** in the web app (`#/module/m8`) for full implementation patterns, code samples, and labs.

Runtime source of truth: `web/src/content/implementation/`.
