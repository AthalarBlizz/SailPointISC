"""
Keyring Check — Verify your ISC credentials are stored correctly.

Run this after setup_keyring.py to confirm everything is in place
before running any other scripts.
"""

import keyring

base_url      = keyring.get_password("sailpoint", "base_url")
client_id     = keyring.get_password("sailpoint", "client_id")
client_secret = keyring.get_password("sailpoint", "client_secret")

print("Keyring Check")
print("=" * 40)
print(f"base_url:      {base_url or 'NOT SET'}")
print(f"client_id:     {client_id or 'NOT SET'}")
print(f"client_secret: {'SET' if client_secret else 'NOT SET'}")

if all([base_url, client_id, client_secret]):
    print("\nAll credentials present. Ready to run scripts.")
else:
    print("\nMissing credentials — run setup_keyring.py first.")
