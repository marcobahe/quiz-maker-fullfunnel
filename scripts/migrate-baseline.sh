#!/usr/bin/env bash
# migrate-baseline.sh
#
# ONE-TIME script: marks existing migrations as already applied in the
# _prisma_migrations tracking table, without re-running their SQL.
#
# Run this ONCE against production (and staging) before the first deploy
# that uses `prisma migrate deploy` in the build command (QMB-65).
#
# Pre-requisites:
#   - DATABASE_URL and DIRECT_DATABASE_URL env vars set
#   - prisma CLI available (npx prisma)
#
# Usage:
#   DATABASE_URL="..." DIRECT_DATABASE_URL="..." bash scripts/migrate-baseline.sh

set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set." >&2
  exit 1
fi

MIGRATIONS=(
  "20260425_add_workspace_ghl_fields"
  "20260426_add_paywall_fields"
)

echo "==> Resolving existing migrations as applied (baseline for migrate deploy)..."

for migration in "${MIGRATIONS[@]}"; do
  echo "    Marking as applied: $migration"
  npx prisma migrate resolve --applied "$migration"
done

echo ""
echo "==> Baseline complete. The following migrations are now marked as applied:"
npx prisma migrate status
