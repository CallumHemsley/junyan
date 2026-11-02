---
id: 41
title: Stop static and offscreen scene redraws
status: done
priority: medium
type: bug
created: 2026-11-02
---

## Why

0039 independently found identical reduced-motion pixel buffers repeatedly painted while visible and offscreen. Parent reproduced 14 visible and 13 offscreen putImageData calls over separate 600ms windows at baseline376a060.

## Done when

A static reduced-motion scene stops drawing, state changes paint once, offscreen/hidden scenes suspend, and visibility/motion-preference changes resume correctly. Actual renderer and characters remain unchanged. Meaningful browser regression and independent review pass before integration.

## Notes

- Owner: parent Codex, branch codex/0041-scene-scheduling, root worktree.
- Own server port5244 strict; evidence output/playwright/0041/.
- Baseline evidence: baseline.json. All Chromium runs use --mute-audio.

- Parent verification: 88/88 unit tests and build passed; 12/12 muted desktop/phone browser checks passed. Full four-customer/change/journal/day2 journeys and existing cast pixel stability checks included.
- Matching 600ms measurements after correction: zero visible static reduced-motion draws and zero offscreen draws, identical pixels. Browser regressions prove input-driven repaint, offscreen pause, return-to-view repaint and motion preference toggle recovery.
- Desktop and phone screenshots inspected at output/playwright/0041/{desktop,phone}-restored.png. Physical background-tab behavior remains for independent review; document visibility handler is implemented.
- Awaiting independent review before integration; no deployment.

- Independently accepted by0043 review aa0038f: combined110units/build,35silentbrowserchecks and four scene rechecks. Physical OS hidden-tab restoration remains unverified; synthetic visibility passed. Integrated as9852ae0; renderer geometry and approved WAVs unchanged.
