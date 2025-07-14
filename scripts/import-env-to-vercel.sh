#!/usr/bin/env bash
# ============================================================================
# import-env-to-vercel.sh
# ---------------------------------------------------------------------------
# Push all key=value pairs from a local .env file into Vercel Environment
# variables for a given scope (default: production).
#
# Usage:
#   ./scripts/import-env-to-vercel.sh .env.local            # push to production
#   ./scripts/import-env-to-vercel.sh .env.staging preview  # push to preview
#
# Notes:
# - Requires Vercel CLI and authentication (`vercel login` or VERCEL_TOKEN).
# - The script skips comment lines and empty lines.
# - Existing vars with the same name will be overwritten.
# ============================================================================

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <env-file> [scope] [--project <slug>] [--team <slug>]" >&2
  exit 1
fi

ENV_FILE="$1"; shift
SCOPE="${1:-production}"
PROJECT_FLAG=""
TEAM_FLAG=""

# Parse optional flags
while [[ $# -gt 0 ]]; do
  case "$1" in
    --project)
      PROJECT_FLAG="--project $2"; shift 2;;
    --team)
      TEAM_FLAG="--team $2"; shift 2;;
    *) shift;;
  esac
done

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌  File not found: $ENV_FILE" >&2
  exit 1
fi

echo "🚀 Importing variables from $ENV_FILE into Vercel scope '$SCOPE'…"

# Read file line by line
while IFS= read -r LINE || [[ -n "$LINE" ]]; do
  # Skip comments and empty lines
  [[ "$LINE" =~ ^#.*$ ]] && continue
  [[ -z "$LINE" ]] && continue

  # Split KEY=VALUE (supports quoted values)
  KEY="${LINE%%=*}"
  VALUE="${LINE#*=}"

  # Trim whitespace
  KEY="$(echo "$KEY" | xargs)"
  VALUE="$(echo "$VALUE" | sed -e 's/^\s*//' -e 's/\s*$//')"

  # Skip if KEY empty
  [[ -z "$KEY" ]] && continue

  printf "Adding %s…\n" "$KEY"
  # Provide value via stdin to avoid echoing secret on the terminal history
  echo "$VALUE" | vercel env add "$KEY" "$SCOPE" --force $PROJECT_FLAG $TEAM_FLAG > /dev/null

done < "$ENV_FILE"

echo "✅  Import complete." 