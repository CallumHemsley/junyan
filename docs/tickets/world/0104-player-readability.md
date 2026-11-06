---
id: 104
title: Separate the player from pale ground and foliage
status: doing
priority: high
type: feature
created: 2026-11-06
---

## Why

Independent rooftop, riverbank and reading-room comparisons repeatedly find that pale player clothing merges with paving and rugs. A foot ring carries too much of the visual recognition work.

## Done when

- The same player remains recognizable against pale paving, green foliage and warm interior rugs in morning and evening, at actual phone and desktop presentation sizes.
- Preserve calibrated body scale, silhouette bounds, foot/hand contacts, animation, carrying and all other actor identities. Do not improve screenshots by enlarging the player independently of the world.
- Focused native-frame invariants and exact-source actual-App before/after comparisons support the change; an independent critic identifies gains and regressions honestly.

## Notes

- Centrally reserved after 0103. Owner GPT-6.1 Sol High, branch `codex/0104-player-readability`, worktree `/private/tmp/junyan-world-player-readability`, strict ports 5546/5547.
- Lease the player entry in `src/world/characters/catalog.ts`, player-specific colour/value treatment in `artwork.mjs` only if required, and focused tests. Do not change NPC appearances, geometry, actor calibration, movement, map art, camera, lighting, content or dependencies.
- Accent vermilion remains limited to words. Retain the existing cozy identity and apron rather than adding an unrelated bright costume, glow or selection outline.
- Keep new raw captures, videos, reports and timing data private. No push or merge before cross-review.
