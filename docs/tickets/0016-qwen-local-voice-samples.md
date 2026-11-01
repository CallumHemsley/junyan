---
id: 16
title: Generate local Qwen Mandarin samples
status: doing
priority: medium
type: explore
created: 2026-11-01
---

## Why

Generate authentic Mandarin comparison audio locally without paid provider credentials, as requested by Callum.

## Done when

- Shared lines in `scripts/voice-samples/lines.json` are rendered with real model inference.
- WAVs and provenance identify exact model, revision, voice and generation settings.
- Native reviewers receive samples; no prototype audio is substituted.

## Notes

- Reserved centrally for a Sol 6.1 medium worker in its delegated worktree. Offline batch; no dev server.
- Parent: ticket 0008. Hardware: Apple Silicon arm64, 16 GB unified memory; at least 50 GB disk free.
