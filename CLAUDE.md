# SailPoint ISC Development Context

## What We're Building

Integrations against SailPoint Identity Security Cloud (ISC) using the REST API and Python SDK.
These are scripts and automations — not web applications.

---

## Project Structure

- `api-specs/` — cloned from https://github.com/sailpoint-oss/api-specs — run `git pull` to stay current
- `src/` — Python scripts for each scenario
- `src/isc_credentials.py` — shared python-keyring loader for SAIL_* env vars
- `.venv/` — local sandboxed virtualenv (see `scripts/bootstrap_env.sh`)
- `docs/isc-development-guide.md` — ISC development patterns and reference (read this for domain context)
- `docs/getting-started.md` — human setup guide (tenant + PAT)
- `docs/local-dev-environment.md` — offline/local agentic coding environment
- `docs/curriculum.md` — Path A conversational fluency curriculum
- `docs/curriculum/` — Path B senior implementation modules (M0–M20)
- `web/` — dual-path interactive learning app (Fluency | Implementation)
- `docs/listen-scripts/` — spoken Listen-mode scripts (Markdown; app loads these at build time)

---

## API Version Selection

As of July 2026, ISC uses **per-service semantic versioning**. Paths look like
`/identities/v1`, `/accounts/v1`, `/access-requests/v1`. Major versions bump only on breaking
contract changes. Yearly collections (`v2024` / `v2025` / `v2026`), `v3`, `beta`, and `/latest`
remain available as **legacy** until hard EOL.

**Legacy support / EOL:** Support tickets for Beta, V3, and yearly APIs through **Q2 2028**;
endpoints stop functioning **Q1 2029**.

**When asked about a specific endpoint or operation, read the relevant YAML files in `api-specs/idn/` before answering. Do not rely on training data for endpoint details — the specs are ground truth.**

**When identifying which API call to use:**

1. Prefer the current per-service collection: `api-specs/idn/sailpoint-api.yaml` (paths like `/accounts/v1`)
2. Confirm method, path, scopes, and any experimental header from that operation
3. Use legacy yearly folders (`api-specs/idn/v2025/`, `v2026/`, etc.) only when reading or migrating
   workshop / brownfield code that still calls `/v2025/...` or `/v2026/...`
4. Do not invent endpoints from training data; if the path is not in a checked-in spec, do not ship it
5. Pin greenfield work to explicit `/service/vN` — never treat yearly paths as the default for new code
6. Never hardcode outlier versions (e.g. assume every resource is `v1`). Verify in OpenAPI **and**
   the [migration path table](https://developer.sailpoint.com/docs/api/api-versioning-migration/).
   Local OpenAPI currently lists `/entitlements/v1`; `access-request-config` has both `v1` and `v2`.

**On beta:** The `beta` folder in api-specs is legacy. New experimental features appear in versioned
APIs with an experimental flag (`X-SailPoint-Experimental: true`) — not in a separate beta branch.

**On `/latest`:** Introduced early 2026 as a yearly-alias shortcut. Under the July 2026 strategy,
treat `/latest` as **unsafe for production** — it auto-routes and can break silently when routing
flips. Prefer explicit `/service/vN` pins for all new and ongoing integrations. Workshop samples may
still demonstrate yearly paths for patterns; treat those as teaching material, not a greenfield target.

---

## SDK vs. Direct API

Before writing any code, establish which approach applies:

| Use | Approach |
|---|---|
| Python script or automation that runs on its own | **Python SDK** — handles auth, retries, pagination, experimental headers automatically |
| Another system making REST calls (ITDR, SIEM, ServiceNow, webhook, Postman) | **Direct REST API** — raw HTTP calls, caller handles auth token and headers |

If it's not clear from context, ask: *"Is this code that will run on its own, or is this a call spec for another system to make?"*

---

## Python SDK

```bash
pip install sailpoint
```

**Workshop (this repo):** pins `sailpoint>=1.4.2,<2.0.0` in `requirements.txt` (install via
`scripts/bootstrap_env.sh`). Imports use year namespaces that match legacy yearly paths — useful for
learning patterns against existing scenarios:

```python
from sailpoint.v2025.api.identities_api import IdentitiesApi  # workshop 1.4.x literacy
from sailpoint.configuration import Configuration            # shared, version-agnostic
```

**Greenfield:** target Python `sailpoint` **2.x** with resource-based APIs and versioned method
suffixes (aligned with `/identities/v1` style paths), after confirming the operation in
`sailpoint-api.yaml`. Always resolve operations from specs — do not invent SDK methods from memory.

---

## Authentication

**Use a PAT (Personal Access Token) with the OAuth client_credentials grant for scripts.**
The PAT supplies client id/secret; you exchange them for a short-lived bearer token (~12 minutes).
Do not use a separate non-PAT OAuth application when the integration needs the PAT owner's user
level and scopes.

Credentials are stored in the OS keychain via `python-keyring` and loaded as environment variables
at runtime. `Configuration()` reads these automatically.

Keyring keys use lowercase names. Prefer the shared helper — do not deviate:

```python
from isc_credentials import load_credentials_into_env
from sailpoint.configuration import Configuration

load_credentials_into_env()
configuration = Configuration()
```

Equivalent manual pattern (same keyring service/keys):

```python
import keyring, os

os.environ["SAIL_BASE_URL"] = keyring.get_password("sailpoint", "base_url")
os.environ["SAIL_CLIENT_ID"] = keyring.get_password("sailpoint", "client_id")
os.environ["SAIL_CLIENT_SECRET"] = keyring.get_password("sailpoint", "client_secret")
```

To store credentials (one-time setup):

```bash
python src/setup_keyring.py
```

**Never hardcode credentials. Never ask the user for credentials in this session.**
**Never write secrets to .env or source files — OS keychain via python-keyring only.**

---

## Coding Standards for This Project

**Comments:** Include a docstring on every function covering what it does and the ISC
concept behind it. Inline comments on any call where the reasoning isn't self-evident
(e.g., why `defaultFilter=NONE`, why batching at 25).

**Verify after mutations:** After any state-changing call (lifecycle state change, account
disable, access request submission), follow up with a GET to confirm the change is
reflected. Show before and after state where possible.

---

## ISC Object IDs

Almost every ISC object is referenced by GUID, not by name — lifecycle states, roles, access
profiles, entitlements, sources, identity profiles, governance groups, and more. These IDs are
tenant-specific and will differ across environments.

**Never hardcode an object ID. Always resolve at runtime:**
1. List the objects (e.g., lifecycle states on the identity profile via the current per-service path)
2. Find the target by name
3. Extract the ID
4. Use the ID for the operation

Write helper functions that resolve by name so scripts work across tenants without modification.

---

## References

| What | Where |
|---|---|
| Endpoint definitions, parameters, required scopes | `api-specs/idn/` (local clone; prefer `sailpoint-api.yaml`) |
| SDK method signatures | https://github.com/sailpoint-oss/python-sdk |
| ISC developer documentation | https://developer.sailpoint.com/docs/ |
| API reference (current) | https://developer.sailpoint.com/docs/api/ |
| API versioning strategy | https://developer.sailpoint.com/docs/api/api-versioning-strategy |
| Migration path table | https://developer.sailpoint.com/docs/api/api-versioning-migration/ |
| Code samples | https://github.com/sailpoint-oss/code-samples |
