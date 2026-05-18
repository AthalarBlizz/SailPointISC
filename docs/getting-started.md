# Getting Started
## When There's No Button for That — DevDays 2026

**GitHub:** https://github.com/agutschow/2026DeveloperDays

---

## Prerequisites

- Python 3.10 or higher (`python --version` to verify)
- Git (`git --version` to verify)
  - **Mac:** `xcode-select --install` or download from https://git-scm.com
  - **Windows:** Download from https://git-scm.com — installs Git Bash too
  - **Linux:** `sudo apt install git` or `sudo yum install git`
- SailPoint ISC tenant with admin access
- A Personal Access Token (PAT)

---

## Step 1: Install Dependencies

```bash
pip install sailpoint keyring
```

That's the minimal install for everything in this session. `requests` is only needed if you are making direct REST calls rather than using the SDK — it may already be on your machine.

The official SDK documentation covers additional setup options including the SailPoint CLI path and project scaffolding. Our approach here is intentionally minimal.

- SDK documentation: https://developer.sailpoint.com/docs/tools/sdk/python

---

## Step 2: Create a Personal Access Token in ISC

1. Log into your ISC tenant
2. Click your name in the top-right corner > **Preferences**
3. Select **Personal Access Tokens**
4. Click **New Token**
5. Give it a descriptive name (e.g., "DevDays Demo")
6. Set an expiration date — do not leave tokens open-ended
7. Select the scopes your integration needs — request only what you need
8. Click **Create Token**
9. **Copy the Client ID and Client Secret immediately** — ISC will not show the secret again

---

## Step 3: Store Your Credentials Securely

`python-keyring` stores credentials in your OS keystore — macOS Keychain, Windows Credential Manager, or Linux Secret Service. Nothing is written to disk.

Run the setup script from the project repo — it will prompt you for each value:

```bash
python3 src/setup_keyring.py
```

Then verify everything was stored correctly:

```bash
python3 src/check_keyring.py
```

**Note on tenant URL format:** The API base URL is different from the UI URL.
- UI URL: `https://your-tenant.identitynow.com`
- API URL: `https://your-tenant.api.identitynow.com`

For non-standard domains (e.g., demo tenants):
- UI URL: `https://your-tenant.identitynow-demo.com`
- API URL: `https://your-tenant.api.identitynow-demo.com`

---

## Step 4: Configure the SDK

The SailPoint SDK reads from environment variables `SAIL_BASE_URL`, `SAIL_CLIENT_ID`, and `SAIL_CLIENT_SECRET`. Load from keyring at runtime:

```python
import keyring
import os
from sailpoint.configuration import Configuration

os.environ["SAIL_BASE_URL"] = keyring.get_password("sailpoint", "base_url")
os.environ["SAIL_CLIENT_ID"] = keyring.get_password("sailpoint", "client_id")
os.environ["SAIL_CLIENT_SECRET"] = keyring.get_password("sailpoint", "client_secret")

configuration = Configuration()
```

---

## Step 5: Test Your Connection

Run the auth starter script — it tests both the SDK and direct REST patterns against your tenant:

```bash
python3 src/auth_starter.py
```

If identity names print under both `--- SDK ---` and `--- Direct REST ---`, you are connected and ready.

---

## Security Best Practices

- **Never put credentials in your code** — always load from keyring or a secrets vault
- **Never commit credentials to source control** — add `.env` to `.gitignore` if you use one
- **Create a separate token for each integration** — ISC audit logs show the token name, so you can trace exactly what called what
- **Set an expiration date on every token** — do not let tokens live forever
- **Revoke tokens immediately** when a project ends or a team member leaves
- **Scope to least privilege** — request only the API scopes your integration actually needs
- **Never paste your token into an AI tool** — the AI writes code with placeholders and does not need your real credentials
- **For production:** use your organization's secrets management platform (AWS Secrets Manager, Azure Key Vault, CyberArk, or equivalent)

---

## Step 6: Clone the SailPoint API Specs

SailPoint maintains an open source GitHub organization with API specs, SDKs, the CLI, the
developer documentation site, code samples, and more. The full catalog is at
https://github.com/sailpoint-oss — worth exploring for your use case.

For this session, the one repo you need is **api-specs** — endpoint definitions for every ISC
API, including parameters, required scopes, and response shapes. This is what lets Claude give
accurate, specific answers instead of guessing.

Clone the specs into your project folder:

```bash
cd your-project-folder
```

### Recommended: download only what you need (saves space)

The full api-specs repo is ~480 MB across all versions. These commands download only
v2026, v2025, and beta — the versions you'll actually use — at roughly 5–10 MB.
Git supports downloading only specific folders from a repo; that's all this does.

```bash
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/sailpoint-oss/api-specs.git
cd api-specs
git sparse-checkout set idn/v2026 idn/v2025 idn/beta
cd ..
```

### Alternative: download everything

If you want all versions or prefer to keep it simple:

```bash
git clone https://github.com/sailpoint-oss/api-specs.git
```

### Keep the specs current

SailPoint updates api-specs with each ISC release. Pull before starting work on a new
integration:

```bash
cd api-specs
git pull
cd ..
```

Your project folder should now look like this:

```
your-project/
├── CLAUDE.md
├── api-specs/
│   └── idn/
│       ├── v2026/
│       ├── v2025/
│       └── beta/
├── src/
└── docs/
```
