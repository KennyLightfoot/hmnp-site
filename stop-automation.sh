#!/usr/bin/env bash
set -euo pipefail

# Always run from the repo root so pnpm picks up the right workspace
cd /home/kenkarot/dev/hmnp

# Ensure pnpm is available even when the shell starts without the usual profile
if ! command -v pnpm >/dev/null 2>&1; then
  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1090
    . "$HOME/.nvm/nvm.sh"
    nvm use --silent >/dev/null 2>&1 || true
  fi
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is not on the PATH. Make sure Node/corepack is installed or nvm is configured." >&2
  exit 1
fi

pnpm automation:stop

