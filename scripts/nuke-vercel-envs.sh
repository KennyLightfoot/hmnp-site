#!/usr/bin/env bash
# ============================================================================
# nuke-vercel-envs.sh
# ---------------------------------------------------------------------------
# Delete ALL environment variables for a given Vercel project scope (production,
# preview, or development).  Useful when you need a clean reset before
# re-adding trimmed & validated secrets.
#
# Prerequisites:
#   1. Vercel CLI installed (`npm i -g vercel@latest`).
#   2. Authentication: either run `vercel login` or export VERCEL_TOKEN.
#   3. Your project must be linked locally (.vercel/project.json) OR pass
#      --project and optionally --team flags.
#
# Usage:
#   ./scripts/nuke-vercel-envs.sh production            # interactive confirm
#   ./scripts/nuke-vercel-envs.sh preview   --yes       # non-interactive
#
# Flags:
#   --yes            Skip confirmation prompt (dangerous!)
#   --project <slug> Override project slug
#   --team <slug>    Team slug (if using Vercel teams)
# ============================================================================

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <production|preview|development> [--yes] [--project <slug>] [--team <slug>]" >&2
  exit 1
fi

SCOPE="$1"; shift
CONFIRM="ask"
PROJECT_FLAG=""
TEAM_FLAG=""

# --------------------------------------------------
# Parse optional flags
# --------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --yes|-y)
      CONFIRM="skip"; shift;;
    --project)
      PROJECT_FLAG="--project $2"; shift 2;;
    --team)
      TEAM_FLAG="--team $2"; shift 2;;
    *)
      echo "Unknown flag: $1" >&2; exit 1;;
  esac
done

# --------------------------------------------------
# Fetch current variable names for the scope
# --------------------------------------------------
echo "Fetching $SCOPE variables from Vercel…"
TMPFILE=$(mktemp)

# Vercel CLI prints a table; awk extracts first column (name) and greps for caps
vercel env ls "$SCOPE" $PROJECT_FLAG $TEAM_FLAG \
  | awk '{print $1}' \
  | grep -E '^[A-Z0-9_]+$' > "$TMPFILE"

COUNT=$(wc -l < "$TMPFILE")
if [[ $COUNT -eq 0 ]]; then
  echo "✅  No variables found for scope $SCOPE. Nothing to delete." && exit 0
fi

echo "\n⚠️  About to delete $COUNT variables in scope '$SCOPE':"
cat "$TMPFILE"

echo
if [[ "$CONFIRM" == "ask" ]]; then
  read -rp "Type DELETE to confirm: " RESPONSE
  if [[ "$RESPONSE" != "DELETE" ]]; then
    echo "Aborted." && exit 1
  fi
fi

# --------------------------------------------------
# Loop through vars and remove
# --------------------------------------------------
while read -r VAR; do
  echo "🚮 Removing $VAR …"
  vercel env rm "$VAR" "$SCOPE" --yes $PROJECT_FLAG $TEAM_FLAG || {
    echo "⚠️  Failed to remove $VAR" >&2;
  }
done < "$TMPFILE"

rm -f "$TMPFILE"

echo "\n✅  Completed. All variables for scope '$SCOPE' have been removed." 