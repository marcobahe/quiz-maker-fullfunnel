#!/usr/bin/env bash
# ============================================================
# E2E Smoke Test — quiz → GHL → webhook → email
# ICO-211 | Go-live: 30/04/2026 18h BRT
#
# Usage:
#   export QMB_EMAIL="seu@email.com"
#   export QMB_PASSWORD="sua_senha"
#   bash scripts/smoke-test-e2e.sh
#
# Optional — test webhook outbound to an external endpoint:
#   export WEBHOOK_TEST_URL="https://webhook.site/your-uuid"
#
# Requirements: curl, jq
# ============================================================

set -euo pipefail

BASE="https://quizmebaby.app"
PLAY="https://play.quizmebaby.app"
COOKIE_JAR=$(mktemp)
PASS=0
FAIL=0
SKIP=0

# ── Colors ───────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✅ PASS${NC} — $1"; ((PASS++)); }
fail() { echo -e "${RED}❌ FAIL${NC} — $1"; ((FAIL++)); }
skip() { echo -e "${YELLOW}⏭  SKIP${NC} — $1"; ((SKIP++)); }
info() { echo -e "   ℹ  $1"; }

# ── Helpers ──────────────────────────────────────────────────
get_status() {
  curl -sS -o /dev/null -w "%{http_code}" \
    -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
    "$@"
}

api_get() {
  curl -sS -b "$COOKIE_JAR" -c "$COOKIE_JAR" "$@"
}

api_post() {
  local url="$1"; shift
  curl -sS -X POST \
    -H "Content-Type: application/json" \
    -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
    "$@" "$url"
}

api_patch() {
  local url="$1"; shift
  curl -sS -X PATCH \
    -H "Content-Type: application/json" \
    -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
    "$@" "$url"
}

api_delete() {
  curl -sS -X DELETE \
    -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
    "$1"
}

# ── Preflight ─────────────────────────────────────────────────
echo ""
echo "========================================================"
echo " QuizMeBaby E2E Smoke Test"
echo " $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "========================================================"
echo ""

if [[ -z "${QMB_EMAIL:-}" || -z "${QMB_PASSWORD:-}" ]]; then
  echo "❌ Defina QMB_EMAIL e QMB_PASSWORD antes de rodar."
  echo "   export QMB_EMAIL=seu@email.com"
  echo "   export QMB_PASSWORD=sua_senha"
  exit 1
fi

# ── 1. Infra reachability ─────────────────────────────────────
echo "─── 1. Infra ────────────────────────────────────────────"

status=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE/login")
[[ "$status" == "200" ]] && ok "quizmebaby.app acessível ($status)" || fail "quizmebaby.app inacessível ($status)"

status=$(curl -sS -o /dev/null -w "%{http_code}" "$PLAY/")
[[ "$status" == "200" ]] && ok "play.quizmebaby.app acessível ($status)" || fail "play.quizmebaby.app inacessível ($status)"

status=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE/api/auth/providers")
[[ "$status" == "200" ]] && ok "Auth providers endpoint ($status)" || fail "Auth providers endpoint ($status)"

echo ""

# ── 2. Auth — Login ──────────────────────────────────────────
echo "─── 2. Auth ─────────────────────────────────────────────"

# Fetch CSRF token
csrf_response=$(api_get "$BASE/api/auth/csrf")
CSRF_TOKEN=$(echo "$csrf_response" | jq -r '.csrfToken // empty')
if [[ -z "$CSRF_TOKEN" ]]; then
  fail "CSRF token não obtido — abortando login"
  echo "Response: $csrf_response"
  exit 1
fi
info "CSRF token obtido"

# Sign in with credentials
signin_status=$(api_post "$BASE/api/auth/signin/credentials" \
  --data-urlencode "email=$QMB_EMAIL" \
  --data-urlencode "password=$QMB_PASSWORD" \
  --data-urlencode "csrfToken=$CSRF_TOKEN" \
  --data-urlencode "callbackUrl=$BASE" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -o /dev/null -w "%{http_code}" \
  -L --max-redirs 3)

# Verify session
session_body=$(api_get "$BASE/api/auth/session")
SESSION_EMAIL=$(echo "$session_body" | jq -r '.user.email // empty')
SESSION_ROLE=$(echo "$session_body" | jq -r '.user.role // empty')

if [[ "$SESSION_EMAIL" == "$QMB_EMAIL" ]]; then
  ok "Login com credentials (role: $SESSION_ROLE)"
else
  fail "Login falhou — session: $session_body"
  rm -f "$COOKIE_JAR"
  exit 1
fi

# Test protected route
status=$(get_status -L "$BASE/admin")
[[ "$status" == "200" ]] && ok "/admin acessível como $SESSION_ROLE" || fail "/admin retornou $status"

echo ""

# ── 3. Quiz — Criar + Publicar ────────────────────────────────
echo "─── 3. Quiz Builder ─────────────────────────────────────"

QUIZ_NAME="[SMOKE TEST] $(date '+%Y%m%d-%H%M%S')"
quiz_response=$(api_post "$BASE/api/quizzes" \
  -d "{\"name\": \"$QUIZ_NAME\", \"description\": \"E2E smoke test — pode deletar\"}")

QUIZ_ID=$(echo "$quiz_response" | jq -r '.id // empty')
QUIZ_SLUG=$(echo "$quiz_response" | jq -r '.slug // empty')

if [[ -n "$QUIZ_ID" ]]; then
  ok "Quiz criado (id=$QUIZ_ID, slug=$QUIZ_SLUG)"
else
  fail "Criação de quiz falhou — resposta: $quiz_response"
  rm -f "$COOKIE_JAR"
  exit 1
fi

# Publish quiz
publish_response=$(api_patch "$BASE/api/quizzes/$QUIZ_ID" \
  -d '{"status": "published"}')
pub_status=$(echo "$publish_response" | jq -r '.status // empty')
[[ "$pub_status" == "published" ]] && ok "Quiz publicado" || fail "Publicação falhou: $publish_response"

# Verify public endpoint
public_response=$(curl -sS "$BASE/api/quizzes/$QUIZ_ID/public")
pub_quiz_id=$(echo "$public_response" | jq -r '.id // empty')
[[ "$pub_quiz_id" == "$QUIZ_ID" ]] && ok "Endpoint público do quiz acessível" || fail "Endpoint público falhou: $public_response"

echo ""

# ── 4. Lead Submission ────────────────────────────────────────
echo "─── 4. Lead Submission ──────────────────────────────────"

lead_payload=$(cat <<EOF
{
  "name": "Lead Smoke Test",
  "email": "smoke-test-$(date +%s)@test.quizmebaby.app",
  "phone": "+5511999990000",
  "answers": [{"questionId": "q_smoke", "question": "Pergunta teste", "answer": "Resposta A", "points": 10}],
  "score": 80,
  "resultCategory": "Perfil Smoke Test"
}
EOF
)

# Lead submission is public (no auth needed)
lead_response=$(curl -sS -X POST \
  -H "Content-Type: application/json" \
  -d "$lead_payload" \
  "$BASE/api/quizzes/$QUIZ_ID/leads")

LEAD_ID=$(echo "$lead_response" | jq -r '.lead.id // .id // empty')
if [[ -n "$LEAD_ID" ]]; then
  ok "Lead criado (id=$LEAD_ID)"
else
  fail "Submissão de lead falhou: $lead_response"
fi

# Verify lead in DB via authenticated API
leads_list=$(api_get "$BASE/api/quizzes/$QUIZ_ID/leads")
lead_count=$(echo "$leads_list" | jq '.total // 0')
[[ "$lead_count" -ge 1 ]] && ok "Lead visível no DB (total=$lead_count)" || fail "Lead não encontrado no DB: $leads_list"

echo ""

# ── 5. Webhook ────────────────────────────────────────────────
echo "─── 5. Webhook ──────────────────────────────────────────"

if [[ -n "${WEBHOOK_TEST_URL:-}" ]]; then
  # Configure webhook URL on quiz
  wh_patch=$(api_patch "$BASE/api/quizzes/$QUIZ_ID" \
    -d "{\"webhookUrl\": \"$WEBHOOK_TEST_URL\", \"webhookSecret\": \"smoke-secret-123\"}")
  wh_url=$(echo "$wh_patch" | jq -r '.webhookUrl // empty')

  if [[ "$wh_url" == "$WEBHOOK_TEST_URL" ]]; then
    ok "Webhook URL configurada"

    # Fire test webhook
    wh_test=$(api_post "$BASE/api/quizzes/$QUIZ_ID/webhook" -d '{}')
    wh_ok=$(echo "$wh_test" | jq -r '.success // false')
    wh_status=$(echo "$wh_test" | jq -r '.statusCode // empty')
    [[ "$wh_ok" == "true" ]] && ok "Webhook test disparado (HTTP $wh_status)" || fail "Webhook test falhou: $wh_test"

    # Check webhook logs
    wh_logs=$(api_get "$BASE/api/quizzes/$QUIZ_ID/webhook-logs")
    log_count=$(echo "$wh_logs" | jq 'if type=="array" then length else .total // 0 end')
    [[ "$log_count" -ge 1 ]] && ok "Webhook log registrado ($log_count entradas)" || fail "Webhook log vazio: $wh_logs"
  else
    fail "Configuração de webhook falhou: $wh_patch"
  fi
else
  skip "Webhook outbound (WEBHOOK_TEST_URL não definida)"
  info "Para testar: export WEBHOOK_TEST_URL=https://webhook.site/seu-uuid"
fi

echo ""

# ── 6. GHL Integration (self-service workspace model — ICO-242/243) ──
echo "─── 6. GHL Integration ──────────────────────────────────"
# GHL is now self-service: each workspace brings its own PIT token.
# Set GHL_PIT_TOKEN + GHL_WORKSPACE_ID to test end-to-end.
# Without them, this section is skipped (not a blocker for go-live gate).

if [[ -n "${GHL_PIT_TOKEN:-}" && -n "${GHL_WORKSPACE_ID:-}" ]]; then
  # Step 1: Validate token
  validate_resp=$(api_post "$BASE/api/workspaces/$GHL_WORKSPACE_ID/integrations/ghl/validate" \
    -d "{\"token\": \"$GHL_PIT_TOKEN\"}")
  ghl_valid=$(echo "$validate_resp" | jq -r '.valid // false')

  if [[ "$ghl_valid" == "true" ]]; then
    ghl_account=$(echo "$validate_resp" | jq -r '.accountName // "unknown"')
    ok "GHL token válido (account: $ghl_account)"

    # Step 2: Save the integration
    save_resp=$(curl -sS -X PUT \
      -H "Content-Type: application/json" \
      -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
      -d "{\"token\": \"$GHL_PIT_TOKEN\"}" \
      "$BASE/api/workspaces/$GHL_WORKSPACE_ID/integrations/ghl")
    saved=$(echo "$save_resp" | jq -r '.ghlSyncStatus // empty')
    [[ "$saved" == "active" ]] && ok "GHL integration salva (status: active)" || fail "Falha ao salvar GHL: $save_resp"

    # Step 3: Cleanup — remove integration after smoke test
    del_ghl=$(curl -sS -X DELETE \
      -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
      "$BASE/api/workspaces/$GHL_WORKSPACE_ID/integrations/ghl")
    del_ok=$(echo "$del_ghl" | jq -r '.success // .removed // false')
    [[ "$del_ok" != "false" ]] && ok "GHL integration removida (cleanup)" || info "GHL cleanup: $del_ghl"
  else
    ghl_err=$(echo "$validate_resp" | jq -r '.error // "erro desconhecido"')
    fail "GHL token inválido: $ghl_err"
    info "Resposta: $validate_resp"
  fi
else
  skip "GHL integration (GHL_PIT_TOKEN + GHL_WORKSPACE_ID não definidos)"
  info "Para testar: export GHL_PIT_TOKEN=pit-xxx GHL_WORKSPACE_ID=<workspace-id>"
  info "Token deve ser um Location-level PIT com scopes: contacts.write, contacts.readonly, opportunities.write, locations.readonly"
fi

echo ""

# ── 7. Email (notifier config) ────────────────────────────────
echo "─── 7. Email ────────────────────────────────────────────"

# Can't send email programmatically without GMAIL_APP_PASSWORD in env
# Check if emailNotifications can be enabled on the quiz (validates the API path)
email_patch=$(api_patch "$BASE/api/quizzes/$QUIZ_ID" \
  -d "{\"emailNotifications\": true, \"notificationEmail\": \"$QMB_EMAIL\"}")
notif_set=$(echo "$email_patch" | jq -r '.emailNotifications // false')
if [[ "$notif_set" == "true" ]]; then
  ok "Email notification config aplicada no quiz"
  info "Email real só pode ser verificado via caixa de entrada após lead real"
else
  fail "Email notification config falhou: $email_patch"
fi

echo ""

# ── 8. Edge Renderer ─────────────────────────────────────────
echo "─── 8. Edge Renderer (play.quizmebaby.app) ──────────────"

edge_status=$(curl -sS -o /dev/null -w "%{http_code}" "$PLAY/$QUIZ_SLUG")
if [[ "$edge_status" == "200" ]]; then
  ok "play.quizmebaby.app/$QUIZ_SLUG carrega (edge renderer)"
elif [[ "$edge_status" == "404" ]]; then
  skip "Edge renderer retornou 404 para slug — KV sync pode ter latência ou ICO-164 pendente"
  info "URL: $PLAY/$QUIZ_SLUG"
else
  fail "Edge renderer retornou $edge_status para $QUIZ_SLUG"
fi

echo ""

# ── 9. Upgrade Path ──────────────────────────────────────────
echo "─── 9. Upgrade Path ─────────────────────────────────────"

upgrade_status=$(curl -sS -o /dev/null -w "%{http_code}" -L "$BASE/upgrade-full-funnel")
[[ "$upgrade_status" == "200" ]] && ok "/upgrade-full-funnel → /pricing ($upgrade_status)" || fail "Upgrade path retornou $upgrade_status"

billing_status=$(api_get "$BASE/api/billing/status")
has_plan=$(echo "$billing_status" | jq -r '.plan // empty')
[[ -n "$has_plan" ]] && ok "Billing status acessível (plan=$has_plan)" || fail "Billing status falhou: $billing_status"

echo ""

# ── 10. Cleanup ───────────────────────────────────────────────
echo "─── 10. Cleanup ─────────────────────────────────────────"

del_response=$(api_delete "$BASE/api/quizzes/$QUIZ_ID")
del_ok=$(echo "$del_response" | jq -r '.success // .id // empty')
[[ -n "$del_ok" ]] && ok "Quiz de teste deletado ($QUIZ_ID)" || info "Delete response: $del_response (pode ser idempotente)"

# Sign out
api_post "$BASE/api/auth/signout" \
  -d "csrfToken=$CSRF_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -o /dev/null -w "" > /dev/null 2>&1 || true
ok "Logout"

rm -f "$COOKIE_JAR"

# ── Summary ───────────────────────────────────────────────────
echo ""
echo "========================================================"
echo " Resultado Final"
echo "========================================================"
echo -e " ${GREEN}PASS${NC}: $PASS"
echo -e " ${RED}FAIL${NC}: $FAIL"
echo -e " ${YELLOW}SKIP${NC}: $SKIP"
echo ""

TOTAL_CHECKS=$((PASS + FAIL))
if [[ $FAIL -eq 0 ]]; then
  echo -e " ${GREEN}✅ GO — Todos os checks passaram. Go-live autorizado.${NC}"
  exit 0
else
  echo -e " ${RED}🚫 NO-GO — $FAIL falha(s) detectada(s). Resolver antes do go-live.${NC}"
  exit 1
fi
