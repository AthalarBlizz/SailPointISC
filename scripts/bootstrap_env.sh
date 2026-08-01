#!/usr/bin/env bash
# Bootstrap a sandboxed local environment for agentic ISC development.
# Does not require a SailPoint tenant. Credentials (when you have them)
# go in the OS keychain via python-keyring — never into this repo.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PYTHON="${PYTHON:-python3}"

echo "==> Project root: $ROOT"
echo "==> Python: $($PYTHON --version)"

if [[ ! -d .venv || ! -x .venv/bin/python ]]; then
  echo "==> Creating virtual environment (.venv)"
  rm -rf .venv
  "$PYTHON" -m venv .venv
else
  echo "==> Reusing existing .venv"
fi

# shellcheck disable=SC1091
source .venv/bin/activate

echo "==> Upgrading pip"
python -m pip install --upgrade pip

echo "==> Installing requirements"
python -m pip install -r requirements.txt

SPECS_DIR="$ROOT/api-specs"
if [[ ! -d "$SPECS_DIR/idn" ]]; then
  echo "==> Cloning SailPoint api-specs (sparse: v2026, v2025, beta)"
  rm -rf "$SPECS_DIR"
  git clone --depth 1 --filter=blob:none --sparse \
    https://github.com/sailpoint-oss/api-specs.git "$SPECS_DIR"
  (
    cd "$SPECS_DIR"
    git sparse-checkout set idn/v2026 idn/v2025 idn/beta
  )
else
  echo "==> api-specs already present — pulling latest"
  (
    cd "$SPECS_DIR"
    git pull --ff-only || true
  )
fi

echo "==> Environment status"
python src/env_status.py

cat <<'EOF'

Bootstrap complete.

Next steps:
  source .venv/bin/activate
  python src/env_status.py

When you have an ISC PAT (optional until then):
  python src/setup_keyring.py
  python src/check_keyring.py

Secrets stay in macOS Keychain via keyring — never commit them.
EOF
