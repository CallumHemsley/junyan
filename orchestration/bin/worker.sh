#!/bin/sh
# Spawn one Codex worker on a ticket, in its own local clone inside this repo.
# usage: orchestration/bin/worker.sh <ticket-number> <slug> [prompt-file]
#   clones this repo to .worktrees/<ticket>-<slug> on branch codex/<ticket>-<slug> from HEAD
#   (a clone, not a git worktree, so the worker's sandbox can write its own .git),
#   runs codex exec (gpt-6.1-sol) with the prompt, logs to orchestration/log/.
#   Afterwards: git fetch .worktrees/<name> codex/<name> && git merge --no-ff FETCH_HEAD
set -eu
ticket="$1"; slug="$2"; prompt="${3:-orchestration/prompts/$ticket.md}"
root="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$root"
name="$ticket-$slug"; branch="codex/$name"; dir="$root/.worktrees/$name"
mkdir -p "$root/.worktrees" "$root/orchestration/log"
grep -qx '.worktrees/' .gitignore 2>/dev/null || echo '.worktrees/' >> .gitignore
if [ ! -d "$dir" ]; then
  git clone -q "$root" "$dir"
  git -C "$dir" checkout -q -b "$branch"
else
  git -C "$dir" checkout -q "$branch" 2>/dev/null || true
fi
mkdir -p "$HOME/Library/pnpm" "$HOME/.cache" "$HOME/.npm" "$HOME/Library/Caches/ms-playwright"
[ -f "$prompt" ] || { echo "no prompt file: $prompt" >&2; exit 2; }
log="$root/orchestration/log/worker-$name.jsonl"; out="$root/orchestration/log/worker-$name.md"
echo "[$(date -u +%FT%TZ)] worker start $name" >> "$root/orchestration/log/journal.md"
set +e
roots="[\"$HOME/Library/pnpm\",\"$HOME/.cache\",\"$HOME/.npm\",\"$HOME/Library/Caches/ms-playwright\"]"
sh "$root/orchestration/bin/codex-run.sh" exec --json --ephemeral \
  -C "$dir" -s workspace-write -c 'sandbox_workspace_write.network_access=true' \
  -c "sandbox_workspace_write.writable_roots=$roots" \
  -m gpt-6.1-sol -c model_reasoning_effort=high \
  -o "$out" - < "$prompt" > "$log" 2>&1
code=$?
# The worker's sandbox cannot write .git, so commit its output here on its behalf.
if [ -n "$(git -C "$dir" status --porcelain)" ]; then
  git -C "$dir" add -A && git -C "$dir" -c user.name="codex worker" -c user.email="codex@local" commit -q -m "Ticket $ticket ($slug): worker output" && echo "[$(date -u +%FT%TZ)] committed $name $(git -C "$dir" rev-parse --short HEAD)" >> "$root/orchestration/log/journal.md"
fi
set -e
echo "[$(date -u +%FT%TZ)] worker end $name exit=$code" >> "$root/orchestration/log/journal.md"
echo "exit $code" >> "$log"
exit $code
