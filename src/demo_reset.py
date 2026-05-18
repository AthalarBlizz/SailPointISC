"""
Demo Reset — Run this before every demo or test run.

Puts the tenant in the correct starting state for scenario 2:
  - Sean.Kelly     → Active      (lapsed ALS — will be suspended live)
  - Laverne.Roberts → Active     (lapsed PALS — will be suspended live)
  - Danni.Sullivan  → LeaveOfAbsence  (completed cert — will be restored live)
  - All others      → confirmed Active

Prints a status report so you can verify before going on stage.
"""

import keyring
import os

from sailpoint.v2025.api.identities_api import IdentitiesApi
from sailpoint.v2025.api.lifecycle_states_api import LifecycleStatesApi
from sailpoint.v2025.models.set_lifecycle_state_request import SetLifecycleStateRequest
from sailpoint.v2025.api_client import ApiClient
from sailpoint.configuration import Configuration

os.environ["SAIL_BASE_URL"]      = keyring.get_password("sailpoint", "base_url")
os.environ["SAIL_CLIENT_ID"]     = keyring.get_password("sailpoint", "client_id")
os.environ["SAIL_CLIENT_SECRET"] = keyring.get_password("sailpoint", "client_secret")

configuration = Configuration()

LIFECYCLE_ACTIVE = "0620d3c268d24830ae51d77e8d78f2b0"
LIFECYCLE_LEAVE  = "25a5f851c09c4d36a98091562a3dda2a"

# alias → target lifecycle state
RESET_TARGETS = {
    "Robert.Brown":    LIFECYCLE_ACTIVE,   # scenario 1 ITDR demo target
    "Sean.Kelly":      LIFECYCLE_ACTIVE,   # lapsed — suspend fires live
    "Laverne.Roberts": LIFECYCLE_ACTIVE,   # lapsed — suspend fires live
    "Danni.Sullivan":  LIFECYCLE_LEAVE,    # completed — restore fires live
}

# All clinical staff — just verify state, no change needed
VERIFY_ONLY = [
    "Cole.Aaronson",
    "Lucy.Barret",
    "Carla.Espinosa",
    "Denise.Mahoney",
    "Keith.Meister",
    "Jill.Tracy",
    "Jordan.Sullivan",
]


def get_identity(alias: str):
    with ApiClient(configuration) as client:
        results = IdentitiesApi(client).list_identities(
            filters=f'alias eq "{alias}"'
        )
        if not results:
            raise ValueError(f"Identity not found: {alias}")
        return results[0]


def get_lifecycle_state(identity) -> str:
    attrs = identity.attributes or {}
    return attrs.get("cloudLifecycleState", "unknown")


def set_lifecycle_state(identity_id: str, state_id: str):
    with ApiClient(configuration) as client:
        LifecycleStatesApi(client).set_lifecycle_state(
            identity_id=identity_id,
            set_lifecycle_state_request=SetLifecycleStateRequest(
                lifecycle_state_id=state_id
            )
        )


print("=" * 55)
print("DEMO RESET")
print("=" * 55)

all_good = True

# Apply resets
for alias, target_state_id in RESET_TARGETS.items():
    identity      = get_identity(alias)
    current_state = get_lifecycle_state(identity)
    target_label  = "Active" if target_state_id == LIFECYCLE_ACTIVE else "LeaveOfAbsence"

    if current_state != target_label.lower().replace("of", "Of"):
        set_lifecycle_state(identity.id, target_state_id)
        print(f"  RESET  {alias:<20} → {target_label}")
    else:
        print(f"  OK     {alias:<20}   {target_label} (already set)")

# Verify others
for alias in VERIFY_ONLY:
    identity      = get_identity(alias)
    current_state = get_lifecycle_state(identity)
    if current_state != "active":
        print(f"  WARN   {alias:<20}   state is '{current_state}' — expected Active")
        all_good = False
    else:
        print(f"  OK     {alias:<20}   Active")

print("=" * 55)
if all_good:
    print("Tenant ready. Good to go.")
else:
    print("WARNING: Some identities are not in expected state — review before demoing.")
print("=" * 55)
