---
id: 82
title: Investigate intermittent offline speech probe timing
status: todo
priority: low
type: explore
created: 2026-11-06
---

## Why

During independent verification of ticket 0081, the desktop production offline journey timed out once on native speech after an apartment reload. The recording was cached and returned HTTP 200. Four unchanged feature-head reruns and an unchanged-main comparison passed. No introduced product defect or underlying cause was established.

## Done when

- Reproduce or explain the first failure using media playback state and lifecycle timing, distinguishing application behavior from the test observer.
- Verify the cause against the unchanged baseline and the feature under equivalent conditions.
- If a correction is justified, keep the existing real cached audio and native playback assertions intact and independently verify the result.

## Notes

- Reserved centrally after 0081. This investigation does not block the verified progression slice; its review is PASS with an explicit intermittent-check note.
- Observed at `c544efacd5d5cdfc57ebbc2155a3518e0031fa8f`; unchanged main comparison `ba4419beec7dc8f4a820536fc9d48fc0d97f5e97` passed.
- See `docs/evidence/0081/integrated-live-review.md` for preserved failure and rerun evidence. Root comparison log is `/private/tmp/junyan-0081-baseline-offline.log`.
