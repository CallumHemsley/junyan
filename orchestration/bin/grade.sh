#!/bin/sh
# Grade how fun the current build is, with screenshots, against orchestration/grading-rubric.md.
# usage: orchestration/bin/grade.sh   (reads verify/*.png, writes orchestration/log/grade-<stamp>.json and .md)
set -u
root="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$root"
mkdir -p orchestration/log
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
imgs=""; n=0
for f in verify/*.png; do [ -f "$f" ] || continue; imgs="$imgs -i $f"; n=$((n+1)); [ $n -ge 12 ] && break; done
[ $n -gt 0 ] || { echo "no screenshots in verify/" >&2; exit 2; }
prompt="You are the fun grader for the Junyan MVP. Read orchestration/grading-rubric.md, then AGENTS.md, then look at the attached screenshots (phone and desktop moments of the current build), read verify/journey.log if present and skim src/ to see how motion, sound and feedback are actually implemented (do not trust the screenshots alone for motion). Grade exactly as the rubric says. Be demanding: an 8 means a reviewer would praise it. Reply with JSON only, matching orchestration/bin/grade.schema.json."
echo "[$(date -u +%FT%TZ)] grade start ($n screenshots)" >> orchestration/log/journal.md
set +e
# shellcheck disable=SC2086
printf '%s' "$prompt" > "orchestration/log/grade-$stamp.prompt.txt"
sh "$root/orchestration/bin/codex-run.sh" exec --ephemeral -C "$root" -s read-only \
  -m gpt-6-astra -c model_reasoning_effort=high \
  --output-schema orchestration/bin/grade.schema.json \
  -o "orchestration/log/grade-$stamp.json" $imgs - < "orchestration/log/grade-$stamp.prompt.txt" > "orchestration/log/grade-$stamp.jsonl" 2>&1
code=$?
set -e
echo "[$(date -u +%FT%TZ)] grade end exit=$code -> orchestration/log/grade-$stamp.json" >> orchestration/log/journal.md
cat "orchestration/log/grade-$stamp.json"
exit $code
