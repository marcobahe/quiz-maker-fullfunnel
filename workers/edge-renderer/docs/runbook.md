# Edge Renderer Runbook

QuizMeBaby edge renderer (`quiz-edge-renderer`) — what to do when things break.

---

## Quick checks

### 1. Is the Worker up?

```bash
curl -s https://play.quizmebaby.app/healthz | jq .
```

Expected:
```json
{ "ok": true, "service": "quiz-edge-renderer" }
```

If this fails → check [Deploy section](#deploy).

### 2. Are KV bindings correct?

```bash
wrangler kv:key list --namespace-id 07070b407cf94db4a1419e7a1a87c447 | head
wrangler kv:key list --namespace-id d74ab364d6264846a749b6da9a579c1a | head
```

Both should return keys. Empty → backend stopped writing to KV; escalate to @Backend-Dev.

### 3. Tail live logs

```bash
wrangler tail --format pretty
```

Watch for `event=edge_request` with `cache_status=kv_miss` (expected for new quizzes) or `level=error` (not expected).

---

## Symptom: 5xx errors

### Likely causes

| Symptom | Likely cause | Fix |
|---|---|---|
| All routes 5xx | Worker crashed / deploy bad | Rollback to last known good commit, `wrangler deploy` |
| Only custom domains 5xx | DOMAIN_MAP KV empty / wrong zone | Check KV keys, check DNS (Cloudflare dash) |
| Only specific quiz 5xx | QUIZ_HTML KV entry missing / corrupt | Re-publish quiz from backend |
| Sporadic 5xx | CF PoP issue | Usually transient; check [Cloudflare Status](https://www.cloudflarestatus.com) |
| High latency (>200ms) | Cold cache on high-traffic quiz | Run cache warm: `npx tsx scripts/warm-cache.ts` |

### Rollback procedure

```bash
cd workers/edge-renderer
git log --oneline -5          # find last good commit
git checkout <last-good>    # or revert the bad commit
wrangler deploy
```

Verify:
```bash
curl -I https://play.quizmebaby.app/healthz
```

---

## Symptom: Stale quiz content (editor updated but edge shows old version)

**Root cause:** Edge cache still holds old HTML; KV was updated but cache not invalidated.

**Fix:**

1. **Single quiz:**
   ```bash
   npx tsx scripts/invalidate-quiz.ts <slug>
   ```

2. **Bulk / all quizzes:**
   ```bash
   npx tsx scripts/warm-cache.ts
   ```

**Prevention:** Backend dispatcher should call `POST /_ops/invalidate` after every quiz publish/update.

---

## Symptom: Custom domain not resolving

1. Check DNS: custom domain CNAME must point to `play.quizmebaby.app` (or orange-cloud A/AAAA).
2. Check DOMAIN_MAP KV: `wrangler kv:key get <domain> --namespace-id d74ab364d6264846a749b6da9a579c1a`
3. Check zone is active in Cloudflare dash (zone_id = `79d982ba32071fe8e6ab6268d18d7361`).

---

## Metrics / observability

Structured logs are emitted as JSON lines. Filter with `wrangler tail` or CF Logs:

```bash
# Cache hit ratio (manual — pipe to jq or grep)
wrangler tail | grep '"event":"edge_request"'

# Fields available:
#   cache_status: hit | miss | kv_miss
#   latency_ms:   request latency
#   host:         request hostname
#   slug:         quiz slug
```

For percentile dashboards, send logs to a SIEM or use Cloudflare Analytics.

---

## Ops endpoints

| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /healthz` | none | Health check |
| `POST /_ops/invalidate` | `Bearer $OPS_SECRET` | Purge edge cache for one quiz |
| `POST /_ops/warm` | `Bearer $OPS_SECRET` | Warm edge cache from URL list |

Set `OPS_SECRET` via:
```bash
wrangler secret put OPS_SECRET
```

---

## Escalation

| Issue | Escalate to |
|---|---|
| KV data missing / stale | @Backend-Dev |
| DNS / zone / SSL | @DevOps |
| Worker 5xx after rollback | @CTO |
| Architecture decision (edge vs origin) | @CTO |
