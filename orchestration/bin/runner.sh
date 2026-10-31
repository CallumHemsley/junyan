#!/bin/sh
# Job runner: runs OUTSIDE any Codex sandbox and executes only the four known scripts
# on behalf of the sandboxed orchestrator, which cannot spawn codex itself.
#
# Protocol (all paths relative to the repo root):
#   orchestration/queue/<id>.job      one line: "worker <ticket> <slug>" | "review <ticket> <slug> [base]" | "verify" | "grade"
#   orchestration/queue/<id>.started  written when the job starts (contains the pid)
#   orchestration/queue/<id>.done     written when it ends: "exit <code>" and the log path
#   orchestration/queue/STOP          stops the runner after running jobs finish
# At most MAX_WORKERS "worker" jobs run at once; other kinds run at most one at a time each.
set -u
root="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$root"
q="$root/orchestration/queue"; mkdir -p "$q" "$root/orchestration/log"
MAX_WORKERS="${MAX_WORKERS:-3}"
echo "[$(date -u +%FT%TZ)] runner start pid=$$ max_workers=$MAX_WORKERS" >> orchestration/log/journal.md
count_running() { n=0; for s in "$q"/*.started; do [ -f "$s" ] || continue; id="${s%.started}"; [ -f "$id.done" ] && continue; kind="$(head -1 "$id.job" 2>/dev/null | awk '{print $1}')"; [ "$kind" = "$1" ] && n=$((n+1)); done; echo $n; }
valid() { printf '%s' "$1" | grep -Eq '^[A-Za-z0-9._/-]+$'; }
run_job() { # id kind args...
  id="$1"; kind="$2"; shift 2
  log="$root/orchestration/log/job-$(basename "$id")-$kind.log"
  (
    case "$kind" in
      worker) sh "$root/orchestration/bin/worker.sh" "$@" ;;
      review) sh "$root/orchestration/bin/review.sh" "$@" ;;
      verify) sh "$root/orchestration/bin/verify.sh" ;;
      grade)  sh "$root/orchestration/bin/grade.sh" ;;
      *) echo "unknown kind $kind"; exit 2 ;;
    esac
    code=$?
    printf 'exit %s\nlog %s\n' "$code" "$log" > "$id.done"
  ) > "$log" 2>&1 &
  echo "pid $!" > "$id.started"
  echo "[$(date -u +%FT%TZ)] runner started job $(basename "$id") ($kind $*) pid=$!" >> orchestration/log/journal.md
}
while :; do
  [ -f "$q/STOP" ] && { echo "[$(date -u +%FT%TZ)] runner stop requested" >> orchestration/log/journal.md; break; }
  for j in "$q"/*.job; do
    [ -f "$j" ] || continue
    id="${j%.job}"; [ -f "$id.started" ] && continue
    line="$(head -1 "$j")"; set -- $line; kind="${1:-}"; [ $# -ge 1 ] || continue; shift
    ok=1; for a in "$kind" "$@"; do valid "$a" || ok=0; done
    [ $ok -eq 1 ] || { printf 'exit 2\nlog invalid job line\n' > "$id.done"; echo "pid 0" > "$id.started"; continue; }
    case "$kind" in
      worker) [ "$(count_running worker)" -lt "$MAX_WORKERS" ] || continue; [ $# -ge 2 ] || { printf 'exit 2\nlog worker needs ticket and slug\n' > "$id.done"; echo "pid 0" > "$id.started"; continue; } ;;
      review) [ "$(count_running review)" -lt 1 ] || continue; [ $# -ge 2 ] || { printf 'exit 2\nlog review needs ticket and slug\n' > "$id.done"; echo "pid 0" > "$id.started"; continue; } ;;
      verify|grade) [ "$(count_running "$kind")" -lt 1 ] || continue ;;
      *) printf 'exit 2\nlog unknown kind %s\n' "$kind" > "$id.done"; echo "pid 0" > "$id.started"; continue ;;
    esac
    run_job "$id" "$kind" "$@"
  done
  sleep 10
done
echo "[$(date -u +%FT%TZ)] runner exit" >> orchestration/log/journal.md
