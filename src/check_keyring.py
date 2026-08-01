"""
Keyring Check — Verify your ISC credentials are stored correctly.

Run this after setup_keyring.py. Does not call ISC — only reads the keychain.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from isc_credentials import KEYRING_SERVICE, get_credentials, CredentialsNotFoundError

print("Keyring Check")
print("=" * 40)

try:
    creds = get_credentials()
except CredentialsNotFoundError as exc:
    print(str(exc))
    sys.exit(1)

print(f"service:       {KEYRING_SERVICE}")
print(f"base_url:      {creds.base_url}")
print(f"client_id:     {creds.client_id}")
print(f"client_secret: SET ({len(creds.client_secret)} chars)")
print("\nAll credentials present. Ready for live ISC calls when you have network access.")
