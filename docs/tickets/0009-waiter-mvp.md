---
id: 9
title: Integrate and demonstrate the Mandarin waiter MVP
status: done
priority: high
type: feature
created: 2026-11-01
---

## Why
Build Callum's requested Pixel Plays waiter version of the MVP.

## Done when
- Walk between four tables and kitchen, collect Mandarin orders, pick up and deliver food, give change, journal words and progress to harder combinations.
- Pure rules tests and browser journeys pass, desktop and phone inspected, and a video demo is delivered.

## Notes
Owner: Codex root. Branch: codex/0009-waiter-mvp. Worktree: /Users/callumhemsley/Personal/junyan. Port: 5173. Subtickets 10 (rules), 11 (scene), 12 (content) reserved centrally. See decision 3.

- Delivered the actual Pixel Plays MIT rasteriser adaptation, four regulars, seven foods, twelve Mandarin orders across three difficulty levels, physical walking, kitchen pickup, delivery, change, word lookup, journal, IndexedDB saves and an offline PWA. No upstream music used.
- Three Sol 6.1 medium implementation delegates completed tickets 10–12. A fourth Sol 6.1 medium delegate cross-reviewed the integrated code without editing. Fixed both findings: off-grid walking connections near tables and end-of-day keyboard focus. Added regressions.
- Verification: `pnpm test` (35 passed), `pnpm test:e2e` (7 passed: desktop/phone journeys, walking regression, persistence and production offline/audio), `pnpm build`, and `git diff --check`. Inspected desktop and phone screenshots. Browser journeys and demo report no page errors. Production test hooks are absent.
- Demo: `output/playwright/junyan-waiter-demo.mp4`, about 82 seconds. Captures real UI interactions through day one and a two-food order on day two; Mandarin clips are remuxed at their recorded playback times because browser video capture omits audio. Artifacts are local and ignored by git.
- Learned: safe routing needs collision checks on connections from arbitrary keyboard positions, not just grid nodes. Static asset cache matching must account for `Vary: Origin` during offline reloads. Audio is offline macOS Tingting prototype TTS and still needs native-speaker review. No public deployment was performed.
