#!/bin/sh
# Regenerates the audio clips for the counter paper prototype from lines.tsv
# using macOS text-to-speech. Run from anywhere:  sh make-audio.sh
set -eu
cd "$(dirname "$0")"
mkdir -p audio
tail -n +2 lines.tsv | while IFS="$(printf '\t')" read -r id speaker voice rate text; do
  [ -n "$id" ] || continue
  say -v "$voice" -r "$rate" -o "audio/$id.m4a" --file-format=m4af "$text"
  printf '%s\t%s\n' "$id" "$text"
done
echo "wrote $(ls audio | wc -l | tr -d ' ') clips to $(pwd)/audio"
