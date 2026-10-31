#!/bin/sh
# Code-review a worker branch against the integration branch with a separate Codex instance.
# usage: orchestration/bin/review.sh <ticket-number> <slug> [base-ref]
set -eu
ticket="$1"; slug="$2"; base="${3:-codex/0006-mvp}"
root="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$root"
name="$ticket-$slug"; dir="$root/.worktrees/$name"
[ -d "$dir" ] || { echo "no worktree $dir" >&2; exit 2; }
mkdir -p "$root/orchestration/log"
out="$root/orchestration/log/review-$name.md"
basesha="$(git rev-parse "$base")"
echo "[$(date -u +%FT%TZ)] review start $name base=$basesha" >> "$root/orchestration/log/journal.md"
set +e
( cd "$dir" && codex review --ephemeral --skip-git-repo-check \
    -c 'approval_policy="never"' -c 'sandbox_mode="read-only"' \
    -c 'notify=[]' -c 'features.hooks=false' -c 'features.apps=false' \
    -m gpt-6-astra -c model_reasoning_effort=medium \
    --base "$basesha" ) > "$out" 2>&1
code=$?
set -e
echo "[$(date -u +%FT%TZ)] review end $name exit=$code -> $out" >> "$root/orchestration/log/journal.md"
cat "$out"
exit $code
