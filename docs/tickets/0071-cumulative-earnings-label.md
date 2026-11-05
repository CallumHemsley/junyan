---
id: 71
title: Label restaurant earnings as cumulative
status: todo
priority: low
type: bug
created: 2026-11-05
---

## Why

The day-two summary shows lifetime earnings beneath a daily summary heading, which can be mistaken for that day's receipts.

## Done when

- [ ] Explicitly label the existing lifetime total in Chinese; day-one 10 and day-two receipts19 result in labelled cumulative29. Preserve earnings arithmetic, save compatibility and day progression. Keep wording segmented/tappable where existing content pattern requires it, and do not introduce silent spoken dialogue. Add focused browser regression and inspect phone/desktop summary.
- [ ] Independent no-edit review confirms the exact head; central lead coordinates merge after checks. No manual deployment.

## Notes

Central lead assigns one Sol Medium cloud writer after App lease handoff; serialize with0066. One writer, branch and cloud checkout. Branch `codex/0071-cumulative-earnings-label`, strict port 5471. Estimate 2–4 hours plus review. See [[plans/neighbourhood-coordination]]. This allocation follows maintenance's observed day-one/day-two real UI review; subjective fun/retention remains unproven. Node22, no GitHub CLI, no dependency changes.
