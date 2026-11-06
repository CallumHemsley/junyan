---
id: 128
title: Author a natural riverbank contour and purposeful shoreline composition
status: doing
priority: high
type: feature
created: 2026-11-06
---

## Why

Independent review accepts the new river materials but still finds the coarse stepped shore and broad contour bands synthetic. Improve the actual authored world rather than adding texture over that geometry.

## Done when

- Inspect actual washing, crossing and ferry scenes; propose a coherent contour and two focused shoreline compositions at native desktop and phone scale before edits.
- Use the existing validated geometry schema and authoring path to make visual water/dry boundaries and real collision agree. Preserve functional crossings, entrances, feature/story anchors and reachable dry approaches; changes to supporting art are deliberate and coordinated.
- Compose margins with existing appropriate flora/stone/material assets, clear sightlines and purposeful quiet space. No random clutter, invented blocking routes or concealed fake walkability.
- Verify route connectivity, real normal/reduced-motion keyboard/touch crossings, old-save restoration near changed banks, occlusion, geometry consistency and navigation/render cost. Independent harsh native and source review is required before integration; overall quality remains open.

## Notes

- Owner: riverbank layout writer. Branch codex/0128-natural-riverbank-layout; worktree /private/tmp/junyan-world-natural-riverbank-layout; ports5600/5601 strict.
- First propose concrete data/authoring seam and measurement before product edits. Existing schema only initially; no new renderer, actors, dependencies or schema changes without root coordination.
- New raw QA private under /private/tmp/junyan-world-private-qa/0128; no public artifacts or merges before independent gates. Current accepted0125 source remains frozen for the main-release port.

- Source/native inspection and pre-edit model completed. Root approved existing author.py + generated riverbank.json, local ground taper and narrow tests. Explicit independent west/east contours form washing inlet (x42.75 at74) and ferry cove (~x56 east at61.5); unchanged bridges/anchors/entrances. Adaptive quarter-y strips only55–80, half-y upstream,1/8x quantization and adjacent identical-strip merging.
- Pre-edit full-resolution model rejected for cost: water153→247/colliders225→319, cold exits+34%, desktop native painter NPC-path spikes~65→104ms. Approved adaptive model water153→178/colliders225→250, props162, all8 anchors reachable; cold component~976→1035ms in a single exploratory run. Alternating multi-run final comparisons still required; do not claim cost neutrality.
- Raw models and actual baseline App captures under private0128; accepted0125 branch/source untouched. Current local server5600, strict.

- Final composition: actual washing inlet and ferry cove, locally tapered shallow shelves; existing bank reeds/rocks attach to authored contour. Root additionally approved ferry-boat57.8/60.7→58.4/60.3 with identical ID/dimensions and matching collider. Derived existing ferry-rope object in landscape/index.ts now joins current native bow to fixed post tie band; generic rope art untouched. Actual fully composited phone/desktop crops prove contacts and clear phone hull.
- Water153→178; total colliders225→250;162 prop IDs retained. Bounds/spawn/walkable/occluders/entrances/exits/anchors/palette/NPC hooks/landmarks byte-identical. Geometry tests prove exact wet-terrain/water-blocker agreement and fixed supports/approaches; authoring regenerates both JSON payloads byte-exact, park unchanged.
- Final checks: bounded rules110files/703tests, TypeScript and production build pass (existing chunk warning). Existing required opening/service/change/journal journeys desktop+phone2/2 pass.12 actual bridge crossing/return cases (keyboard desktop/phone, phone canvas touch, normal/reduced) safe;4 actual legacy-bank App restores keep nearby dry exit-connected feet and journal/earnings/discoveries, with6 source legacy fixtures too.
- Native final evidence:24 actual original App pairs,1440×1000/390×844, washing/crossing/ferry/park × morning/evening/night; all saved/live state, wall clock/camera/canvas match, park6/6 byte-identical and console clean. Private blind packet, source/capture SHA-256, rope endpoint proof and handoff ready.
- Cost is bounded but not neutral:3 alternating fresh-map rounds cold exit~914–951→1017–1041ms (~9% median increase); actual normal bridge callbackp95 desktop4.0–4.2→4.2–4.4ms, phone3.8–4.2→3.8–4.4ms, raw max/frame gaps retained. Earlier fixed-wash isolated NPC-path spikes~65→103ms persist even adaptive; disclosed separate performance risk. Do not substitute hot medians for tails or claim global frame-rate safety.
- Writer implementation complete; independent root source/harsh native gates pending, so status remains doing. No push/merge; no overall AAA acceptance claim. All raw evidence/model attempts remain private0128.
