# Staging Environment — Deploy Process

## Overview

The `staging` branch maps to a **separate Vercel preview deployment** at `staging.go.quizmebaby.app` (to be configured in Vercel dashboard → Settings → Domains).

```
feature branch → PR → staging (validate) → PR → main → prod
```

## Branches

| Branch    | Vercel deployment  | URL                          |
|-----------|--------------------|------------------------------|
| `main`    | Production auto    | `go.quizmebaby.app`          |
| `staging` | Staging auto       | `staging.go.quizmebaby.app`  |

## Workflow

### 1. Develop on feature branch

```bash
git checkout main
git pull origin main
git checkout -b feat/my-feature
# ... develop ...
git push origin feat/my-feature
```

### 2. Merge to staging for validation

```bash
git checkout staging
git pull origin staging
git merge feat/my-feature
git push origin staging
# Vercel deploys automatically to staging URL
```

Validate at `staging.go.quizmebaby.app` — run manual QA and check DoD.

### 3. Merge to main (production)

Only after staging validation passes:

```bash
# Open PR: feat/my-feature → main (or staging → main for batch releases)
# CTO reviews → QA signs off → merge → production deploy triggers automatically
```

## Database

- **Production DB**: Neon project `quizmebaby-prod` (pooled, `DATABASE_URL`)
- **Staging DB**: Neon project `quizmebaby-staging` (separate branch or project — `DATABASE_URL` different value on Vercel staging env)
- Migrations on staging: `prisma migrate deploy` runs at build time — staging DB is safe to run migrations against without prod impact.

> **Critical:** Staging DB must be a separate Neon project/branch, NOT a different schema on the same prod DB.

## Env Vars on Vercel

Configure in Vercel dashboard → Project → Settings → Environment Variables:

| Variable                     | Production | Staging       | Notes                                   |
|------------------------------|------------|---------------|------------------------------------------|
| `DATABASE_URL`               | prod pool  | staging pool  | Different Neon connection strings        |
| `DIRECT_DATABASE_URL`        | prod direct| staging direct| Direct (non-pooled) for migrations      |
| `NEXTAUTH_URL`               | `https://go.quizmebaby.app` | `https://staging.go.quizmebaby.app` | Must match deployment URL |
| `NEXTAUTH_SECRET`            | prod secret| staging secret| Can reuse or use separate value         |
| `STRIPE_SECRET_KEY`          | `sk_live_` | `sk_test_`    | **Staging always uses test mode keys**  |
| `STRIPE_WEBHOOK_SECRET`      | prod whsec | test whsec    | Register separate webhook in Stripe test|
| `STRIPE_*_PRICE_ID`          | live IDs   | test IDs      | Different price IDs in test mode        |
| `OPENROUTER_API_KEY`         | prod key   | same or test  | Can share                               |
| `UPLOADTHING_TOKEN`          | prod token | staging token | Separate UploadThing app recommended    |
| `GHL_*`                      | prod       | staging/skip  | Staging can use a test GHL location     |
| `FIELD_ENCRYPTION_KEY`       | prod key   | staging key   | Keep different for isolation            |

### Setting env vars scoped to staging only

In Vercel dashboard:
1. Project → Settings → Environment Variables
2. Add/edit variable → uncheck "Production", check "Preview" → in "Git Branches" field enter `staging`

This scopes the variable to only the `staging` branch deploy.

## Stripe Webhooks (Staging)

Register a separate webhook endpoint in Stripe **Test Mode**:
- Endpoint: `https://staging.go.quizmebaby.app/api/stripe/webhook`
- Use the test mode `whsec_...` secret as `STRIPE_WEBHOOK_SECRET` on staging env

## Rollback

If staging deploy is broken:

```bash
# In Vercel dashboard → Deployments → find last good staging deploy → "Promote"
# OR revert the commit on staging:
git checkout staging
git revert HEAD
git push origin staging
```

## Neon DB Setup for Staging

1. In Neon dashboard → project `quizmebaby-prod` → Branches → "New Branch" from `main` → name it `staging`
2. Copy the connection strings (pooled + direct)
3. Set them as `DATABASE_URL` / `DIRECT_DATABASE_URL` on Vercel scoped to `staging` branch

OR create a completely separate Neon project `quizmebaby-staging` for full isolation.
