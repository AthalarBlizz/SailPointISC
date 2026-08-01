"""
Clear ISC credentials from the OS keychain.

Use when rotating a PAT, ending a project, or resetting local setup.
Nothing is written to disk — only keyring entries for service "sailpoint"
are removed.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from isc_credentials import KEYRING_KEYS, KEYRING_SERVICE, clear_credentials, credentials_present

if not credentials_present():
    print(f"No credentials found for keyring service '{KEYRING_SERVICE}'. Nothing to clear.")
    sys.exit(0)

confirm = input(
    f"Delete keyring entries {', '.join(KEYRING_KEYS)} under '{KEYRING_SERVICE}'? [y/N]: "
).strip().lower()
if confirm != "y":
    print("Aborted.")
    sys.exit(0)

clear_credentials()
print("Credentials cleared from OS keychain.")
