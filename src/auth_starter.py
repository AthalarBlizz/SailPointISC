"""
Authentication Starter — Two Patterns

Use this as your starting point for any ISC integration.

PATTERN 1 — Python SDK
  Use when: writing a Python script or automation that runs on its own.
  The SDK handles token acquisition, refresh, retries, and pagination automatically.

PATTERN 2 — Direct REST
  Use when: another system needs to make the API call (SIEM, ServiceNow, webhook, Postman).
  Raw HTTP — works in any language or tool.

One-time setup (store credentials in your OS keychain):
  python3 -c "
  import keyring
  keyring.set_password('sailpoint', 'base_url',      'https://your-tenant.api.identitynow.com')
  keyring.set_password('sailpoint', 'client_id',     'your-client-id')
  keyring.set_password('sailpoint', 'client_secret', 'your-client-secret')
  "
"""

import keyring
import os
import requests

# Load credentials from OS keychain — never hardcode these
os.environ["SAIL_BASE_URL"]      = keyring.get_password("sailpoint", "base_url")
os.environ["SAIL_CLIENT_ID"]     = keyring.get_password("sailpoint", "client_id")
os.environ["SAIL_CLIENT_SECRET"] = keyring.get_password("sailpoint", "client_secret")


# =============================================================================
# PATTERN 1: Python SDK
# =============================================================================

from sailpoint.v2025.api.identities_api import IdentitiesApi
from sailpoint.v2025.api_client import ApiClient
from sailpoint.configuration import Configuration

def sdk_example():
    """SDK handles auth automatically — just create a Configuration and go."""
    configuration = Configuration()  # reads SAIL_* env vars

    with ApiClient(configuration) as client:
        identities = IdentitiesApi(client).list_identities(limit=3)
        for identity in identities:
            print(f"[SDK] {identity.name}")


# =============================================================================
# PATTERN 2: Direct REST
# =============================================================================

def get_token() -> str:
    """Exchange PAT credentials for a bearer token (client credentials grant)."""
    resp = requests.post(
        f"{os.environ['SAIL_BASE_URL']}/oauth/token",
        data={
            "grant_type":    "client_credentials",
            "client_id":     os.environ["SAIL_CLIENT_ID"],
            "client_secret": os.environ["SAIL_CLIENT_SECRET"],
        },
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def rest_example():
    """Direct REST — get a token once, reuse it for all calls in the session."""
    token   = get_token()
    headers = {"Authorization": f"Bearer {token}"}

    resp = requests.get(
        f"{os.environ['SAIL_BASE_URL']}/v2025/identities",
        headers=headers,
        params={"limit": 3},
    )
    resp.raise_for_status()
    for identity in resp.json():
        print(f"[REST] {identity['name']}")


# =============================================================================
# Run both
# =============================================================================

if __name__ == "__main__":
    print("--- SDK ---")
    sdk_example()

    print("\n--- Direct REST ---")
    rest_example()
