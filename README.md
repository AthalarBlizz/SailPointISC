# When There's No Button for That
## AI-Assisted ISC API Development — SailPoint DevDays 2026

The SailPoint ISC UI covers the common cases. When your requirement falls outside that boundary —
an ITDR tool that needs to act in seconds, a compliance engine reading an external credentialing
system, a manager asking to give the new hire what their peer already has — the answer is the API.

This repository demonstrates how to use Claude Code alongside the ISC REST API and Python SDK to
build those integrations quickly and correctly. The material was presented live at SailPoint
DevDays 2026.

The slides are in [`devdays2026.pdf`](devdays2026.pdf).

---

## What's in This Repository

```
src/                          Python scripts for each scenario
web/                          Interactive curriculum learning app (GitHub Pages)
docs/
  getting-started.md          Setup guide — start here (needs an ISC tenant)
  local-dev-environment.md    Local sandboxed coding env (no tenant required)
  curriculum.md               Training path (editorial source; current as of 2026-07-31)
  isc-development-guide.md    Technical reference for API/SDK development
scripts/bootstrap_env.sh      Create .venv, install deps, clone api-specs
requirements.txt              sailpoint SDK + keyring + requests
CLAUDE.md                     Project context file for Claude Code / Cursor
```

## Local development (no tenant required)

For agentic coding on your Mac without a SailPoint environment:

```bash
./scripts/bootstrap_env.sh
source .venv/bin/activate
python src/env_status.py
```

Secrets use **python-keyring** (macOS Keychain) when you later have a PAT — see
[`docs/local-dev-environment.md`](docs/local-dev-environment.md).

## Training curriculum (web app)

Interactive dual-path reader (Fluency + Senior Implementation):

```bash
cd web
npm install
npm run dev
```

- **Path A (Fluency):** [`docs/curriculum.md`](docs/curriculum.md)
- **Path B (Implementation):** [`docs/curriculum/`](docs/curriculum/)
- App docs: [`web/README.md`](web/README.md)
- **GitHub Pages:** `https://athalarblizz.github.io/SailPointISC/`

---

## The Three Scenarios

### Scenario 1 — External System Triggers Identity Disable
**`src/scenario1_itdr_disable.py`**

An ITDR tool detects a compromised account and needs ISC to act immediately — not wait for the
next aggregation cycle. Two direct REST calls: look up the identity by alias, set lifecycle state
to Terminated. ISC handles all downstream provisioning from there.

This is the integration spec pattern: the same calls work from ServiceNow, a SIEM, a webhook,
or any tool that can make HTTP requests.

### Scenario 2 — Training Compliance Automation
**`src/scenario2_training_compliance.py`**

Clinical staff must hold current ALS/PALS certifications to work. Certification records live in
an external credentialing system. This nightly script reads that export, applies department rules
(Emergency and Pediatrics require both; all others ALS only), and takes action through the SDK:
expiring certs trigger enrollment requests, lapsed certs set the identity to LeaveOfAbsence,
completed renewals restore Active status.

### Scenario 3 — Peer-Based Access Provisioning
**`src/scenario3_clone_peer_access.py`**

"Just give the new person what their peer has." ISC has no native provisioning-by-example.
This script pulls all roles and entitlements from a peer identity, shows a dry run for review,
then submits proper ISC access requests that still flow through normal approval workflows.

```bash
# Dry run — shows what would be requested, submits nothing
python3 src/scenario3_clone_peer_access.py --peer "Jennifer.Thomas" --new "Cynthia.Cook"

# Live — submits access requests
python3 src/scenario3_clone_peer_access.py --peer "Jennifer.Thomas" --new "Cynthia.Cook" --submit
```

---

## Getting Started

See **[`docs/getting-started.md`](docs/getting-started.md)** for:
- Python and dependency setup
- Creating and storing a Personal Access Token
- Cloning the SailPoint API specs
- Testing your connection

The **[`docs/isc-development-guide.md`](docs/isc-development-guide.md)** is the technical
reference covering authentication, API versioning, SDK patterns, pagination, filtering, and more.
It is written as a Claude-facing reference but is useful as standalone documentation.

---

## Using Claude Code for ISC Development

The `CLAUDE.md` file at the project root configures Claude Code with ISC-specific context:
version selection logic, SDK vs. direct REST guidance, auth patterns, and coding standards.
With this file in place, Claude can read the local API specs and give accurate, specific answers
rather than guessing from training data.

This is the core point of the presentation: the CLAUDE.md + api-specs combination is what
separates a useful answer from a generic one.
