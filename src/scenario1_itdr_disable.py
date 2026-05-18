"""
Scenario 1: External System Triggers Identity Disable

The problem: An ITDR tool detected a compromised account. It needs to tell ISC
to act immediately — not wait for the next aggregation cycle. ISC doesn't have
a native listener for external security events. The API does.

This is not a scheduled Python script — it's the integration spec. The same
two API calls can be made from any tool: ServiceNow, a SIEM, a webhook,
or a custom integration. Raw HTTP, no SDK required.

Flow:
  1. Get a bearer token using PAT client credentials
  2. Look up the identity by their login alias
  3. Set lifecycle state to Terminated — ISC handles downstream provisioning
"""

import keyring
import os
import requests

os.environ["SAIL_BASE_URL"]      = keyring.get_password("sailpoint", "base_url")
os.environ["SAIL_CLIENT_ID"]     = keyring.get_password("sailpoint", "client_id")
os.environ["SAIL_CLIENT_SECRET"] = keyring.get_password("sailpoint", "client_secret")

BASE_URL      = os.environ["SAIL_BASE_URL"]
CLIENT_ID     = os.environ["SAIL_CLIENT_ID"]
CLIENT_SECRET = os.environ["SAIL_CLIENT_SECRET"]

# Lifecycle state IDs are tenant-specific — always resolve at runtime
# These were looked up via GET /v2026/identity-profiles/{id}/lifecycle-states
TERMINATED_LIFECYCLE_STATE_ID = "4dd1b45fef904386b329b3d907a87bee"


def get_token() -> str:
    """Exchange PAT credentials for a bearer token via client credentials grant."""
    resp = requests.post(
        f"{BASE_URL}/oauth/token",
        data={
            "grant_type":    "client_credentials",
            "client_id":     CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def get_identity_by_alias(token: str, alias: str) -> dict:
    """
    Look up an ISC identity by their login alias.

    defaultFilter=NONE ensures we find the identity even if it isn't
    correlated — important for ITDR use cases where the compromised
    account may not be fully onboarded.
    """
    resp = requests.get(
        f"{BASE_URL}/v2026/identities",
        headers={"Authorization": f"Bearer {token}"},
        params={
            "filters":       f'alias eq "{alias}"',
            "defaultFilter": "NONE",
        },
    )
    resp.raise_for_status()
    results = resp.json()
    if not results:
        raise ValueError(f"No identity found for alias '{alias}'")
    return results[0]


def set_lifecycle_state(token: str, identity_id: str, lifecycle_state_id: str) -> dict:
    """
    Move an identity to a new lifecycle state.

    Setting lifecycle state to Terminated tells ISC to disable all downstream
    accounts according to the provisioning rules configured for that state —
    AD, cloud apps, everything ISC manages. One call, full effect.
    """
    resp = requests.post(
        f"{BASE_URL}/v2026/identities/{identity_id}/set-lifecycle-state",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type":  "application/json",
        },
        json={"lifecycleStateId": lifecycle_state_id},
    )
    resp.raise_for_status()
    return resp.json()


# --- Demo ---

USERNAME = "Robert.Brown"

token    = get_token()
identity = get_identity_by_alias(token, USERNAME)

print(f"Found:            {identity['name']} (id: {identity['id']})")
print(f"Lifecycle state:  {identity['attributes']['cloudLifecycleState']}")

result = set_lifecycle_state(token, identity["id"], TERMINATED_LIFECYCLE_STATE_ID)
print(f"Action:           Terminated")
print(f"Activity ID:      {result.get('accountActivityId')}")
print(f"ISC is now disabling all downstream accounts for {identity['name']}.")
