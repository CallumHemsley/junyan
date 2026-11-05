---
id: 74
title: Record playable neighbourhood demos with real audio
status: done
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

- Final capture complete on reviewed integrated source `7b27ca44a7ed5c9a0eebb45a6a06145beb381287`: normal opening; table rotation and placement; cat trust/reunion/cushion; lamp and toy repairs/stool; garden care, authentic four-customer restaurant day, next-day growth and planter. No prepared feature success state.
- Six verified H264/AAC exports: full 296.433s walkthrough; 130.700s combined tour; apartment 15.938s, cats 33.667s, repairs 48.678s, garden 32.433s. Every feature has an actual source waveform match; each individual clip plus both tours has a late match. All alignment differences <20ms, nonzero PCM, source/video SHA256 and ffprobe preserved in `docs/evidence/0074/final/`. Zero browser/network errors. Encoded speaking frames inspected for each location.
- Output stays ignored under `output/playwright/neighbourhood-tour/`; parent copies stable MP4s into the main checkout before worktree cleanup. Parent owns final permanent local server and same-origin port 5474 takeover. No physical speaker audition or independent Mandarin pronunciation review claimed by this agent.


## Local completion

Finished locally after the cloud handoff. The integrated game preserves restaurant progress across apartment, courtyard, workshop and rooftop visits, with shared journal, gifts and saves. Genuine offline voices are committed. Candidate `7b27ca4` passed 308 unit tests, a production build, 12 real production/offline cases and 34 original media/word-card regressions, all with zero skips or failures. Separate reviewers checked source, state recovery, real native playback and exact audio provenance. Actual gameplay demos with audio are verified. See [[evidence/0075/README]] for scope and receipts.

Automated signal, transcript and recorded-playback checks do not certify native Mandarin pronunciation. A separate listening pass is tracked by 0076; no native-listening approval is claimed.
