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

- Capture pipeline rehearsal passed on accepted integrated source `986be57`: 29.476s H264/AAC, 430 real frames (14.59 samples/s), browser errors zero. Export PCM RMS 0.02946, peak 0.41884. The actual order waveform correlates 0.999523 with its played source, 16.5ms from the logged playback event. Screenshot inspected during speech. No physical speaker or Mandarin pronunciation review claimed.
- Learned: MediaRecorder can discard initial empty graph time. A zero-valued continuous source fixes the clock before the first game sound; the export now asserts <120ms source alignment. Final four-feature recording remains pending ticket 0073 and parent consolidation.
