# ISC API Development Guide
## Technical Reference for AI-Assisted Development

This document is a Claude-facing technical reference. Read it when writing or reviewing
code that uses the SailPoint ISC REST API or Python SDK.

---

## API Base URL

```
https://{tenant}.api.identitynow.com
```

The tenant name is the org name from the ISC Admin > Dashboard > Overview > Org Details.
This is different from the UI URL (`{tenant}.identitynow.com`) — the API uses `.api.identitynow.com`.

Demo tenant pattern: `https://{tenant}.api.identitynow-demo.com`

---

## Authentication

ISC uses OAuth 2.0. All scripts and automations use the **client credentials grant flow** with
a **Personal Access Token (PAT)**. Do not use authorization code flow for scripts.

### How it works

1. PAT has a `client_id` and `client_secret`
2. Exchange them for a short-lived JWT `access_token`:

```bash
POST https://{tenant}.api.identitynow.com/oauth/token
  ?grant_type=client_credentials
  &client_id={client_id}
  &client_secret={client_secret}
```

3. Pass the `access_token` as a Bearer token on every request:

```
Authorization: Bearer {access_token}
```

Access tokens expire in approximately 12 minutes (`expires_in` in the response).
The Python SDK handles token acquisition and refresh automatically.

### Getting a token for direct REST calls (Python)

When writing raw REST calls rather than using the SDK, get the token first:

```python
import keyring, os, requests

os.environ["SAIL_BASE_URL"]      = keyring.get_password("sailpoint", "base_url")
os.environ["SAIL_CLIENT_ID"]     = keyring.get_password("sailpoint", "client_id")
os.environ["SAIL_CLIENT_SECRET"] = keyring.get_password("sailpoint", "client_secret")

def get_token() -> str:
    resp = requests.post(
        f"{os.environ['SAIL_BASE_URL']}/oauth/token",
        data={
            "grant_type":    "client_credentials",
            "client_id":     os.environ["SAIL_CLIENT_ID"],
            "client_secret": os.environ["SAIL_CLIENT_SECRET"],
        }
    )
    resp.raise_for_status()
    return resp.json()["access_token"]

token = get_token()

# All subsequent calls use:
headers = {"Authorization": f"Bearer {token}"}
```

The token is short-lived — get it once at the start of the script, not on every call.

### PAT limits and best practices

- Limit PATs per user — delete unused tokens
- Client ID format for modern OAuth clients uses dashes: `b61429f5-203d-494c-94c3-04f54e17bc5c`
  Legacy client IDs (no dashes, e.g. `G6xLlBBOKIcOAQuK`) will not work
- Create a separate PAT per integration — ISC audit logs show the token name
- Set an expiration date on every PAT
- Generate a PAT in ISC: Preferences > Personal Access Tokens > New Token

---

## Authorization: Scopes and User Levels

Authorization has two layers:

**User level** — a broad permission boundary set on the user who generated the PAT.
User levels include ORG_ADMIN, ROLE_ADMIN, SOURCE_ADMIN, CERT_ADMIN, etc.
If an API requires ORG_ADMIN and the PAT owner is CERT_ADMIN, the call will return 403.

**Scopes** — granular permissions applied to the PAT itself.

| Scope | Meaning |
|---|---|
| `sp:scopes:default` | Minimal — only public endpoints (default if no scope specified) |
| `sp:scopes:all` | Everything the user level permits |
| `idn:access-request:manage` | Example specific scope — read/write access requests |
| `idn:access-profile:read` | Example specific scope — read-only access profiles |

Scopes ending in `:read` are read-only. Scopes ending in `:manage` allow read, modify, delete.

**To find the required scope for an endpoint:** check the API specification in api-specs — each
endpoint lists its required scopes. For quick work, `sp:scopes:all` covers everything the
user level permits.

### Common errors

| Code | Meaning |
|---|---|
| 401 | Missing or expired access token |
| 403 | Valid token but missing scope, wrong user level, or endpoint requires user context that CLIENT_CREDENTIALS grant doesn't provide |
| 429 | Rate limit — 100 requests per access_token per 10 seconds |

---

## API Versioning

### Version selection

SailPoint releases a new API version each year named by year (v2024, v2025, v2026...).
Each version is supported for 3 years from its release year.
After support ends, versions remain operational for an additional 2-year transition period.

**To find which version to use:**
1. Check what version folders exist in `api-specs/idn/` — use the highest available
2. Search for the endpoint in that version first
3. If not found, fall back to the next lower version
4. Avoid v3 — supported only until Q1 2027, no new functionality

Only the current year's version receives new functionality. Earlier versions get
non-deprecated endpoints carried forward but nothing new.

### Experimental APIs

Some endpoints within a versioned API are marked **Experimental** and require an opt-in header:

```
X-SailPoint-Experimental: true
```

**Python SDK:** The SDK handles this automatically. Experimental methods include
`x_sail_point_experimental` as a parameter with a default of `'true'` — just call the
method normally and the header is sent.

**Raw REST calls:** You must add the header manually:
```
X-SailPoint-Experimental: true
```

Without this header on a raw call, experimental endpoints return an error. Experimental
APIs may have breaking changes with little notice — treat them as unstable in production.

### URL patterns by version

```
https://{tenant}.api.identitynow.com/v2026/{endpoint}
https://{tenant}.api.identitynow.com/v2025/{endpoint}
https://{tenant}.api.identitynow.com/v3/{endpoint}       ← avoid for new work
https://{tenant}.api.identitynow.com/latest/{endpoint}   ← see /latest below
```

### The `/latest` version alias

Announced February 2026. `/latest` routes to the current annual version without requiring you to
specify a year — when SailPoint releases v2027, `/latest` will automatically resolve there.

```
https://{tenant}.api.identitynow.com/latest/accounts
https://{tenant}.api.identitynow.com/latest/identities
```

To see which version a `/latest` call actually resolved to, check the response header:

```
X-SailPoint-Route-Version: v2026
```

**Experimental endpoints and `/latest`:** Experimental endpoints are excluded from automatic
routing. If an endpoint only exists in experimental form, `/latest` routes to the latest
experimental version of it — but you still must send the `X-SailPoint-Experimental: true` header.

**When to use `/latest`:**

*One-time or bulk scripts* — use `/latest` unconditionally. The script runs and is done; version
drift is irrelevant.

*Ongoing integrations* — `/latest` is the right default and lowers the barrier to getting started.
The trade-off: when SailPoint releases a new annual version, `/latest` flips automatically. If a
function that only existed in an older version has breaking changes in the new version, your
integration will see them without a code change triggering the review. Treat each SailPoint annual
release as a change event: review the release notes, test the integration. This is the same
discipline you'd apply to any upstream dependency releasing a major version.

*Why not just pin to an explicit version?* Pinning feels safer but defers the same problem to a
3-year cliff. When the pinned version reaches end of life, you face a forced rewrite — often
against a deadline, often by someone who didn't write the original code. `/latest` keeps you
current continuously instead of accumulating that debt.

**When explicit versioning is appropriate:**
- You have a specific reason to pin (regulatory audit trail, change-freeze environment)
- A dependent system requires a known stable interface and cannot tolerate any behavioral change

---

## Python SDK

### Setup

```python
import keyring, os
from sailpoint.configuration import Configuration

os.environ["SAIL_BASE_URL"]      = keyring.get_password("sailpoint", "base_url")
os.environ["SAIL_CLIENT_ID"]     = keyring.get_password("sailpoint", "client_id")
os.environ["SAIL_CLIENT_SECRET"] = keyring.get_password("sailpoint", "client_secret")

configuration = Configuration()  # reads SAIL_* env vars automatically
```

### Import pattern

Import from the versioned sub-module that matches where you found the endpoint in api-specs:

```python
import sailpoint.v2026
from sailpoint.v2026.api_client import ApiClient
from sailpoint.configuration import Configuration  # version-agnostic, always from here
```

Or import specific API classes directly:

```python
from sailpoint.v2026.api.identities_api import IdentitiesApi
from sailpoint.v2026.api.accounts_api import AccountsApi
from sailpoint.v2025.api.access_requests_api import AccessRequestsApi  # if only in v2025
```

### Basic usage

```python
with ApiClient(configuration) as client:
    api = IdentitiesApi(client)
    identities = api.list_identities(limit=10, filters='name sw "John"')
```

The SDK handles OAuth token acquisition and refresh automatically.

Filter syntax and collection parameters are passed directly as method keyword arguments —
same operators as the REST API (`eq`, `sw`, `co`, `gt`, etc.).

### Method variants

Every SDK method has two versions:
- `list_identities()` — returns the response object only
- `list_identities_with_http_info()` — returns response + HTTP status + headers

Use the `_with_http_info()` variant when you need to check the `X-Total-Count` header
or inspect the response status code.

### Pagination

Use the built-in `Paginator` to fetch more than 250 records:

```python
from sailpoint.paginator import Paginator
import sailpoint.v2026

with ApiClient(configuration) as client:
    accounts = Paginator.paginate(
        sailpoint.v2026.AccountsApi(client).list_accounts,
        result_limit=1000,  # total records to return
        limit=250           # page size
    )
```

`result_limit` = total records you want. `limit` = records per page (max 250).
Add `offset=N` to start from a specific record.

### Retries

```python
import urllib3

configuration.retries = urllib3.Retry(total=5, status_forcelist=[502, 503, 504])
```

Set this before creating the ApiClient. Retries on 502/503/504 (gateway errors) — not on
4xx (client errors, which indicate a code problem).

### Error handling

```python
from sailpoint.v2026.exceptions import BadRequestException, UnauthorizedException, ServiceException

try:
    result = api.list_identities(filters='invalid syntax')
except BadRequestException as e:
    print(f"Bad request (400): {e}")
except UnauthorizedException as e:
    print(f"Unauthorized (401): {e}")
except ServiceException as e:
    print(f"Server error (5xx): {e}")
```

Exception classes live in the versioned module — use `sailpoint.v2026.exceptions`,
`sailpoint.v2025.exceptions`, etc. matching the version you imported.

### PATCH operations in the SDK

PATCH uses SDK model classes — not raw dicts:

```python
from sailpoint.v2026.models.json_patch_operation import JsonPatchOperation
from sailpoint.v2026.models.json_patch_operation_value import JsonPatchOperationValue

patch = [
    JsonPatchOperation(
        op='replace',
        path='/description',
        value=JsonPatchOperationValue('New description')
    )
]
api.patch_identity(identity_id, json_patch_operation=patch)
```

### SDK Reference docs

The SDK reference is organized by API class with methods and models. The v2025 reference
is comprehensive (98 API classes); the v2026 reference docs are not yet complete — use
v2025 reference to look up method signatures and model shapes, then import from v2026
in code if the endpoint exists there.

- V2025 reference (use this for lookups): https://developer.sailpoint.com/docs/tools/sdk/python/reference/v2025/
- V2026 reference (incomplete): https://developer.sailpoint.com/docs/tools/sdk/python/reference/v2026/

---

## Collection Parameters (Pagination, Filtering, Sorting)

All GET collection endpoints (plural noun URL, returns array) support these parameters:

### Pagination

| Parameter | Default | Max | Description |
|---|---|---|---|
| `limit` | 250 | 250 (10000 for search) | Records per page |
| `offset` | 0 | — | 0-based starting record |
| `count` | false | — | Return total count in `X-Total-Count` header |

### Filtering

Use the `filters` query parameter. Syntax:

```
filters=field operator "value"
```

| Operator | Description |
|---|---|
| `eq` | equals |
| `ne` | not equals |
| `co` | contains (strings) |
| `sw` | starts with (strings) |
| `gt` / `lt` / `ge` / `le` | comparisons |
| `pr` | field is present (not null) |
| `isnull` | field is null |
| `in` | value in list: `field in ("a","b")` |
| `and` / `or` / `not` | composite operators |

Examples:
```
filters=name eq "John Doe"
filters=firstname sw "john" and status eq "ACTIVE"
filters=created gt 2025-01-01T00:00:00Z
```

### Sorting

```
sorters=fieldName          # ascending
sorters=-fieldName         # descending
sorters=type,-modified     # primary ascending, secondary descending
```

### Search pagination past 10,000 records

For the Search API, use `searchAfter` with a `sort` field to page past the 10,000 limit:

```json
{
  "indices": ["identities"],
  "query": { "query": "*" },
  "sort": ["id"],
  "searchAfter": ["last-id-from-previous-page"]
}
```

---

## PATCH Requests

PATCH uses JSON Patch format (RFC 6902) — an array of operation objects.
Content-Type must be `application/json-patch+json`.

```json
[
  { "op": "replace", "path": "/description", "value": "new value" },
  { "op": "add",     "path": "/attributes/-", "value": { ... } },
  { "op": "remove",  "path": "/features/0" }
]
```

### Operations

| Op | Description |
|---|---|
| `replace` | Replace value at path (path must exist) |
| `add` | Add value; use `-` at end of array path to append |
| `remove` | Remove value at path (path must exist) |
| `move` | Remove from `from`, add to `path` |
| `copy` | Copy from `from` to `path` |
| `test` | Assert value at path equals expected (used for conditional patches) |

Array indexing: `0` = first element, `-` = append to end.

---

## Key References

| Resource | URL |
|---|---|
| Developer docs | https://developer.sailpoint.com/docs/ |
| API reference (v2026) | https://developer.sailpoint.com/docs/api/v2026 |
| Versioning strategy | https://developer.sailpoint.com/docs/api/api-versioning-strategy |
| Authentication guide | https://developer.sailpoint.com/docs/api/authentication |
| Standard collection params | https://developer.sailpoint.com/docs/api/standard-collection-parameters |
| Python SDK source | https://github.com/sailpoint-oss/python-sdk |
| API specs (local) | `api-specs/idn/` |
| Code samples | https://github.com/sailpoint-oss/code-samples |
