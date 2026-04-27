# Staging Environment — Quiz Maker

## Visão Geral

O ambiente de staging é separado de produção e serve como barreira antes de qualquer mudança chegar aos usuários reais.

```
feature branch → staging → validação → merge main → produção
```

## Ambientes

| Ambiente | Branch | URL | Banco de Dados |
|----------|--------|-----|----------------|
| Produção | `main` | quizmebaby.app | DB produção (Neon/PG) |
| Staging | `staging` | `<projeto>-git-staging-<team>.vercel.app` | DB staging (separado) |

## Fluxo de Deploy

1. **Feature branch** — desenvolvedor cria `feat/QMB-XXX-descricao` a partir de `staging`
2. **Pull Request para `staging`** — CI roda (typecheck + lint + build), revisão de código
3. **Merge em `staging`** — Vercel faz deploy automático para a URL de staging
4. **Validação** — QA manual na URL de staging, smoke test, verificação de migrations
5. **Pull Request de `staging` → `main`** — aprovação final
6. **Merge em `main`** — Vercel faz deploy automático para produção

## Configuração Vercel

### `vercel.json` (já configurado)

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "staging": true
    }
  }
}
```

### Variáveis de Ambiente no Vercel (setup manual necessário)

No dashboard Vercel → Settings → Environment Variables, configurar as seguintes variáveis com escopo **Preview / staging**:

| Variável | Staging | Produção |
|----------|---------|----------|
| `DATABASE_URL` | URL do banco staging (pool) | URL banco produção (pool) |
| `DIRECT_DATABASE_URL` | URL direta banco staging | URL direta banco produção |
| `NEXTAUTH_URL` | `https://<staging-url>.vercel.app` | `https://quizmebaby.app` |
| `NEXTAUTH_SECRET` | secret próprio do staging | secret de produção |
| `STRIPE_SECRET_KEY` | `sk_test_...` (test mode) | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | webhook secret do endpoint staging | webhook secret produção |
| `STRIPE_*_PRICE_ID` | price IDs do ambiente de teste | price IDs de produção |
| `OPENROUTER_API_KEY` | mesma ou chave com menor quota | chave principal |
| `OPENAI_API_KEY` | mesma ou chave com menor quota | chave principal |
| `UPLOADTHING_TOKEN` | token de app separado (opcional) | token de produção |
| `FIELD_ENCRYPTION_KEY` | chave própria do staging | chave de produção |
| `CLOUDFLARE_*` | mesma conta, namespace separado | namespace produção |

### Banco de Dados Staging

Recomendação: criar um database separado no mesmo provedor (Neon):

```bash
# Neon CLI ou dashboard
neon branches create --name staging --project-id <project-id>
```

Isso garante que `prisma migrate deploy` no staging nunca afeta o banco de produção.

### Webhook Stripe para Staging

Criar endpoint separado no Stripe Dashboard:
- URL: `https://<staging-url>.vercel.app/api/webhooks/stripe`
- Eventos: mesmos da produção
- Copiar o `whsec_...` gerado para `STRIPE_WEBHOOK_SECRET` no escopo staging do Vercel

## CI/CD

O workflow `.github/workflows/ci.yml` roda em:
- Push para `main` ou `staging`
- Pull Requests direcionados a `main` ou `staging`

Etapas: typecheck → lint → build (sem migrations — Vercel executa `prisma migrate deploy` no buildCommand).

## Proteção de Branch (recomendado)

No GitHub → Settings → Branches, adicionar regra para `staging`:
- Require pull request reviews before merging
- Require status checks to pass (CI)
- Do not allow bypassing the above settings

## Migrations

**Nunca usar `prisma db push` em produção.** Fluxo correto:

1. Criar migration: `npx prisma migrate dev --name <descricao>`
2. Fazer commit do arquivo em `prisma/migrations/`
3. Merge em `staging` → Vercel executa `prisma migrate deploy` no build
4. Validar staging
5. Merge em `main` → `prisma migrate deploy` roda em produção

Se uma migration quebrar staging, o deploy falha no Vercel antes de afetar produção.
