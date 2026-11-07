---
id: 118
title: Recover the restaurant visual quality lost during world integration
status: doing
priority: high
type: feature
created: 2026-11-06
---

## Why

Callum reports that the actual restaurant graphics are significantly worse. Diagnose against its earlier renderer and native scenes before adding detail or expanding levels.

## Done when

- Reproduce the attached restaurant view and compare equivalent earlier/current gameplay at matched actual viewport, save state and day phase.
- Identify the renderer, resolution, camera, material/lighting and character changes that explain the regression. Distinguish code evidence from visual inference.
- Recover clear native pixel construction, depth/contact/edge treatment, purposeful restaurant composition and readable characters. Preserve real movement/collision/food/service/speech and connected exits.
- Independent source and actual old/new visual review accepts the change; meaningful rules/browser checks pass. Do not substitute local micro-detail wins or tests for the user’s visual bar.

## Notes

- Owner: restaurant recovery agent. Progress: reproduced current and legacy initial day1 at594×849 DPR2,1440×1000 and390×844; ranked material/depth loss, expanded room and generic camera as causes. Implemented compact18×17 geometry, locally cached material planes/shadows and restaurant camera minimum11, preserving canonical service/seat heights. Final full Vitest107files/686tests and12desktop/phone actual opening/service/journal/input/save/connected-door journeys pass; build passes. Independent visual/source acceptance pending. Private evidence under `/private/tmp/junyan-world-private-qa/0118`.
- Centrally reserved by root. Branch codex/0118-restaurant-visual-recovery; worktree /private/tmp/junyan-world-restaurant-recovery.
- Lease restaurant art/projection/primitives plus a proposed restaurant-specific camera/render seam after root coordination. Shared painter/renderer/Viewport changes require exact plan. Ports5576/5577 strict.
- All detailed plans, new native captures, traces and reports stay private under /private/tmp/junyan-world-private-qa/0118; no public raw QA or merges before independent gates.

- Integration: independent source review found no actionable blocker and combined native review accepted bounded recovery with no new integration defect. Restaurant candidate improves all three current-world comparisons; canonical historical rendering remains stronger, especially actors and contact/shadow drawing. Integrated694 rules tests, build,27 browser cases (one redundant size case skipped), and two production offline checks pass. The refreshed local draft preview now serves this recovery. Ticket remains doing while original-rig craft is investigated separately in0123.
