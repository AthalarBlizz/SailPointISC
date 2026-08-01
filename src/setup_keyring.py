"""
Keyring Setup — Store your ISC credentials securely.

Run this once when you have a tenant PAT. Credentials are saved to your OS
keychain (macOS Keychain on this machine). Nothing is written to disk or
committed to source control.

You will need:
  - Your ISC tenant API URL  (e.g. https://your-tenant.api.identitynow.com)
  - PAT Client ID
  - PAT Client Secret

To generate a PAT: ISC → your name → Preferences → Personal Access Tokens

Without a tenant you can skip this — agentic coding against api-specs still works.
"""

import getpass
import sys
from pathlib import Path

import keyring

# Allow running as `python src/setup_keyring.py` from repo root
sys.path.insert(0, str(Path(__file__).resolve().parent))
from isc_credentials import KEYRING_SERVICE  # noqa: E402

print("ISC Credential Setup")
print("=" * 40)
print("Credentials will be stored in your OS keychain via python-keyring.")
print(f"Service name: {KEYRING_SERVICE}\n")

base_url = input("Tenant API URL (e.g. https://tenant.api.identitynow.com): ").strip()
client_id = input("PAT Client ID: ").strip()
client_secret = getpass.getpass("PAT Client Secret (hidden): ").strip()

if not base_url or not client_id or not client_secret:
    print("All three values are required. Aborted.")
    sys.exit(1)

if not base_url.startswith("https://") or ".api." not in base_url:
    print(
        "\nWarning: API URL usually looks like "
        "https://{tenant}.api.identitynow.com (not the UI hostname)."
    )

keyring.set_password(KEYRING_SERVICE, "base_url", base_url)
keyring.set_password(KEYRING_SERVICE, "client_id", client_id)
keyring.set_password(KEYRING_SERVICE, "client_secret", client_secret)

print("\nCredentials stored. Run: python src/check_keyring.py")
