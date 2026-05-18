"""
Keyring Setup — Store your ISC credentials securely.

Run this once. Credentials are saved to your OS keychain
(macOS Keychain, Windows Credential Manager, Linux Secret Service).
Nothing is written to disk or committed to source control.

You will need:
  - Your ISC tenant API URL  (e.g. https://your-tenant.api.identitynow.com)
  - PAT Client ID
  - PAT Client Secret

To generate a PAT: ISC → your name → Preferences → Personal Access Tokens
"""

import keyring
import getpass

print("ISC Credential Setup")
print("=" * 40)
print("Credentials will be stored in your OS keychain.\n")

base_url      = input("Tenant API URL (e.g. https://tenant.api.identitynow.com): ").strip()
client_id     = input("PAT Client ID: ").strip()
client_secret = getpass.getpass("PAT Client Secret (hidden): ").strip()

keyring.set_password("sailpoint", "base_url",      base_url)
keyring.set_password("sailpoint", "client_id",     client_id)
keyring.set_password("sailpoint", "client_secret", client_secret)

print("\nCredentials stored. Run check_keyring.py to verify.")
