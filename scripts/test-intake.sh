#!/usr/bin/env bash
# test-intake.sh — Smoke test for the Atrias Wiki Pena Mágica intake pipeline
#
# Tests: POST /api/sessions/process with mode=quick
# Expected response: { title, summary, keyEvents[], quotes[], cliffhanger, matchedEntities[] }
#
# Usage: ./scripts/test-intake.sh

set -euo pipefail

PORT=3002
API_URL="http://localhost:$PORT/api/sessions/process"
LOG_FILE="/tmp/atrias-dev-server.log"
SERVER_PID=""

cleanup() {
  if [[ -n "$SERVER_PID" ]]; then
    echo "→ Stopping dev server (pid $SERVER_PID)..."
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

# ── 1. Start dev server ──────────────────────────────────────────────────────
echo "→ Starting Next.js dev server on port $PORT..."
cd "$(dirname "$0")/.."
npm run dev -- --port "$PORT" > "$LOG_FILE" 2>&1 &
SERVER_PID=$!

# ── 2. Wait for server to be ready ──────────────────────────────────────────
echo "→ Waiting for server (max 40s)..."
for i in $(seq 1 20); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT" --max-time 2 2>/dev/null || echo "000")
  if echo "$STATUS" | grep -qE "^[23]"; then
    echo "   Ready after $((i*2))s"
    break
  fi
  if [[ $i -eq 20 ]]; then
    echo "FAIL — Server did not start within 40s"
    tail -20 "$LOG_FILE"
    exit 1
  fi
  sleep 2
done

# ── 3. Send test request ─────────────────────────────────────────────────────
echo ""
echo "→ POSTing to $API_URL (mode=quick)..."
RESPONSE=$(curl -s -X POST "$API_URL" \
  -F "mode=quick" \
  -F "campaign=Teste Automatizado" \
  -F "sessionNumber=1" \
  -F "playDate=2026-03-01" \
  -F "quickWhat=Os herois chegaram a cidade de Neverwinter e enfrentaram guardas corruptos" \
  -F "quickWho=Santiago, Mira, Aldric" \
  -F "quickFound=Um artefato antigo de origem desconhecida no templo" \
  -F "quickNext=Investigar o paradeiro do Arquimago Khayzam")

# ── 4. Print response ────────────────────────────────────────────────────────
echo ""
echo "=== RESPONSE ==="
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo "================"

# ── 5. Validate ──────────────────────────────────────────────────────────────
echo ""
if echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
assert 'title' in data, 'missing title'
assert 'summary' in data, 'missing summary'
assert 'keyEvents' in data, 'missing keyEvents'
assert 'cliffhanger' in data, 'missing cliffhanger'
print('title:', data['title'][:60])
print('keyEvents:', len(data['keyEvents']), 'events')
print('matchedEntities:', len(data.get('matchedEntities', [])), 'matched')
" 2>&1; then
  echo ""
  echo "PASS — Pena Magica intake pipeline is working"
  exit 0
else
  echo ""
  echo "FAIL — Response missing expected fields"
  exit 1
fi
