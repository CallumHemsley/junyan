---
id: 130
title: Author stable readable bed materials at native game scale
status: doing
priority: high
type: feature
created: 2026-11-06
---

## Why

Independent0126review confirms depth improvement but rejects promotion because thin cloth stripes alias into dotted rails and change with camera phase. Improve the actual asset/material representation and motion stability instead of treating mathematical preservation as art acceptance.

## Done when

- Propose a coherent bed-material representation from the original recipe and native phone/desktop evidence. Preserve real bed dimensions, support geometry, inventory/placement and one shadow/light owner; decorative paint bands may be authored deliberately rather than retained as tiny raised boxes.
- Blanket bands remain distinct and quiet at native phone scale; linen reads soft and clean, wood retains appropriate construction. Avoid noise, unsupported props or enlargement used only to win comparisons.
- Pixel coverage/depth/material coordinates and movement caching are intentional. Verify original-resolution actual motion, bounded cold/moving cost, exact world support and source/API compatibility.
- Independent harsh native and source review must earn production implementation; prior0126candidate stays frozen. OverallStardewcraft remains open.

## Notes

- Owner: bed material writer. Dedicated branch codex/0130-readable-bed-materials; worktree /private/tmp/junyan-world-readable-bed-materials; strict ports5602/5603.
- Private experiment first under /private/tmp/junyan-world-private-qa/0130. Existingrenderer/math can be reused; no production API/backend or unrelated actor/map change before root coordination.
- Investigate thin-box point sampling, physical decorative paint semantics and fixed-phase object-native raster caching before adding further highlights.
