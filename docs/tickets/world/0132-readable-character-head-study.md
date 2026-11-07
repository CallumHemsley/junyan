---
id: 132
title: Preserve authored face readability while improving character pose and depth
status: doing
priority: high
type: explore
created: 2026-11-06
---

## Why

The native baseline won all V2 and early V3 character comparisons. Original 3D heads lose face/glasses visibility at the actual phone camera even after torso correction. Test an artist-readable head recipe with coherent world-space body poses instead of repeating the failed head geometry.

## Done when

- Propose a bounded early player/elder experiment using the current native head authoring recipe, with semantic extraction rather than cropped screenshots or face decals through hair.
- Attach that head art to an owned world-space neck/body pose with deliberate silhouette, occlusion, lighting and scene scale. Preserve canonical identity, away-facing heads, blink and expression inputs.
- Keep true limb/seat/hand support and distinguish illustrative head art from exact physical geometry. Do not claim public contact/cache/held-prop parity from internal geometry proofs.
- Test original actual phone/desktop game views early. Independent label-withheld preference must show a useful drawing/readability/coherence gain before broader proofs or production implementation. Reject honestly if no gain.

## Notes

- Owner character-art writer; branch codex/0132-readable-character-head-study; worktree /private/tmp/junyan-world-readable-character-heads; ports5608/5609 strict.
- First propose head extraction, world attachment/depth and byte-preservation checks before edits. Existing132study is private; no production API/backend/global-camera change without root coordination.
- Raw evidence private under /private/tmp/junyan-world-private-qa/0132. Preserve all0123frozen candidates.
