"""
Scenario 2: Clinical Staff Training Compliance Automation

The problem: Clinical staff must hold current ALS and/or PALS certifications to work.
Certification records live in an external credentialing system — ISC has no native way
to read that data and act on it.

This nightly script bridges the gap:
  - Reads the credentialing system export (training_data.csv)
  - Applies department rules (ED and Pediatrics require both ALS and PALS; all others ALS only)
  - Takes three actions through the ISC SDK:
      EXPIRING  → enroll in renewal training via access request, notify manager
      LAPSED    → set identity to LeaveOfAbsence, notify manager
      COMPLETED → restore to Active if currently on leave

Note: The credentialing system is read-only. ISC never writes back to it —
certification records are validated by humans, not provisioned by software.
"""

import csv
import keyring
import os
from collections import defaultdict
from datetime import date

from sailpoint.v2025.api.identities_api import IdentitiesApi
from sailpoint.v2025.api.access_requests_api import AccessRequestsApi
from sailpoint.v2025.api.lifecycle_states_api import LifecycleStatesApi
from sailpoint.v2025.models.access_request import AccessRequest
from sailpoint.v2025.models.access_request_item import AccessRequestItem
from sailpoint.v2025.models.set_lifecycle_state_request import SetLifecycleStateRequest
from sailpoint.v2025.api_client import ApiClient
from sailpoint.configuration import Configuration

# --- Configuration ---

os.environ["SAIL_BASE_URL"]      = keyring.get_password("sailpoint", "base_url")
os.environ["SAIL_CLIENT_ID"]     = keyring.get_password("sailpoint", "client_id")
os.environ["SAIL_CLIENT_SECRET"] = keyring.get_password("sailpoint", "client_secret")

TRAINING_DATA_FILE = "training_data.csv"

# Lifecycle state IDs (HR identity profile)
LIFECYCLE_LEAVE    = "25a5f851c09c4d36a98091562a3dda2a"  # LeaveOfAbsence
LIFECYCLE_ACTIVE   = "0620d3c268d24830ae51d77e8d78f2b0"  # Active

# TrainingLMS entitlement IDs
ENTITLEMENT_ALS_RENEWAL  = "49fb89fc5b883344b2309508baddcfb3"
ENTITLEMENT_PALS_RENEWAL = "6bfb710b652c35fb9ea2bc8bd252b65f"

# Departments requiring both ALS and PALS
DUAL_CERT_DEPARTMENTS = {"Emergency Department", "Pediatrics"}

# Days ahead to consider a cert "expiring soon"
EXPIRY_WINDOW_DAYS = 30

# Manager — receives all notifications
MANAGER_NAME  = "Jordan Sullivan"
MANAGER_EMAIL = "Jordan.Sullivan@sailpointdemo.com"

configuration = Configuration()


# --- Helpers ---

def get_identity(alias: str) -> object:
    """Look up an ISC identity by their login alias."""
    with ApiClient(configuration) as client:
        results = IdentitiesApi(client).list_identities(
            filters=f'alias eq "{alias}"',
            count=False
        )
        if not results:
            raise ValueError(f"Identity not found: {alias}")
        return results[0]


def get_lifecycle_state(identity: object) -> str:
    """Return the technical name of the identity's current lifecycle state."""
    attrs = identity.attributes or {}
    return attrs.get("cloudLifecycleState", "unknown")


def set_lifecycle_state(identity_id: str, lifecycle_state_id: str, label: str) -> None:
    """Move an identity to a new lifecycle state."""
    with ApiClient(configuration) as client:
        LifecycleStatesApi(client).set_lifecycle_state(
            identity_id=identity_id,
            set_lifecycle_state_request=SetLifecycleStateRequest(
                lifecycle_state_id=lifecycle_state_id
            )
        )
    print(f"    Lifecycle state → {label}")


def request_training_enrollment(identity_id: str, identity_name: str, entitlement_id: str, cert: str) -> None:
    """Submit an access request to enroll the identity in a renewal training course."""
    with ApiClient(configuration) as client:
        AccessRequestsApi(client).create_access_request(
            access_request=AccessRequest(
                requested_for=[identity_id],
                request_type="GRANT_ACCESS",
                requested_items=[
                    AccessRequestItem(
                        type="ENTITLEMENT",
                        id=entitlement_id,
                        comment=f"Automated enrollment: {cert} certification expiring within {EXPIRY_WINDOW_DAYS} days"
                    )
                ]
            )
        )
    print(f"    Access request submitted: {cert} renewal training")


def notify_manager(identity_name: str, action: str, detail: str) -> None:
    """Notify the nurse manager. (Printed here — replace with real email/notification in production.)"""
    print(f"    [NOTIFICATION → {MANAGER_NAME} <{MANAGER_EMAIL}>]")
    print(f"      {action}: {identity_name} — {detail}")


# --- Core logic ---

def evaluate_compliance(records: list[dict]) -> dict:
    """
    Apply certification rules by department:
      - Emergency Department or Pediatrics: must hold current ALS AND PALS
      - All other departments: ALS only (PALS does not substitute for ALS or vice versa)

    Returns a dict of {alias: {"action": str, "certs": list, "department": str}}
    """
    today = date.today()
    window = (today.toordinal() + EXPIRY_WINDOW_DAYS)

    # Group records by employee
    by_employee = defaultdict(list)
    for row in records:
        by_employee[row["employee_id"]].append(row)

    decisions = {}

    for alias, certs in by_employee.items():
        department = certs[0]["department"]
        required   = {"ALS", "PALS"} if department in DUAL_CERT_DEPARTMENTS else {"ALS"}

        lapsed   = []
        expiring = []

        for cert in certs:
            cert_name = cert["certification"]
            if cert_name not in required:
                continue  # PALS doesn't count for ALS requirements and vice versa

            status = cert["status"]
            if status == "lapsed":
                lapsed.append(cert_name)
            elif status == "expiring":
                expiring.append(cert_name)
            # "current" and "completed" require no action on their own

        if lapsed:
            decisions[alias] = {"action": "suspend", "certs": lapsed, "department": department,
                                 "name": certs[0]["name"]}
        elif expiring:
            decisions[alias] = {"action": "enroll", "certs": expiring, "department": department,
                                 "name": certs[0]["name"]}
        else:
            # Check for completed — may need restore if currently on leave
            completed = [c["certification"] for c in certs if c["status"] == "completed"]
            if completed:
                decisions[alias] = {"action": "restore", "certs": completed, "department": department,
                                     "name": certs[0]["name"]}
            else:
                decisions[alias] = {"action": "none", "certs": [], "department": department,
                                     "name": certs[0]["name"]}

    return decisions


def run_compliance_check(training_file: str) -> list[dict]:
    """Main compliance run. Returns a report list for HR."""
    print("=" * 60)
    print("Clinical Staff Training Compliance — Nightly Run")
    print(f"Date: {date.today()}")
    print("=" * 60)

    # Load training data
    with open(training_file, newline="") as f:
        records = list(csv.DictReader(f))

    decisions = evaluate_compliance(records)
    report    = []

    for alias, decision in decisions.items():
        action     = decision["action"]
        name       = decision["name"]
        department = decision["department"]
        certs      = decision["certs"]

        print(f"\n{name} ({department})")

        if action == "none":
            print("    Certifications current — no action required")
            report.append({"name": name, "department": department, "status": "COMPLIANT", "action": "none"})
            continue

        # Look up identity in ISC
        try:
            identity      = get_identity(alias)
            identity_id   = identity.id
            current_state = get_lifecycle_state(identity)
        except ValueError as e:
            print(f"    WARNING: {e}")
            continue

        if action == "suspend":
            if current_state == "leaveOfAbsence":
                print(f"    Already on LeaveOfAbsence — no change needed")
                report.append({"name": name, "department": department,
                               "status": "ON LEAVE", "action": "already_suspended",
                               "certs": certs})
            else:
                print(f"    Lapsed: {', '.join(certs)} — suspending clinical access")
                set_lifecycle_state(identity_id, LIFECYCLE_LEAVE, "LeaveOfAbsence")
                notify_manager(name, "Access Suspended", f"Lapsed certification(s): {', '.join(certs)}")
                report.append({"name": name, "department": department,
                               "status": "SUSPENDED", "action": "suspended",
                               "certs": certs})

        elif action == "enroll":
            print(f"    Expiring: {', '.join(certs)} — requesting renewal training enrollment")
            for cert in certs:
                ent_id = ENTITLEMENT_ALS_RENEWAL if cert == "ALS" else ENTITLEMENT_PALS_RENEWAL
                request_training_enrollment(identity_id, name, ent_id, cert)
            notify_manager(name, "Training Enrollment Requested",
                           f"Certification(s) expiring within {EXPIRY_WINDOW_DAYS} days: {', '.join(certs)}")
            report.append({"name": name, "department": department,
                           "status": "ENROLLMENT REQUESTED", "action": "enrolled",
                           "certs": certs})

        elif action == "restore":
            if current_state == "leaveOfAbsence":
                print(f"    Certification renewed: {', '.join(certs)} — restoring access")
                set_lifecycle_state(identity_id, LIFECYCLE_ACTIVE, "Active")
                notify_manager(name, "Access Restored", f"Certification(s) renewed: {', '.join(certs)}")
                report.append({"name": name, "department": department,
                               "status": "RESTORED", "action": "restored",
                               "certs": certs})
            else:
                print(f"    Certification renewed — access already active, no change needed")
                report.append({"name": name, "department": department,
                               "status": "COMPLIANT", "action": "none"})

    # HR Report
    print("\n" + "=" * 60)
    print("HR COMPLIANCE REPORT")
    print("=" * 60)
    for row in report:
        certs_str = ", ".join(row.get("certs", [])) if row.get("certs") else "—"
        print(f"  {row['name']:<20} {row['department']:<25} {row['status']:<25} {certs_str}")

    return report


# --- Run ---

if __name__ == "__main__":
    run_compliance_check(TRAINING_DATA_FILE)
