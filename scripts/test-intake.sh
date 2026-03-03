#!/usr/bin/env bash
# test-intake.sh — Smoke test for POST /api/sessions/process (mode=quick)
set -euo pipefail

PORT=3002
BASE_URL="http://localhost:$PORT"
ENDPOINT="$BASE_URL/api/sessions/process"
DEV_PID=""

cleanup() {
  if [[ -n "$DEV_PID" ]]; then
    echo "→ Killing dev server (PID $DEV_PID)..."
    kill "$DEV_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

# ── 1. Start dev server ────────────────────────────────────────────────────────
echo "→ Starting Next.js dev server on port $PORT..."
cd "$(dirname "$0")/.."
npm run dev -- --port "$PORT" &>/tmp/atrias-dev.log &
DEV_PID=$!

# ── 2. Wait for server to be ready (poll every 2s, max 30s) ──────────────────
echo "→ Waiting for server to be ready..."
READY=0
for i in $(seq 1 15); do
  if curl -sf "$BASE_URL" -o /dev/null 2>/dev/null; then
    READY=1
    break
  fi
  sleep 2
done

if [[ "$READY" -eq 0 ]]; then
  echo "✗ Server did not start within 30s. Check /tmp/atrias-dev.log"
  exit 1
fi
echo "✓ Server is up."

# ── 3. Send test POST (mode=quick) ───────────────────────────────────────────
echo "→ Sending test POST to $ENDPOINT..."
RESPONSE=$(curl -sf -X POST "$ENDPOINT" \
  -F "mode=quick" \
  -F "campaign=Test Campaign" \
  -F "sessionNumber=1" \
  -F "playDate=2026-03-01" \
  -F "quickWhat=Os heróis enfrentaram uma emboscada de bandidos na estrada para Veloria." \
  -F "quickWho=Aldric, Seraphina, Mira" \
  -F "quickFound=Um mapa parcial que leva a uma tumba esquecida." \
  -F "quickNext=Investigar a tumba antes que a Guilda das Sombras chegue primeiro." \
  2>/tmp/atrias-curl-err.log) || {
  echo "✗ curl failed. Response:"
  cat /tmp/atrias-curl-err.log
  exit 1
}

# ── 4. Pretty-print response ─────────────────────────────────────────────────
echo ""
echo "── Response ──────────────────────────────────────────────────────────────"
echo "$RESPONSE" | python3 -m json.tool || echo "$RESPONSE"
echo "──────────────────────────────────────────────────────────────────────────"
echo ""

# ── 5. Check for "title" in response ─────────────────────────────────────────
if echo "$RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); exit(0 if 'title' in d and d['title'] else 1)" 2>/dev/null; then
  echo "✅ PASS — response contains 'title'"
  EXIT_CODE=0
else
  echo "❌ FAIL — 'title' missing or empty in response"
  EXIT_CODE=1
fi

exit $EXIT_CODE
