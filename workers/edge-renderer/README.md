# Edge Renderer (`quiz-edge-renderer`)

Cloudflare Worker that serves dynamic quizzes on `play.quizmebaby.app`.

## Setup

```bash
cd workers/edge-renderer
cp .env.example .env
# Fill in CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN
npm install
```

## Local development

```bash
wrangler dev
# or
npm run dev
```

## Manual deploy (local)

```bash
wrangler deploy
```

## Automated deploy (CI/CD)

The worker is automatically deployed via GitHub Actions on every push to `main` that changes files under `workers/edge-renderer/**`.

### Workflow

- File: `.github/workflows/deploy-worker.yml` (in the repo root)
- Trigger: push to `main` with changes in `workers/edge-renderer/**`
- Can also be triggered manually via `workflow_dispatch`

### Requirements

Two GitHub Secrets are required (`Settings -> Secrets and variables -> Actions -> New repository secret`):

1. **CF_API_TOKEN** — Cloudflare API token:
   - Create at: Cloudflare dash → My Profile → API Tokens → Create Token
   - Use the "Edit Cloudflare Workers" template
   - Name in GitHub Secrets: `CF_API_TOKEN`

2. **CF_ACCOUNT_ID** — Cloudflare Account ID:
   - Get it from: Cloudflare dash → right sidebar → Account ID
   - Name in GitHub Secrets: `CF_ACCOUNT_ID`

### Local deploy script

```bash
./scripts/deploy-worker.sh
# or with explicit env
CF_API_TOKEN=xxx CF_ACCOUNT_ID=yyy ./scripts/deploy-worker.sh
```

The script:
- Installs dependencies (`npm ci`)
- Runs type check (`tsc --noEmit`)
- Deploys (`wrangler deploy`)
- Runs `wrangler tail` for 2min to confirm zero errors
- Health-checks `https://play.quizmebaby.app/healthz`

## Structure

- `src/index.ts` — Worker entrypoint (routing + cache + KV lookup)
- `wrangler.toml` — configuration (routes, KV namespaces, vars)
- `scripts/deploy-worker.sh` — local/CI deploy script
- `docs/runbook.md` — operations playbook and troubleshooting
