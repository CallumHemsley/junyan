---
id: 59
title: Fix the rendering flicker in the hospital opening
status: doing
priority: high
type: bug
created: 2026-11-05
---

## Why

Callum reports a distracting flicker in the hospital opening and supplied the close-up below. The screenshot shows the seated patient's head beside a narrow vertical pale strip; use this area to locate the reported artifact. The ward should feel calm, with stable character and scenery rendering.

![User-supplied close-up of the affected ward area](attachments/0059-ward-flicker.png)

## Done when

- [ ] Reproduce the reported flicker in the opening. Record the affected step, viewport and motion conditions, and capture a short before video; the supplied still alone cannot establish the temporal behavior or cause.
- [ ] Identify and fix the rendering cause so the affected character and overlapping scenery remain visually stable throughout idle animation and opening transitions.
- [ ] Verify at phone and desktop widths, with normal and reduced motion. Inspect a short after video across the affected animation cycle and confirm the artifact is gone without introducing gaps, incorrect overlaps or hidden facial features.
- [ ] Add a focused regression check where the cause can be tested deterministically. Run the scene/rules tests and Playwright opening-to-restaurant journey, inspect phone and desktop screenshots, and confirm a clean console. Record commands and results in Notes.

## Notes

- Reported by Callum on 2026-11-05. The original screenshot is preserved in `docs/tickets/attachments/0059-ward-flicker.png`.
- Exact reproduction conditions and root cause are unverified. Do not assume depth ordering, clipping or animation is responsible from the still alone.
- Starting points: `src/scene/renderer.js`, `src/scene/ward.js`, `src/scene/ward-steps.js`, `src/scene/ward.test.ts` and [[tickets/0053-ward-scene]].
- [[tickets/0058-doctor-opening-voice]] tracks the separate voice issue in the same opening.

- Owner: cloud Codex ticket 0059; branch `codex/0059-ward-scene-flicker`; checkout `/workspace/junyan-0059`; strict ports 5402 (dev), 5403 (preview). Evidence: `docs/evidence/0059-ward-scene-flicker.md`.
