#!/bin/sh
# Build, test, run the Playwright journey and collect screenshots into verify/.
# Delegates to the app's own `pnpm verify` once it exists; falls back to the parts that do.
set -u
root="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$root"
mkdir -p verify orchestration/log
stamp="$(date -u +%Y%m%dT%H%M%SZ)"; log="orchestration/log/verify-$stamp.log"
echo "[$(date -u +%FT%TZ)] verify start" >> orchestration/log/journal.md
{
  if [ ! -f package.json ]; then echo "no package.json yet"; exit 3; fi
  pnpm install --frozen-lockfile 2>&1 || pnpm install 2>&1
  if grep -q '"verify"' package.json; then
    pnpm verify 2>&1; code=$?
  else
    code=0
    grep -q '"typecheck"' package.json && { pnpm typecheck 2>&1 || code=1; }
    grep -q '"test"' package.json && { pnpm test 2>&1 || code=1; }
    grep -q '"build"' package.json && { pnpm build 2>&1 || code=1; }
    grep -q '"e2e"' package.json && { pnpm e2e 2>&1 || code=1; }
  fi
  echo "verify exit $code"
  ls -la verify 2>/dev/null
  exit $code
} > "$log" 2>&1
code=$?
echo "[$(date -u +%FT%TZ)] verify end exit=$code -> $log" >> orchestration/log/journal.md
tail -40 "$log"
exit $code
