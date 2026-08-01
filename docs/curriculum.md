# SailPoint ISC Developer Curriculum
## Conversational fluency for API, TypeScript, and other code integrations

**Currency date:** 2026-07-31  
**Audience:** Developers learning to speak and build confidently around SailPoint Identity Security Cloud (ISC) APIs and SDKs — without requiring a live tenant for most modules.  
**Outcome:** You can hold a technical conversation with ISC developers, choose the right integration approach, read specs accurately, and write TypeScript / Python / REST integrations that match current SailPoint guidance.

**How to use this with your local sandbox:** Activate `.venv`, keep `api-specs/` current, and use Cursor Agent mode against `CLAUDE.md` + specs. Live tenant exercises are marked **[TENANT]** and are optional until you have access.

**Interactive web app:** Practice on phone or desktop via the app in [`web/`](../web/) (`npm run dev`, or GitHub Pages after deploy). Progress and lab notes save in the browser.

---

## Snapshot of the platform (as of 2026-07-31)

Memorize this table — it is what separates a 2025-era answer from a current one.

| Topic | Current state (July 2026) | What you must be able to say |
| --- | --- | --- |
| **Primary API model** | **Per-service semantic versioning** is live. Paths look like `/accounts/v1`, `/identities/v1`, `/access-requests/v1`. | “We version each service independently; major bumps only on breaking contract changes.” |
| **Legacy yearly APIs** | `v2024` / `v2025` / `v2026`, plus `v3` and `beta`, still work. | “Legacy yearly collections are deprecated for new work but remain available.” |
| **Legacy support / EOL** | Support tickets for Beta, V3, and yearly APIs through **Q2 2028**; endpoints stop functioning **Q1 2029**. | “Migration is urgent strategically but not overnight — deadline is Q1 2029.” |
| **`/latest`** | Introduced early 2026 as a yearly-alias shortcut; SailPoint now treats it as **unsafe for production** under the new strategy. | “`/latest` auto-routes and can break silently; prefer explicit `/service/vN`.” |
| **SDK major bump** | TypeScript `sailpoint-api-client` **2.0**, Python `sailpoint` **2.x**, plus Go and PowerShell — resource-based APIs with method suffixes (`listAccountsV1`). | “Old SDKs used year namespaces; new SDKs use `AccountsApi.listAccountsV1()`.” |
| **Migration tooling** | Official migration scripts + path mapping tables; Workflow Analyzer utility for scanning workflow HTTP actions. | “Don’t hand-rewrite — run the SDK migration script, then review V2 outliers.” |
| **Docs layout** | Primary API docs are flattened (no year dropdown). Legacy specs remain under Legacy API Specifications. | “Look at current service docs first; use Legacy only when maintaining old code.” |
| **This workshop repo** | DevDays 2026 scenarios still demonstrate **yearly** paths (`/v2026/...`, `sailpoint.v2025`) and Python SDK **1.4.x**. | “Great for patterns; new greenfield work should target per-service `v1` / SDK 2.x.” |

**Authoritative sources (bookmark these):**

- [API Versioning Strategy](https://developer.sailpoint.com/docs/api/api-versioning-strategy)
- [API Versioning Migration Guide](https://developer.sailpoint.com/docs/api/api-versioning-migration/)
- [Migration announcement (2026-07-14)](https://developer.sailpoint.com/discuss/t/api-versioning-strategy-update-whats-changed-and-how-to-migrate/216376)
- [ISC API reference](https://developer.sailpoint.com/docs/api/)
- Local ground truth: `api-specs/idn/sailpoint-api.yaml` (current `v1` collection) and `api-specs/idn/v2025|v2026/` (legacy)

---

## Learning path at a glance

| Phase | Focus | Est. time | Goal |
| --- | --- | --- | --- |
| **0** | Orientation & mental model | 0.5 day | Speak the product nouns |
| **1** | Auth, scopes, HTTP fundamentals | 1–2 days | Explain a failing call |
| **2** | Versioning dual-world (critical) | 1–2 days | Advise migrate vs maintain |
| **3** | Domain APIs (JML, access, search) | 3–5 days | Design an integration verbally |
| **4** | TypeScript SDK (primary) | 2–3 days | Sketch TS code in a review |
| **5** | Python / Go / PowerShell / REST | 1–2 days | Pick the right language/tool |
| **6** | Extensibility beyond the API | 2–3 days | Transforms vs rules vs workflows vs connectors |
| **7** | Production craft | 1–2 days | Security, rate limits, ops |
| **8** | Capstones & fluency drills | ongoing | Sound senior in conversation |

Total guided path: ~2–3 weeks part-time, or ~1 intensive week, then keep drilling with Agent mode.

---

## Phase 0 — ISC mental model (conversation baseline)

### Learning outcomes
- Explain what ISC is for in one sentence.
- Name the core objects and how they relate.
- Distinguish UI configuration from API/SDK extensibility.

### Core vocabulary (must be fluent)

| Term | Plain language |
| --- | --- |
| **Identity** | The person/machine identity ISC governs |
| **Account** | A user’s record on a **source** (AD, SaaS app, etc.) |
| **Source** | Connected system ISC aggregates/provisions |
| **Entitlement** | Permission/group on a source |
| **Access profile** | Bundle of entitlements |
| **Role** | Higher-level access assignment (often multiple profiles) |
| **Lifecycle state** | Joiner/mover/leaver status driving provisioning (Active, Terminated, …) |
| **Identity profile** | Mapping + transforms + lifecycle config for a population |
| **Access request** | Governed ask for access (with approvals) |
| **Certification** | Periodic review/revoke campaign |
| **Aggregation** | Pulling accounts/entitlements into ISC |
| **Provisioning** | Pushing create/update/disable/delete to sources |

### Study
1. Skim [developer.sailpoint.com](https://developer.sailpoint.com/docs/) landing and API overview.
2. Read this repo’s `README.md` and the three scenario docstrings in `src/scenario*.py` — they are “why the API exists” stories.
3. Read `docs/isc-development-guide.md` sections on base URL and auth (note: some yearly-version advice is pre-migration; Phase 2 corrects that).

### Conversational checkpoint
You can answer without notes:
- “What’s the difference between an entitlement, access profile, and role?”
- “If ITDR needs someone disabled *now*, why isn’t waiting for the next HR file enough?”
- “UI vs API — when do you reach for code?”

---

## Phase 1 — Authentication, authorization, and HTTP craft

### Learning outcomes
- Describe PAT + client-credentials flow end to end.
- Separate **user level** vs **scopes**.
- Diagnose 401 / 403 / 429 correctly.
- Store secrets with **python-keyring** (this repo’s standard) — never in source or chat.

### Study
1. [Authentication](https://developer.sailpoint.com/docs/api/authentication)
2. This repo: `src/isc_credentials.py`, `src/setup_keyring.py`, `src/auth_starter.py`
3. `docs/isc-development-guide.md` — Auth + Scopes + Common errors

### Key facts to memorize
- Token ~12 minutes; SDKs refresh automatically; raw REST must reuse one token per run.
- Modern PAT client IDs are UUID-with-dashes; legacy undashed IDs fail.
- Rate limit order of magnitude: **100 requests per access_token per 10 seconds** (confirm in current docs if quoting SLAs).
- 403 often means: wrong user level, missing scope, *or* endpoint needs user context that client-credentials cannot provide.

### Practice (offline)
1. Trace `auth_starter.py` and explain SDK vs REST paths aloud.
2. In Agent mode: “List the scopes required for access-request create from `api-specs`.”
3. Write a one-pager: “How I would store PATs in prod” (Keychain for laptop; vault for prod).

### Conversational checkpoint
- “Walk me through getting a bearer token.”
- “Why did my call return 403 with a valid token?”
- “What’s least-privilege scoping for a read-only reporting job?”

---

## Phase 2 — Versioning dual-world (most important fluency upgrade)

### Learning outcomes
- Contrast **yearly** vs **per-service** models accurately as of July 2026.
- Map a legacy path to a new path using the migration table.
- Recommend: greenfield → per-service `vN`; brownfield → migrate with scripts before Q1 2029.
- Explain public vs experimental and `X-SailPoint-Experimental: true`.

### Study (required reading)
1. [API Versioning Strategy](https://developer.sailpoint.com/docs/api/api-versioning-strategy) — current model
2. [API Versioning Migration](https://developer.sailpoint.com/docs/api/api-versioning-migration/) — scripts + path mapping
3. Community posts: [strategy updates](https://developer.sailpoint.com/discuss/t/api-versioning-strategy-updates/211805), [what’s changed / migrate (2026-07-14)](https://developer.sailpoint.com/discuss/t/api-versioning-strategy-update-whats-changed-and-how-to-migrate/216376)

### Path shapes to recognize instantly

```text
# CURRENT (prefer for new work)
https://{tenant}.api.identitynow.com/accounts/v1
https://{tenant}.api.identitynow.com/identities/v1
https://{tenant}.api.identitynow.com/access-requests/v1

# LEGACY yearly (this repo’s scenarios; still works until Q1 2029)
https://{tenant}.api.identitynow.com/v2026/accounts
https://{tenant}.api.identitynow.com/v2025/identities

# LEGACY aliases / collections
https://{tenant}.api.identitynow.com/v3/...
https://{tenant}.api.identitynow.com/beta/...
https://{tenant}.api.identitynow.com/latest/...   # avoid for production
```

### SDK shape change (TypeScript example)

```typescript
// CURRENT (sailpoint-api-client 2.x) — resource API + method version suffix
import { Configuration, AccountsApi } from 'sailpoint-api-client';
const api = new AccountsApi(new Configuration());
const accounts = await api.listAccountsV1({ limit: 10 });

// LEGACY (1.x) — year/beta namespaces on the class
// import { AccountsV2025Api } from 'sailpoint-api-client';
// await api.listAccounts(...);
```

### Practice
1. Open `api-specs/idn/sailpoint-api.yaml` and find Access Profiles / Accounts tags — confirm `version: v1` at the top.
2. Open a legacy path YAML under `api-specs/idn/v2026/paths/` and compare mentally to `/accounts/v1`.
3. Pick three endpoints from scenario 1–3; look them up in the [migration path table](https://developer.sailpoint.com/docs/api/api-versioning-migration/) and write old → new.
4. Note outliers that map to **v2** (e.g. some `/access-request-config`, `/entitlements` cases) — these are interview gold.

### Conversational checkpoint
- “Why did SailPoint abandon yearly API versions?”
- “Is `/latest` OK in production in mid-2026?”
- “My Python job still imports `sailpoint.v2025` — is that broken?” *(Answer: works until EOL; plan migration to 2.x / per-service.)*
- “How do experimental endpoints work under the new model?”

---

## Phase 3 — Domain API fluency (what to call for what)

### Learning outcomes
Design integrations verbally for joiner / mover / leaver, emergency disable, access request, peer clone, and search/reporting.

### Module 3A — Identities, accounts, lifecycle
**Concepts:** resolve identity by alias/name; never hardcode lifecycle state GUIDs; set lifecycle state to drive cascading disable/provisioning.

**Repo lab:** `src/scenario1_itdr_disable.py` (REST integration-spec pattern).  
**Rewrite exercise:** Express the same two calls as `/identities/v1` + lifecycle endpoints using current docs (Agent mode + `sailpoint-api.yaml`).

**Say this:** “For emergency disable I set lifecycle to Terminated (resolved by name) so ISC provisions disables downstream — I don’t invent per-app disable loops unless the source is unmanaged.”

### Module 3B — Access requests & approvals
**Concepts:** request roles/access profiles/entitlements; approvals still apply; cancel/close/status APIs; config may be on **v2** for some paths after migration.

**Repo lab:** `src/scenario2_training_compliance.py`, `src/scenario3_clone_peer_access.py`.

**Say this:** “Peer clone should submit access requests, not bypass governance — dry-run first, then submit.”

### Module 3C — Sources, entitlements, aggregation awareness
**Concepts:** accounts live on sources; entitlements hang off accounts; aggregation latency vs real-time API action.

### Module 3D — Search API
**Concepts:** Search index queries; `limit` up to 10k then `searchAfter`; different from list filters.

**Study:** [Standard collection parameters](https://developer.sailpoint.com/docs/api/standard-collection-parameters) + Search docs in API reference.

### Module 3E — Collection parameters, filters, PATCH
Memorize operators: `eq`, `ne`, `co`, `sw`, `gt/lt/ge/le`, `pr`, `in`, `and`/`or`.  
PATCH = JSON Patch (`application/json-patch+json`).

### Practice projects (offline OK)
| Project | Deliverable |
| --- | --- |
| Leaver design doc | Sequence diagram: resolve identity → resolve lifecycle ID by name → set state → verify GET |
| Access request client stub | TS or Python types + function signatures only (no live call) |
| Filter drill | 10 filter strings for common queries; validate against spec |

### Conversational checkpoint
- “How do you find an identity without knowing the GUID?”
- “What’s wrong with hardcoding LeaveOfAbsence’s ID?”
- “When do you use Search vs `list_identities` filters?”

---

## Phase 4 — TypeScript as a first-class ISC language

TypeScript appears in three distinct SailPoint surfaces — do not conflate them in conversation.

| Surface | Package / tool | Used for |
| --- | --- | --- |
| **ISC API SDK** | `sailpoint-api-client` (npm) | Calling ISC REST from Node/TS apps |
| **SaaS Connectivity** | `@sailpoint/connector-sdk` + `spcx` | Custom cloud connectors (and loopbacks) |
| **Connector customizers** | Customizer framework (TS) | Mutate before/after connector operations |

### Learning outcomes
- Scaffold a TS API project with SailPoint CLI.
- Call a V1 method with filters.
- Explain when you’d write a connector instead of an external script.

### Study
1. [TypeScript SDK](https://developer.sailpoint.com/docs/tools/sdk/typescript/)
2. [TS getting started](https://developer.sailpoint.com/docs/tools/sdk/typescript/getting-started) — note `listTransformsV1` pattern
3. [typescript-sdk](https://github.com/sailpoint-oss/typescript-sdk) / [template](https://github.com/sailpoint-oss/typescript-sdk-template)
4. CLI: `sail sdk init typescript my-project`, `sail sdk init config`
5. Migration: `migrationScript.js` for 1.x → 2.0 (`AccountsV2025Api` → `AccountsApi`, methods gain `V1`)

### Practice
1. **[Optional TENANT]** Init TS project; list identities or transforms.
2. **Offline:** Write a TypeScript module that:
   - Loads config from env (`SAIL_BASE_URL`, `SAIL_CLIENT_ID`, `SAIL_CLIENT_SECRET`) — document that laptop secrets should mirror keyring discipline
   - Exposes `disableIdentityByAlias(alias: string)` with clear steps and TODO for live calls
3. Compare that design to scenario 1’s REST style — same integration, different caller language.

### Conversational checkpoint
- “Show me how method versioning works in the TS SDK 2.x.”
- “API SDK vs Connector SDK — which for a nightly compliance job? Which for a new SaaS HR app with no OOTB connector?”

---

## Phase 5 — Other official SDKs and direct REST

### Learning outcomes
Choose among TypeScript, Python, Go, PowerShell, and raw REST — and know the CLI’s role.

| Approach | When |
| --- | --- |
| **TypeScript SDK** | Node services, SaaS connectors, modern web tooling |
| **Python SDK** | Automation scripts, data/ops, this workshop’s home turf |
| **Go / PowerShell** | Platform preference, Windows ops, compiled services |
| **Direct REST** | ITDR/SIEM/ServiceNow/webhooks — “integration spec” not a long-running SDK app |
| **SailPoint CLI** | Project init, config, connector workflows |

### Study
- Python: [docs](https://developer.sailpoint.com/docs/tools/sdk/python/) — prefer **2.x** for new work; this repo pins **1.4.x** for workshop compatibility
- [python-sdk-template](https://github.com/sailpoint-oss/python-sdk-template) + `migrate_sdk.py`
- [SailPoint CLI](https://developer.sailpoint.com/docs/tools/cli)
- Decision rule in `CLAUDE.md`: script-on-its-own → SDK; other-system-calls-ISC → REST

### Practice
1. Refactor one scenario’s “shape” into a REST OpenAPI-oriented call sheet (method, path, headers, body) for ServiceNow.
2. List what the Python migration script changes (namespaces → resource APIs + version suffixes).

### Conversational checkpoint
- “Should our ServiceNow team import the Python SDK?” *(Usually no — give them REST + PAT guidance.)*
- “What’s the migration story for each SDK?”

---

## Phase 6 — Extensibility map (beyond calling APIs)

Conversational developers know the *menu* of extension points.

| Mechanism | Code? | Typical use | Notes |
| --- | --- | --- | --- |
| **Transforms** | JSON config | Attribute calculate/map on aggregate/provision | Prefer over rules when possible |
| **Rules** | BeanShell (reviewed) | Logic transforms cannot express | SailPoint review/install constraints |
| **Workflows** | Low-code + HTTP actions | Event-driven process automation | Scan HTTP actions for legacy API versions (Workflow Analyzer) |
| **SaaS Connectivity** | **TypeScript** | Custom connectors in SailPoint cloud | Target reachable from cloud; `spcx` local debug |
| **Connector customizers** | **TypeScript** | Intercept SaaS connector I/O | More flexible than classic rules for SaaS sources |
| **External integrations** | Any language via API | ITDR, HR, SIEM, ticketing | This curriculum’s core |

### Study
- [Transforms](https://developer.sailpoint.com/docs/extensibility/transforms)
- [SaaS Connectivity / connector SDK](https://github.com/sailpoint-oss/sp-connector-sdk-js)
- Blog context: [ISC extensibility](https://developer.sailpoint.com/discuss/t/identity-security-cloud-extensibility-the-art-of-the-possible/38184)

### Conversational checkpoint
- “Transform or rule?”
- “Workflow HTTP action still on `/v2025/...` — what’s the risk?”
- “When is a loopback connector (ISC managing ISC via API) appropriate?”

---

## Phase 7 — Production craft

### Learning outcomes
Talk like someone who has shipped integrations.

### Topics
1. **Secrets:** PAT per integration; expiration; revoke on offboarding; keyring locally; vault in prod; never paste into AI tools.
2. **Idempotency & verify:** After mutations, GET and show before/after (`CLAUDE.md` standard).
3. **Pagination & bulk:** `limit`/`offset`/`count`; Search `searchAfter`; batch thoughtfully; respect 429.
4. **Object ID discipline:** Resolve by name every time — tenant GUIDs are not portable.
5. **Change management:** Prefer `/service/v1` pins; treat experimental as non-prod; watch `X-Deprecated: true`.
6. **Observability:** Log request IDs / correlation; name PATs for audit; monitor deprecation headers.
7. **Agentic development:** `CLAUDE.md` + local OpenAPI beats model memory — especially during the 2026 versioning transition.

### Practice
Write an ADR (one page): “Greenfield ISC integration standards for our team — July 2026.”

Include: auth, SDK choice, versioning, secret storage, dry-run flags, migration deadline.

---

## Phase 8 — Capstones & fluency drills

### Capstone A — Emergency disable (integration spec)
Deliver a language-agnostic REST call sheet + TypeScript sketch using **current** `/…/v1` paths. Compare to `scenario1`.

### Capstone B — Compliance bridge (SDK automation)
Design nightly: external CSV → rules → lifecycle / access request. Python or TS. Dry-run mode required.

### Capstone C — Peer access provisioner
Port scenario 3’s design to SDK 2.x method names (even if you cannot execute). Include approval-preserving narrative.

### Capstone D — Migration advisory
Given a fictional inventory (`v2024` scripts, `v2025` workflows, one `/latest` job), produce a migration plan citing Q2 2028 / Q1 2029 and script usage.

### Weekly fluency drill (15 minutes)
Pick three:
1. Explain yearly vs per-service to a manager.
2. Debug a fictional 403.
3. Name five filter operators with examples.
4. Sketch TS `listX V1` call from memory.
5. Argue transform vs rule vs workflow for a use case.
6. Map one legacy path → new path from memory or table.

---

## Suggested weekly schedule (part-time)

| Week | Modules |
| --- | --- |
| **1** | Phases 0–2 (domain + auth + versioning). Do not skip Phase 2. |
| **2** | Phase 3 domain APIs + start Phase 4 TypeScript |
| **3** | Finish 4–5; Phase 6 extensibility overview |
| **4** | Phase 7 + Capstones A–D; drill conversations |

---

## Using this repository as a classroom

| Asset | Role in curriculum |
| --- | --- |
| `docs/local-dev-environment.md` | Your sandboxed coding lab |
| `api-specs/idn/sailpoint-api.yaml` | **Current** per-service OpenAPI (`v1`) |
| `api-specs/idn/v2025`, `v2026` | Legacy yearly specs (still needed to read older code) |
| `src/scenario*.py` | Pattern library (REST vs SDK; dry-run; governance) |
| `CLAUDE.md` | Agent rules — update mental model with Phase 2 when generating **new** code |
| `docs/isc-development-guide.md` | Strong on auth/filters/PATCH; **reconcile versioning section with Phase 2** |
| `devdays2026.pdf` | Narrative “why API” context from DevDays 2026 |

**Important bias check:** Prefer teaching **per-service + SDK 2.x** for anything you invent going forward. Use yearly examples as literacy for existing code and this workshop, not as the default for greenfield.

---

## Conversational glossary (quick reference)

| Phrase you’ll hear | Meaning |
| --- | --- |
| “PAT” | Personal Access Token (OAuth client for scripts) |
| “VA” | Virtual Appliance (on-prem connectivity); contrast SaaS connectors |
| “OOTB connector” | Out-of-the-box source connector |
| “JML” | Joiner / Mover / Leaver |
| “SoD” | Segregation of Duties |
| “Experimental header” | `X-SailPoint-Experimental: true` |
| “Deprecation header” | `X-Deprecated: true` on responses |
| “Per-service v1” | Current URL style `/accounts/v1` |
| “Yearly v2026” | Legacy collection style `/v2026/accounts` |
| “SDK 2.0 / V1 suffix” | New client method naming (`listAccountsV1`) |
| “Integration spec” | Raw HTTP contract for another platform to call |
| “Loopback connector” | SaaS connector that drives ISC via its own API |

---

## Progress tracker

Copy and check off:

- [ ] Phase 0 — vocabulary & product story
- [ ] Phase 1 — auth/scopes/errors/keyring
- [ ] Phase 2 — versioning dual-world (July 2026)
- [ ] Phase 3 — domain API design fluency
- [ ] Phase 4 — TypeScript API SDK literacy
- [ ] Phase 5 — Python/Go/PS/REST/CLI choice
- [ ] Phase 6 — transforms/rules/workflows/connectors
- [ ] Phase 7 — production craft ADR
- [ ] Capstone A — emergency disable (current paths)
- [ ] Capstone B — compliance bridge design
- [ ] Capstone C — peer provisioner (2.x naming)
- [ ] Capstone D — migration advisory
- [ ] Can explain Q2 2028 / Q1 2029 legacy timeline without notes

---

## Maintenance

Re-validate this curriculum against:

1. [API versioning strategy](https://developer.sailpoint.com/docs/api/api-versioning-strategy)
2. [Migration guide](https://developer.sailpoint.com/docs/api/api-versioning-migration/)
3. `cd api-specs && git pull` (local specs; last pulled near **2026-07-31**)
4. SDK release notes on npm/PyPI (`sailpoint-api-client`, `sailpoint`)

When SailPoint announces the next major platform change, update the **Snapshot** table first — everything else hangs off that.
