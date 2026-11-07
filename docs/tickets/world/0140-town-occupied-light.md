---
id: 140
title: Give selected town facades restrained occupied evening light
status: doing
priority: high
type: feature
created: 2026-11-07
---

## Why

Independent district review finds night facades flat and unoccupied despite the street props. Warm anchors at a few real windows/thresholds should give the town human presence without brightening every building.

## Done when

- Propose a small treatment at two or three existing facade openings, using their actual host geometry and existing phase/light pipeline. Preserve dark neighbors and roof values; no floating emitters or light through roofs/walls.
- Show matched original phone/desktop day/evening/night views for an independent early art gate. Keep landmarks, player/routes and Mandarin DOM signage readable; no new content, audio or fictional NPC state.
- Keep one authority for pane/spill positions and depth/occlusion, authoritative atmosphere and stable reduced motion. No new renderer or global grade/color bypass without explicit root coordination.
- Complete meaningful source/light/alpha/occlusion tests, rules/types/build and real required journeys, native checks and final independent source/runtime review before merge.

## Notes

- Owner town-light writer; branch codex/0140-town-occupied-light; worktree /private/tmp/junyan-world-town-occupied-light; strict ports5628/5629.
- Base accepted main6d11a876; latest main563bb4cf adds only residential storage. Reconcile later before final freeze. Independent critique private district-critic/review.md.
- All raw QA private /private/tmp/junyan-world-private-qa/0140. Source/tests/ticket only committed. Shared atmosphere seam requires proposal before edits. No overall AAA claim.
- Early source freeze: root approved using only authoritative `lampStrength` for three host-painted apertures (restaurant recess and first side pane; residence middle side pane). Their light shares the existing building slices, frame ordering and inherited fade; plate reuse also keys light strength. No map, global atmosphere grade or game-state change.
- Early visual gate pending: actual full App originals and validated fixture reports in private `0140/native/{before,candidate}` (both approaches, phone/desktop, morning/evening/night) and `{before-district,candidate-district}` (night control). Script `0140/capture.mjs`; source/image hashes `0140/early-gate-provenance.json`; historical-source compatibility `0140/base-provenance.json`; exact diff `0140/early-gate.diff`. Seed42, life42000ms, facing north, reduced motion, frozen clock; restaurant35,30.8, residence19,22, district35,44.
- Baseline substitution: the12 `before` approach images used the original full source. For the2 `before-district` images only `src/world/art/town/index.ts` was temporarily replaced with its original HEAD version; the optional contract field and cache-key addition remained (no aperture emission with the original painter). Candidate painter was restored byte-for-byte before this freeze. All28 full PNG originals are preserved; no cropping/resizing/compositing. District phone before/candidate is byte-identical because selected apertures are offscreen.
- Broad regression checks, normal-motion/native alpha/occlusion verification, required journeys and final independent review deliberately remain outstanding until independent art retention. Status stays doing.
