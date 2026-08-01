"""
Local development environment health check.

Runs offline — does not call ISC. Verifies the sandboxed venv packages,
api-specs presence, and whether keyring credentials are stored.
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _ok(label: str, detail: str = "") -> None:
    suffix = f" — {detail}" if detail else ""
    print(f"  OK  {label}{suffix}")


def _warn(label: str, detail: str = "") -> None:
    suffix = f" — {detail}" if detail else ""
    print(f" WARN {label}{suffix}")


def _fail(label: str, detail: str = "") -> None:
    suffix = f" — {detail}" if detail else ""
    print(f" FAIL {label}{suffix}")


def check_python() -> bool:
    major, minor = sys.version_info[:2]
    version = f"{major}.{minor}.{sys.version_info[2]}"
    in_venv = sys.prefix != sys.base_prefix
    if in_venv:
        _ok("Python venv active", f"{version} @ {sys.prefix}")
        return True
    _warn("Python venv not active", f"{version} — run: source .venv/bin/activate")
    return False


def check_package(name: str, import_name: str | None = None) -> bool:
    mod = import_name or name
    if importlib.util.find_spec(mod) is None:
        _fail(f"Package '{name}'", "not installed — run: pip install -r requirements.txt")
        return False
    _ok(f"Package '{name}'")
    return True


def check_api_specs() -> bool:
    specs = ROOT / "api-specs" / "idn"
    if not specs.is_dir():
        _fail("api-specs/idn", "missing — run: ./scripts/bootstrap_env.sh")
        return False
    versions = sorted(p.name for p in specs.iterdir() if p.is_dir())
    if not versions:
        _fail("api-specs/idn", "empty — re-run sparse checkout")
        return False
    _ok("api-specs", ", ".join(versions))
    return True


def check_keyring() -> bool:
    # Import after path setup so this works when run as python src/env_status.py
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from isc_credentials import credentials_present

    if credentials_present():
        _ok("Keyring credentials", "base_url / client_id / client_secret present")
        _warn("Live ISC calls", "possible once you have a tenant — not required for coding")
        return True
    _warn(
        "Keyring credentials",
        "not set (expected without a tenant) — run setup_keyring.py when you have a PAT",
    )
    return True  # missing creds is OK for offline agentic coding


def main() -> int:
    print("ISC local development environment")
    print("=" * 40)
    results = [
        check_python(),
        check_package("sailpoint"),
        check_package("keyring"),
        check_package("requests"),
        check_api_specs(),
        check_keyring(),
    ]
    print()
    if all(results):
        print("Environment ready for agentic ISC development.")
        print("Write integrations under src/; use api-specs/ as API ground truth.")
        return 0
    print("Environment incomplete — fix FAIL items above, then re-run.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
