# ICO-220 Auditoria: Zod Validation + Rate Limits em Endpoints Publicos

**Data:** 2026-04-24
**Auditor:** Backend-Helper
**Branch:** main

---

## 1. Resumo Executivo

Auditoria de 51 arquivos de API routes. Foram identificados 7 endpoints publicos e 6 endpoints abertos sem autenticacao.

**Severidade:**
- CRITICO: 6 endpoints sem autenticacao que permitem leitura/escrita de dados sensiveis
- ALTO: 6 endpoints publicos sem Zod validation
- MEDIO: 6 endpoints publicos sem rate limiting

---

## 2. Inventario de Endpoints por Visibilidade

### 2.1 Endpoints Publicos (sem auth)

| # | Rota | Metodo | Auth | Zod | Rate Limit | Risco |
|---|------|--------|------|-----|------------|-------|
| 1 | /api/auth/register | POST | NAO | SIM | SIM (3/IP/min) | OK |
| 2 | /api/domains/resolve | GET | SECRET HEADER | NAO | NAO | OK (internal) |
| 3 | /api/quizzes/[id]/public | GET | NAO | SIM | SIM (20/IP/min) | OK |
| 4 | /api/quizzes/[id]/leads | POST | NAO | SIM | SIM (5/IP/min) | OK |
| 5 | /api/quizzes/[id]/ai-analyze | POST | NAO | SIM | SIM (10/IP/min + 10/quiz/min) | OK |
| 6 | /api/billing/webhook | POST | NAO | NAO | NAO | OK (Stripe sig) |
| 7 | /api/auth/[...nextauth] | ALL | NAO | N/A | N/A | Framework |
| 8 | /api/quizzes/[id]/analytics | POST | NAO | SIM | SIM (30/IP/min) | OK |

### 2.2 Endpoints Autenticados (apos fix)

| # | Rota | Metodos | Auth |
|---|------|---------|------|
| 9 | /api/quizzes/[id]/integrations | GET, POST | SIM + ownership |
| 10 | /api/quizzes/[id]/integrations/[iid] | PUT, DELETE | SIM + ownership |
| 11 | /api/quizzes/[id]/integrations/[iid]/test | POST | SIM + ownership + RL |
| 12 | /api/quizzes/[id]/analytics | GET | SIM + ownership |

---

## 3. Modificacoes Aplicadas

### P1 — CRITICO
- Auth + ownership em integrations (3 arquivos)
- Auth + ownership em analytics GET
- Rate limit 5/IP/min em integrations/test

### P2 — ALTO
- Zod + rate limit 3/IP/min em auth/register
- Zod param + rate limit 20/IP/min em quizzes/public
- Zod body + rate limit IP (10/IP/min) em ai-analyze
- Zod body + rate limit 30/IP/min em analytics POST

### P3 — ADIADO pos-launch
- Migracao para @upstash/ratelimit
- Zod em domains/resolve
