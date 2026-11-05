---
id: 74
title: Record playable neighbourhood demos with real audio
status: doing
priority: high
type: feature
created: 2026-11-05
---

## Why

Callum wants to test the new locations and watch video demonstrations with genuine in-game Mandarin audio.

## Done when

- A repeatable local capture tool demonstrates all four real integrated locations through their actual controls.
- Exported watchable videos contain genuine audible gameplay speech synchronized to the demonstrated interactions, with audio tracks verified rather than assumed.
- A normal playable local server and concise testing instructions are available; the video capture does not add debug code to production.
- Source/capture commands and verification metadata are preserved; wait for 0073 before claiming voiced demos complete.

## Notes

- Owner: local demo Sol Medium worker. Branch `codex/0074-neighbourhood-playable-demos`; worktree `/private/tmp/junyan-neighbourhood-demos`; ports 5474/5574 (strict).
- Exclusive ownership: new demo/capture tooling and output evidence, without modifying application, feature content or dependencies.
