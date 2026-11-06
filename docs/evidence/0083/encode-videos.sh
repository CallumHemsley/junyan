#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
for video_source in runtime/desktop-traversal.webm runtime/phone-traversal.webm stairs/desktop-stairs.webm stairs/phone-stairs.webm; do
  ffmpeg -y -i "$video_source" -an -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -movflags +faststart "${video_source%.webm}.mp4" -loglevel error
done
