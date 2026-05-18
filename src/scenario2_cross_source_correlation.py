"""
Scenario 2: Cross-Source Data Correlation (FIDO Key + Time Signing + Workday)
ISC acts as the identity-aware integration broker — it knows which accounts
across three separate systems belong to the same person.

Flow: App B fires an ISC workflow trigger when a time entry is signed.
ISC correlates the worker to their FIDO key in Database A and pushes
a composite record to Workday.
"""

from sailpoint.v2025.api.accounts_api import AccountsApi
from sailpoint.v2025.api_client import ApiClient
from sailpoint.configuration import Configuration
import keyring
import requests

configuration = Configuration()
configuration.client_id     = keyring.get_password("sailpoint", "client_id")
configuration.client_secret = keyring.get_password("sailpoint", "client_secret")
configuration.base_url      = keyring.get_password("sailpoint", "base_url")

# Source IDs for each connected system in ISC — get these from GET /v2025/sources
FIDO_SOURCE_ID = "<fido-database-source-id>"
WORKDAY_SOURCE_ID = "<workday-source-id>"
WORKDAY_API_URL = "<workday-api-url>"
WORKDAY_TOKEN = "<workday-bearer-token>"


def process_signed_time_entry(worker_id: str, time_entry: dict) -> dict:
    """
    Correlate a signed time entry with the worker's FIDO key and push to Workday.

    ISC already maintains the mapping:
      worker 4472 in FIDO DB  =  jsmith in App B  =  EMP-4472 in Workday

    Args:
        worker_id: The worker's ID in the time signing application (App B)
        time_entry: Dict with shiftDate, hoursWorked, signatureHash, fidoKeyId
    """
    with ApiClient(configuration) as client:
        accounts_api = AccountsApi(client)

        # Step 1: Resolve worker to ISC identity via their FIDO DB account
        fido_accounts = accounts_api.list_accounts(
            filters=f'sourceId eq "{FIDO_SOURCE_ID}" '
                    f'and nativeIdentity eq "{worker_id}"'
        )
        if not fido_accounts:
            raise ValueError(f"Worker {worker_id} not found in FIDO source")

        fido_account = fido_accounts[0]
        identity_id = fido_account.identity_id
        fido_public_key = fido_account.attributes.get("publicKey")
        key_issued_date = fido_account.attributes.get("keyIssuedDate")

        # Step 2: Validate — signing key must match what's registered in Database A
        if time_entry["fidoKeyId"] != fido_account.attributes.get("keyId"):
            raise ValueError(
                f"Key mismatch for worker {worker_id} — possible credential compromise. "
                f"Expected: {fido_account.attributes.get('keyId')}, "
                f"Got: {time_entry['fidoKeyId']}"
            )

        # Step 3: Find their Workday account using the same identity
        wd_accounts = accounts_api.list_accounts(
            filters=f'identityId eq "{identity_id}" '
                    f'and sourceId eq "{WORKDAY_SOURCE_ID}"'
        )
        if not wd_accounts:
            raise ValueError(f"No Workday account found for identity {identity_id}")

        workday_emp_id = wd_accounts[0].native_identity

        # Step 4: Push composite record to Workday
        workday_payload = {
            "worker": workday_emp_id,
            "timeEntry": {
                "date": time_entry["shiftDate"],
                "hours": time_entry["hoursWorked"],
                "fidoPublicKey": fido_public_key,
                "signatureHash": time_entry["signatureHash"],
                "keyIssuedDate": key_issued_date,
                "verified": True
            }
        }

        response = requests.post(
            f"{WORKDAY_API_URL}/Time_Tracking",
            json=workday_payload,
            headers={"Authorization": f"Bearer {WORKDAY_TOKEN}"}
        )
        response.raise_for_status()

        return {
            "workerId": worker_id,
            "identityId": identity_id,
            "workdayEmpId": workday_emp_id,
            "status": "submitted",
            "verified": True
        }


# --- Usage ---

# App B calls this when a worker signs their time entry
time_entry = {
    "shiftDate": "2026-04-25",
    "hoursWorked": 8.5,
    "signatureHash": "a3f2b8c1d4e5f6...",
    "fidoKeyId": "key-9x82mf"
}

result = process_signed_time_entry(worker_id="4472", time_entry=time_entry)
print(result)
