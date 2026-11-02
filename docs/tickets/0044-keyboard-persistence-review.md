---
id: 44
title: Independently verify keyboard and immediate-reload fixes
status: done
priority: high
type: chore
created: 2026-11-02
---

## Why

The 0037/0042 App changes alter keyboard handling and persistence. The immediate-reload case needs independent real-UI proof without waiting for IndexedDB.

## Done when

Review c1a4fb7 against its baseline, prove production no-wait reload on desktop/phone Chromium and silent-PCM WebKit, check blocked/aborted storage and keyboard/modal regressions, and return concrete findings or acceptance. No production edits by reviewer.

## Notes

- Owner: independent Sol 6.1 medium reviewer; branch/worktree recorded on start.
- Review checkout: `t3/review-keyboard-persistence`, `/Users/callumhemsley/.t3/worktrees/junyan/t3-2a0ff6a2`; parent `5167138`, worker applied as `8a5106a`. Independent checks completed on owned ports 5252/5253.
- Review completed: [[reviews/0044-keyboard-persistence-review]]. **ISSUES**, with no new production regression established: native queued-IDB startup can hang despite a valid checkpoint; WebKit can intermittently restore modal focus to BODY (also reproduced on historical baseline).
- Applied authorized future save worker `0b79e3362e75d2fe3cad3572f964afd80e394144` unchanged as `865c452c053daf5cd42d7d0dbb2d46bbc58d3333` for compatibility. Its synthetic blocked-open recovery passes; native queued-open starvation remains.
- Independently reproduced original no-hook production word loss on archived `5dfad15` in all four Chromium/WebKit desktop/390px cells. Worker and combined builds retain 包子 after the exact immediate reload in all four cells, including aborted writes. No storage poll/assertion/sleep between tap and reload.
- Worker units 88/88; combined units 106/106; both builds pass. Combined Chromium keyboard/save suite 22/22. Broad suite 104 passed / 4 skipped / 1 landscape failure, followed by 2/2 isolated landscape passes; do not call the broad run green. Independent native WebKit service/payment/summary routes pass with the opener-return limitation explicitly isolated.
- Learned: clean console and simulated `onblocked` tests do not prove bounded native startup; Chromium focus success does not establish WebKit opener restoration. Parent combined integration gate remains required. Review-only receipt contains this ticket and the report; local scripts/screenshots/logs remain ignored evidence. Owned processes cleaned; no push/deploy/AWS or dependency updates.
- Ports 5252 dev / 5253 preview, strict and owned. All browser testing silent: Chromium --mute-audio; WebKit valid silent PCM fixture. Never change system volume or WAVs.
- Preserve actual Pixel Plays, approved characters, all85WAVs and Mandarin-only calm UI. No push/deploy/AWS, dependencies or child agents.
