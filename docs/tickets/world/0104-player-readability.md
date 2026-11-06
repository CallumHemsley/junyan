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

- Candidate: player shirt changed from cream to muted indigo `[82,104,125]`; trousers from green charcoal to warm charcoal `[70,57,49]`. Hair and the jade apron are preserved. `artwork.mjs` is unchanged, so this is a two-colour catalog edit.
- Native proof covers 1,152 frames per identity: eight directions, six phases, six poses/actions, carrying on/off and reduced motion on/off, plus blink/acting and explicit seat/hand height cases. The player's alpha mask, bounds and all contact metadata match cf966caf; all ten other actors' RGBA bytes match their baseline hashes.
- Validation: all 24 focused character tests passed; TypeScript and production build passed. Twelve actual-App before/after captures cover rooftop, riverbank and completed reading room in morning/evening at 1440px and 390px DPR1. Saved state, production camera, wall/game time and viewport match exactly; performance-clock offsets differ by at most 3ms with reduced motion enabled. All console/page error lists empty. Private evidence stays under `/private/tmp/junyan-world-private-qa/0104/`.
- Actual keyboard movement and reload persistence passed in all three scenes at both phone and desktop widths (six cases); saved and restored positions match exactly, with no console/page errors. Independent visual criticism remains pending; ticket remains doing.
