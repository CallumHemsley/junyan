#!/bin/sh
# Spawn one Codex worker on a ticket, in its own worktree inside this clone.
# usage: orchestration/bin/worker.sh <ticket-number> <slug> [prompt-file]
#   creates .worktrees/<ticket>-<slug> on branch codex/<ticket>-<slug> from HEAD,
#   runs codex exec (gpt-6.1-sol) with the prompt, logs to orchestration/log/.
set -eu
ticket="$1"; slug="$2"; prompt="${3:-orchestration/prompts/$ticket.md}"
root="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$root"
name="$ticket-$slug"; branch="codex/$name"; dir="$root/.worktrees/$name"
mkdir -p "$root/.worktrees" "$root/orchestration/log"
grep -qx '.worktrees/' .gitignore 2>/dev/null || echo '.worktrees/' >> .gitignore
if [ ! -d "$dir" ]; then
  if git show-ref --quiet "refs/heads/$branch"; then git worktree add "$dir" "$branch"; else git worktree add -b "$branch" "$dir" HEAD; fi
fi
[ -f "$prompt" ] || { echo "no prompt file: $prompt" >&2; exit 2; }
log="$root/orchestration/log/worker-$name.jsonl"; out="$root/orchestration/log/worker-$name.md"
echo "[$(date -u +%FT%TZ)] worker start $name" >> "$root/orchestration/log/journal.md"
set +e
codex exec --json --ephemeral --skip-git-repo-check \
  -C "$dir" -s workspace-write \
  -c 'approval_policy="never"' -c 'sandbox_workspace_write.network_access=true' \
  -c 'notify=[]' -c 'features.hooks=false' -c 'features.apps=false' \
  -m gpt-6.1-sol -c model_reasoning_effort=high \
  -o "$out" - < "$prompt" > "$log" 2>&1
code=$?
set -e
echo "[$(date -u +%FT%TZ)] worker end $name exit=$code" >> "$root/orchestration/log/journal.md"
echo "exit $code" >> "$log"
exit $code
