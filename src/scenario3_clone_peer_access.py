"""
Scenario 3: Peer-Based Access Provisioning ("Just Give Cynthia What Jennifer Has")

The problem: ISC has no native provisioning-by-example capability. A manager who says
"give the new person the same access as their peer" has to manually look up every role
and entitlement — then submit them one by one.

This script translates that human intent into governance-compatible access requests:
  1. Pulls all roles and entitlements from the peer identity
  2. Shows a dry run for manager review before anything is submitted
  3. Submits proper ISC access requests that still go through normal approval workflows

Nothing bypasses controls — every request goes through the same approval process as any
other access request in ISC.

Usage:
  python scenario3_clone_peer_access.py --peer "Jennifer.Thomas" --new "Cynthia.Cook"
  python scenario3_clone_peer_access.py --peer "Jennifer.Thomas" --new "Cynthia.Cook" --submit
"""

import argparse
import keyring
import os

from sailpoint.v2025.api.identities_api import IdentitiesApi
from sailpoint.v2025.api.accounts_api import AccountsApi
from sailpoint.v2025.api.access_requests_api import AccessRequestsApi
from sailpoint.v2025.models.access_request import AccessRequest
from sailpoint.v2025.models.access_request_item import AccessRequestItem
from sailpoint.v2025.api_client import ApiClient
from sailpoint.configuration import Configuration

os.environ["SAIL_BASE_URL"]      = keyring.get_password("sailpoint", "base_url")
os.environ["SAIL_CLIENT_ID"]     = keyring.get_password("sailpoint", "client_id")
os.environ["SAIL_CLIENT_SECRET"] = keyring.get_password("sailpoint", "client_secret")

configuration = Configuration()


def get_identity(alias: str) -> object:
    """Resolve a login alias to an ISC identity."""
    with ApiClient(configuration) as client:
        results = IdentitiesApi(client).list_identities(
            filters=f'alias eq "{alias}"'
        )
        if not results:
            raise ValueError(f"No identity found for alias '{alias}'")
        return results[0]


def get_peer_access(identity_id: str) -> list[dict]:
    """
    Pull all roles and entitlements currently held by the peer identity.
    Roles come from the identity directly; entitlements come from their source accounts.
    """
    items = []

    with ApiClient(configuration) as client:
        identities_api = IdentitiesApi(client)
        accounts_api   = AccountsApi(client)

        # Roles assigned to the peer
        roles = identities_api.get_role_assignments(identity_id=identity_id)
        for wrapper in (roles or []):
            role = wrapper.actual_instance
            if role and hasattr(role, "role") and role.role:
                items.append({
                    "type": "ROLE",
                    "id":   role.role.id,
                    "name": role.role.name,
                })

        # Entitlements via source accounts
        accounts = accounts_api.list_accounts(
            filters=f'identityId eq "{identity_id}"'
        )
        for account in (accounts or []):
            entitlements = accounts_api.get_account_entitlements(id=account.id)
            for ent in (entitlements or []):
                items.append({
                    "type":   "ENTITLEMENT",
                    "id":     ent.id,
                    "name":   ent.name,
                    "source": account.source_name,
                })

    return items


def clone_access(peer_name: str, new_person_name: str, dry_run: bool = True) -> dict:
    """
    Clone access from peer to new person.

    dry_run=True  → shows what would be requested, submits nothing
    dry_run=False → submits access requests (still go through ISC approval workflows)
    """
    print(f"\nLooking up {peer_name}...")
    peer = get_identity(peer_name)

    print(f"Looking up {new_person_name}...")
    new_person = get_identity(new_person_name)

    print(f"Pulling access for {peer_name}...")
    peer_access = get_peer_access(peer.id)

    print(f"\n{'DRY RUN — ' if dry_run else ''}Cloning {len(peer_access)} access items from {peer_name} to {new_person_name}")
    print("-" * 60)
    for item in peer_access:
        source = f" ({item['source']})" if item.get("source") else ""
        print(f"  [{item['type']}] {item['name']}{source}")
    print("-" * 60)

    if dry_run:
        print(f"DRY RUN complete — {len(peer_access)} items would be requested.")
        print("Run with --submit to send the access requests.")
        return {
            "peer":            peer_name,
            "new_person":      new_person_name,
            "access_to_clone": peer_access,
            "total_items":     len(peer_access),
            "status":          "DRY RUN — review before submitting"
        }

    # Submit in batches of 25 (ISC access request limit)
    requested_items = [
        AccessRequestItem(
            type=item["type"],
            id=item["id"],
            comment=f"Peer-based provisioning: matched from {peer_name}"
        )
        for item in peer_access
    ]

    results = []
    for i in range(0, len(requested_items), 25):
        batch = requested_items[i:i + 25]
        with ApiClient(configuration) as client:
            response = AccessRequestsApi(client).create_access_request(
                access_request=AccessRequest(
                    requested_for=[new_person.id],
                    request_type="GRANT_ACCESS",
                    requested_items=batch
                )
            )
            results.append(response)

    print(f"Submitted {len(requested_items)} access requests in {len(results)} batch(es).")
    print("Requests are pending normal ISC approval workflows.")

    return {
        "peer":              peer_name,
        "new_person":        new_person_name,
        "items_requested":   len(requested_items),
        "batches_submitted": len(results),
        "status":            "SUBMITTED — pending approval"
    }


# --- Entry point ---

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clone access from one ISC identity to another.")
    parser.add_argument("--peer",   required=True, help="Login alias of the peer to clone access from (e.g. Jennifer.Thomas)")
    parser.add_argument("--new",    required=True, help="Login alias of the person receiving access (e.g. Cynthia.Cook)")
    parser.add_argument("--submit", action="store_true", help="Submit access requests (default is dry run)")
    args = parser.parse_args()

    clone_access(args.peer, args.new, dry_run=not args.submit)
