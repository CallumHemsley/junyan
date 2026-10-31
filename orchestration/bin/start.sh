#!/bin/sh
# Start (or restart) the MVP build in the orchestrator clone.
# usage: orchestration/bin/start.sh [clone-dir]   (default: ../junyan-mvp next to this repo)
# Starts the job runner if it is not running, then the orchestrator (gpt-6-astra, high) in the background.
set -eu
here="$(cd "$(dirname "$0")/../.." && pwd)"
clone="${1:-$(dirname "$here")/junyan-mvp}"
cd "$clone"
mkdir -p orchestration/log orchestration/queue orchestration/prompts
if ! pgrep -f "orchestration/bin/runner.sh" >/dev/null 2>&1; then
  nohup sh orchestration/bin/runner.sh > orchestration/log/runner.out 2>&1 &
  echo "runner started pid $!"
else
  echo "runner already running"
fi
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
nohup sh orchestration/bin/codex-run.sh exec --json -C "$clone" -s workspace-write \
  -c 'sandbox_workspace_write.network_access=true' \
  -m gpt-6-astra -c model_reasoning_effort=high \
  -o "orchestration/log/orchestrator-$stamp.md" - < orchestration/prompts/ORCHESTRATOR.md \
  > "orchestration/log/orchestrator-$stamp.jsonl" 2>&1 &
echo "orchestrator started pid $! -> orchestration/log/orchestrator-$stamp.jsonl"
echo "[$(date -u +%FT%TZ)] orchestrator start pid=$! log=orchestration/log/orchestrator-$stamp.jsonl" >> orchestration/log/journal.md
