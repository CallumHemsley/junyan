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
- At the early freeze, broad regression checks, normal-motion/native alpha/occlusion verification and required journeys were held until independent art retention. Status stays doing until final independent review.
- Independent early gate retained the treatment for continued work: all seven related non-tie blind preferences favored the candidate; morning and phone control ties were legitimate. Supported claim is modest evening/night occupancy with dark neighbors preserved; the flat recess remains a limitation. Private judgement: `0140/blind-gate-01/independent-final.md`.
- Reconciled accepted main `14b8f7b6e335ed1dc391bb5325f702ac10a71e3a` once. Four focused tests cover selective/graded materials, actual pane and doorstep fit, authoritative strength and motion independence, host-only depth queues and cache transitions with a stable shader. Full rules suite676 tests/106 files and build pass; focused final tests and types pass after strengthening finite draw-coordinate assertions.
- Native Chromium production-renderer probe (`0140/native-probe.mjs/json`) confirms stable-shader dim/lit/dim checksums restore exactly and every host pixel, including light, respects `.45` inherited fade (maximum alpha115/255). Actual App normal/reduced legal-street poses and keyboard walks are in `0140/native/retained-{normal,reduced}`; refreshed phase originals in `0140/native/reconciled-phases`; reports record empty console/page errors. The fixture life42000ms is advanced by the scripted frozen-clock setup before capture; movement checkpoints expose persisted life43008ms. These phase fixtures are not claimed as live town service transitions.
- Required actual journeys pass on desktop and phone: opening, four customers, change, journal and progression; physical doors/stairs through every neighbourhood activity. Isolated `JUNYAN_PRIVATE_QA=/private/tmp/junyan-world-private-qa/0140/e2e`, strict5628/5629; `0140/journeys.log`. Full originals inspected at both widths; `0140/verification.md` and `0140/final-provenance.json` record check boundaries and hashes. No further openings or post-retention production art changes. Final independent source/runtime review is the only remaining acceptance step; root owns review/merge.
