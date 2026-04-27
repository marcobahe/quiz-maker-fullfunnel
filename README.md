# QuizMeBaby

Plataforma SaaS de quiz lead-gen. Next.js + Prisma + Postgres + Vercel.

## CI (GitHub Actions)

O pipeline CI roda automaticamente em todo `push` e `pull_request` para `main` e `staging`.

**Arquivo:** `.github/workflows/ci.yml`

### Steps

| Step | Comando | O que faz |
|---|---|---|
| Install | `npm ci` | Instala dependências exatas do `package-lock.json` |
| Prisma generate | `npx prisma generate` | Gera o Prisma Client com o schema atual |
| Typecheck | `npm run typecheck` | `tsc --noEmit` — verifica tipos sem compilar |
| Lint | `npm run lint` | `next lint` — valida regras ESLint do Next.js |
| Build | `npm run build` | `next build` — verifica que a app compila sem erros |

### Variáveis de ambiente no CI

O pipeline usa **valores dummy** para variáveis obrigatórias (DATABASE_URL, NEXTAUTH_SECRET, Stripe keys, etc.). Esses valores apenas satisfazem as validações de formato — **nenhuma conexão real é feita**.

As variáveis de produção ficam no Vercel e nunca são commitadas.

### Por que CI e não apenas Vercel auto-deploy?

O Vercel faz deploy de qualquer push, mesmo com build quebrado. O CI garante que `next build` e `tsc` passam **antes** de chegar em produção, detectando problemas na PR.

## Desenvolvimento local

```bash
cp .env.example .env.local
# Preencha DATABASE_URL e demais vars

npm install
npm run dev
```

## Deploy

Deploy automático via Vercel no push para `main`. Configure branch protection no GitHub para exigir CI verde antes do merge.
