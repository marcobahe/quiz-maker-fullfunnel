# Edge Renderer (`quiz-edge-renderer`)

Cloudflare Worker que serve quizzes dinâmicos em `play.quizmebaby.app`.

## Setup

```bash
cd workers/edge-renderer
cp .env.example .env
# Preencha CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_API_TOKEN
npm install
```

## Desenvolvimento local

```bash
wrangler dev
# ou
npm run dev
```

## Deploy

```bash
wrangler deploy
```

**Nota:** O `account_id` não está hardcoded no `wrangler.toml`. O Wrangler usa a variável de ambiente `CLOUDFLARE_ACCOUNT_ID` automaticamente.

## Estrutura

- `src/index.ts` — entrypoint do Worker (roteamento + cache + KV lookup)
- `wrangler.toml` — configuração (sem `account_id` hardcoded)
- `docs/runbook.md` — playbook de operações e troubleshooting
