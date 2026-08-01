# Local development environment
# ==============================
#
# Agentic ISC coding on this machine — no SailPoint tenant required.
# Secrets (when you have a PAT) live only in macOS Keychain via python-keyring.

## What "sandboxed" means here

1. **Python virtualenv (`.venv/`)** — packages are isolated from system Python
2. **No secrets on disk** — PAT values go in Keychain (`keyring`), never `.env` or source
3. **api-specs as read-only ground truth** — cloned locally; agents read YAML, not invent endpoints
4. **Offline-first** — write and review integrations without calling ISC

This is not a SailPoint sandbox tenant. It is a local coding sandbox for building
API integrations with Cursor Agent mode.

## One-time bootstrap

```bash
cd /Users/nate/Documents/GitHub/2026DeveloperDays
chmod +x scripts/bootstrap_env.sh
./scripts/bootstrap_env.sh
```

That creates `.venv`, installs `sailpoint` + `keyring` + `requests`, and sparse-clones
`api-specs/idn/{v2026,v2025,beta}`.

## Daily use

```bash
source .venv/bin/activate
python src/env_status.py
```

Always activate the venv before running scripts or asking the agent to execute code.

**SDK note:** `requirements.txt` pins `sailpoint>=1.4.2,<2.0.0` so imports match this
repo (`sailpoint.v2025...`). In 1.4.2, most identity/access APIs live under **v2025**;
`v2026` in the package is partial. Endpoint *existence* still comes from `api-specs/` —
import from the versioned SDK module that actually contains the API class.

## Secrets (python-keyring)

| Action | Command |
|--------|---------|
| Store PAT (when you have a tenant) | `python src/setup_keyring.py` |
| Verify stored entries | `python src/check_keyring.py` |
| Remove entries | `python src/clear_keyring.py` |

Shared loader for new scripts:

```python
from isc_credentials import load_credentials_into_env
from sailpoint.configuration import Configuration

load_credentials_into_env()
configuration = Configuration()
```

Never paste Client Secret into chat. Never commit credentials.

## How to learn with Agent mode

Follow [`curriculum.md`](curriculum.md) (**Path A — Fluency**) or [`curriculum/`](curriculum/) (**Path B — Implementation**), or run the interactive app (path switcher on first launch):

```bash
cd web && npm install && npm run dev
```

1. Keep `CLAUDE.md` in the project (already present) — it steers the agent
2. Point the agent at `api-specs/idn/` for endpoint truth — prefer `sailpoint-api.yaml` (per-service `v1`) for new work; use `v2025`/`v2026` folders when reading legacy examples
3. Prefer new scripts under `src/` that use `isc_credentials.py`
4. Resolve ISC object IDs by name at runtime — do not copy demo GUIDs from scenarios
5. Choose SDK (standalone script) vs direct REST (other system calling ISC) first

## Layout after bootstrap

```
.
├── .venv/                 # sandboxed Python packages (gitignored)
├── api-specs/idn/         # OpenAPI ground truth (gitignored)
├── requirements.txt
├── scripts/bootstrap_env.sh
├── docs/
│   ├── getting-started.md
│   ├── isc-development-guide.md
│   └── local-dev-environment.md   ← this file
├── src/
│   ├── isc_credentials.py         # keyring helper
│   ├── env_status.py
│   ├── setup_keyring.py
│   ├── check_keyring.py
│   ├── clear_keyring.py
│   ├── auth_starter.py            # needs live tenant
│   └── scenario*.py               # workshop examples
└── CLAUDE.md
```

## When you get a tenant later

1. `python src/setup_keyring.py`
2. `python src/check_keyring.py`
3. `python src/auth_starter.py` — smoke test SDK + REST
