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

---

## API Version Selection

SailPoint ISC has versioned APIs. Each version is supported for 3 years from its release year
(e.g., v2026 is supported through 2029).

**When asked about a specific endpoint or operation, read the relevant YAML files in `api-specs/idn/` before answering. Do not rely on training data for endpoint details — the specs are ground truth.**

**When identifying which API call to use:**

1. Check what version folders exist in `api-specs/idn/` — this reflects what is currently available
2. Start with the highest version folder present
3. Search for the endpoint there first
4. If the endpoint is not in the highest version, fall back to the next lower version and repeat
5. Avoid v3 — support ends Q1 2027, no new functionality
6. The version whose spec contains the endpoint is the version to import from in code

**On beta:** The `beta` folder in api-specs is legacy. New experimental features appear in versioned
APIs with an experimental flag — not in a separate beta branch.

**On `/latest`:** SailPoint introduced a `/latest` version alias in February 2026 that automatically
routes to the current annual version (`https://{tenant}.api.identitynow.com/latest/{endpoint}`).

- One-time or bulk scripts: use `/latest` unconditionally.
- Ongoing integrations: `/latest` is the right default. Treat each SailPoint annual release as a
  change event — review release notes and test the integration when a new version ships.
- Explicit versioning: appropriate only when there is a specific reason to pin (regulatory
  requirement, change-freeze environment). Pinning to an explicit version defers the same
  maintenance problem to a 3-year end-of-life cliff, it does not eliminate it.

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

This project pins `sailpoint>=1.4.2,<2.0.0` in `requirements.txt` (install via
`scripts/bootstrap_env.sh`). All API versions ship in one package. Import from the
versioned sub-module that matches where you found the endpoint in api-specs **and**
where the SDK exposes the API class (in 1.4.2, most identity/access APIs are under
`sailpoint.v2025`):

```python
from sailpoint.v2026.api.identities_api import IdentitiesApi   # version matches your api-specs lookup
from sailpoint.configuration import Configuration               # shared, version-agnostic
```

---

## Authentication

**Use PAT (Personal Access Token). Do not use OAuth client credentials for scripts.**

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
1. List the objects (e.g., `GET /v2026/identity-profiles/{profile-id}/lifecycle-states`)
2. Find the target by name
3. Extract the ID
4. Use the ID for the operation

Write helper functions that resolve by name so scripts work across tenants without modification.

---

## References

| What | Where |
|---|---|
| Endpoint definitions, parameters, required scopes | `api-specs/idn/` (local clone) |
| SDK method signatures | https://github.com/sailpoint-oss/python-sdk |
| ISC developer documentation | https://developer.sailpoint.com/docs/ |
| API reference | https://developer.sailpoint.com/docs/api/v2026 |
| Code samples | https://github.com/sailpoint-oss/code-samples |
