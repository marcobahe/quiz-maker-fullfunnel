# QuizMeBaby

## Database Migrations

This project uses **Prisma Migrate** for schema versioning. All schema changes go through versioned migrations in `prisma/migrations/`.

### Adding a new migration (local dev)

```bash
npx prisma migrate dev --name describe_your_change
```

This creates a new migration file and applies it to your local DB.

### Deploying migrations (production)

The Vercel build command runs `prisma migrate deploy` automatically on every deploy. It applies only pending (unapplied) migrations in order.

**Do NOT use `prisma db push` on production.** It bypasses versioning and risks silent schema drift.

### One-time baseline (already done — do not repeat)

When the project switched from `prisma db push` to `prisma migrate deploy` (QMB-65), the existing migrations were marked as applied via:

```bash
bash scripts/migrate-baseline.sh
```

This is a historical note. The script exists in `scripts/migrate-baseline.sh` for reference, but should not be re-run on a DB that is already tracking migrations.

---

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
