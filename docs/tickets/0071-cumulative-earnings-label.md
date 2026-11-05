---
id: 71
title: Label restaurant earnings as cumulative
status: done
priority: low
type: bug
created: 2026-11-05
---

## Why

The day-two summary shows lifetime earnings beneath a daily summary heading, which can be mistaken for that day's receipts.

## Done when

- [x] Explicitly label the existing lifetime total in Chinese; day-one 10 and day-two receipts19 result in labelled cumulative29. Preserve earnings arithmetic, save compatibility and day progression. Keep wording segmented/tappable where existing content pattern requires it, and do not introduce silent spoken dialogue. Add focused browser regression and inspect phone/desktop summary.
- [ ] Independent no-edit review confirms the exact head; central lead coordinates merge after checks. No manual deployment.

## Notes

Central lead assigns one Sol Medium cloud writer after App lease handoff; serialize with0066. One writer, branch and cloud checkout. Branch `codex/0071-cumulative-earnings-label`, strict port 5471. Estimate 2–4 hours plus review. See [[plans/neighbourhood-coordination]]. This allocation follows maintenance's observed day-one/day-two real UI review; subjective fun/retention remains unproven. Node22, no GitHub CLI, no dependency changes.

Writer: earnings_writer. Cloud worktree `/workspace/junyan-earnings`, branch `codex/0071-cumulative-earnings-label`, dev 5471 / preview 5571. Reproduce two completed days in the real browser, then change only the existing earnings chrome.

Both existing chrome labels now read `累计进账`. The two-day browser regression serves all eight tables through normal controls and reads test hooks only to observe orders and state. Seed 42 yields receipts 10 and 19, with cumulative totals 10 and 29. Existing save, economy and audio code are unchanged.

Verification uses cloud Chromium, Node 22, strict dev 5471 / preview 5571. The complete 206-test unit suite passes on the maintenance base `cdb8498`. Central review and merge remain with the lead. Screenshot evidence is in `docs/evidence/0071/`.

The focused browser regression passes on desktop and phone. Both day-two screenshots show `累计进账 29 块` with intact layout. The existing desktop opening, waiter, persistence and navigation journeys also pass. All seven phone calm-UI checks pass.
