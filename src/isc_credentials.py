"""
Shared ISC credential loading via python-keyring (OS keychain).

Credentials never live in source, .env files, or chat. They are stored once
with setup_keyring.py and loaded here at runtime into SAIL_* env vars that
the SailPoint SDK Configuration() reads automatically.

Service name: "sailpoint"
Keys:         base_url, client_id, client_secret
"""

from __future__ import annotations

import os
from dataclasses import dataclass

import keyring

KEYRING_SERVICE = "sailpoint"
KEYRING_KEYS = ("base_url", "client_id", "client_secret")


@dataclass(frozen=True)
class IscCredentials:
    """PAT credentials for ISC API access (client credentials grant)."""

    base_url: str
    client_id: str
    client_secret: str


class CredentialsNotFoundError(RuntimeError):
    """Raised when one or more keyring entries are missing."""


def get_credentials() -> IscCredentials:
    """
    Read ISC PAT credentials from the OS keychain.

    Returns an IscCredentials instance. Raises CredentialsNotFoundError if any
    value is missing — run setup_keyring.py first.
    """
    values = {key: keyring.get_password(KEYRING_SERVICE, key) for key in KEYRING_KEYS}
    missing = [key for key, value in values.items() if not value]
    if missing:
        raise CredentialsNotFoundError(
            f"Missing keyring entries for {KEYRING_SERVICE}: {', '.join(missing)}. "
            "Run: python src/setup_keyring.py"
        )
    return IscCredentials(
        base_url=values["base_url"],
        client_id=values["client_id"],
        client_secret=values["client_secret"],
    )


def load_credentials_into_env() -> IscCredentials:
    """
    Load keyring credentials into SAIL_* environment variables.

    The SailPoint SDK Configuration() reads SAIL_BASE_URL, SAIL_CLIENT_ID,
    and SAIL_CLIENT_SECRET. Call this before creating Configuration().
    """
    creds = get_credentials()
    os.environ["SAIL_BASE_URL"] = creds.base_url
    os.environ["SAIL_CLIENT_ID"] = creds.client_id
    os.environ["SAIL_CLIENT_SECRET"] = creds.client_secret
    return creds


def credentials_present() -> bool:
    """Return True if all three keyring entries are set (does not validate them)."""
    return all(keyring.get_password(KEYRING_SERVICE, key) for key in KEYRING_KEYS)


def clear_credentials() -> None:
    """
    Delete ISC credentials from the OS keychain.

    Use when rotating a PAT or ending a project. Does not raise if a key
    was already absent.
    """
    for key in KEYRING_KEYS:
        try:
            keyring.delete_password(KEYRING_SERVICE, key)
        except keyring.errors.PasswordDeleteError:
            pass
