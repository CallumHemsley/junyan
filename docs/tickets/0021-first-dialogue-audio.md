---
id: 21
title: Fix first dialogue audio and interrupted playback errors
status: todo
priority: high
type: bug
created: 2026-11-01
---

## Why

Callum's first public playtest requests reliable first-dialogue audio, better character design and correct tray occlusion, plus a usability break review.

## Done when

- Requested behavior is verified against a repeatable reproduction or inspected render, with appropriate regression coverage.
- Applicable rules/browser checks pass; visual changes are inspected at phone and desktop sizes.
- Evidence, limitations and review findings are recorded before integration/publication.

## Notes

- Reserved centrally by parent on `codex/0018-character-voices`; writer must record own branch, worktree and strict port.
- Owner: Astra audio orchestrator; Sol 6.1 medium implementation worker.
- Fresh WebKit first visit with first WAV delayed 1500 ms, then replay while loading: original play rejects AbortError, replacement plays, but global audioError displays failure. Evidence: output/playwright/diagnosis/first-dialogue-interrupted.json/.png and runner .mjs. Normal first open passed WebKit/Chromium; autoplay timing remains a hypothesis, not a reproduced cause.
