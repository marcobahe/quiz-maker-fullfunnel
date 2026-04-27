#!/usr/bin/env bash
set -euo pipefail

# Deploy script for quiz-edge-renderer Worker
# Usage: ./scripts/deploy-worker.sh [--env <env>]
#   --env    Target environment: production (default) or staging
#
# Requires CF_API_TOKEN in environment (or .env file for local dev).
# In CI, CF_API_TOKEN is injected via GitHub Secret.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_ARG="production"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      ENV_ARG="${2:-production}"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--env <env>]"
      exit 1
      ;;
  esac
done

cd "$PROJECT_DIR"

# Load .env if present (local dev only; CI uses env vars directly)
if [[ -f .env ]]; then
  # shellcheck source=/dev/null
  set -a && source .env && set +a
fi

if [[ -z "${CF_API_TOKEN:-}" ]] && [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "Missing CF_API_TOKEN (or CLOUDFLARE_API_TOKEN) in environment"
  echo "   Set it in your shell, .env file, or GitHub Secret (CI)."
  exit 1
fi

if [[ -z "${CF_ACCOUNT_ID:-}" ]] && [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "Missing CF_ACCOUNT_ID (or CLOUDFLARE_ACCOUNT_ID) in environment"
  echo "   Set it in your shell, .env file, or GitHub Secret (CI)."
  exit 1
fi

# Prefer CF_API_TOKEN; fall back to CLOUDFLARE_API_TOKEN for backward compat
export CLOUDFLARE_API_TOKEN="${CF_API_TOKEN:-${CLOUDFLARE_API_TOKEN:-}}"
export CLOUDFLARE_ACCOUNT_ID="${CF_ACCOUNT_ID:-${CLOUDFLARE_ACCOUNT_ID:-}}"

echo "Installing dependencies..."
npm ci

echo "Running type check..."
npm run type-check

echo "Deploying quiz-edge-renderer (env: ${ENV_ARG})..."

if [[ "$ENV_ARG" == "staging" ]]; then
  npx wrangler deploy --env staging
else
  npx wrangler deploy
fi

echo "Worker deployed successfully."
echo ""
echo "Starting 2-minute tail to confirm zero errors..."
# Tail for 2 minutes, then exit — good for CI logs
timeout 120 npx wrangler tail --format pretty || true

echo ""
echo "Quick health check:"
curl -sf "https://play.quizmebaby.app/healthz" -o /dev/null && echo "   Healthz: OK" || echo "   Healthz: FAIL"
