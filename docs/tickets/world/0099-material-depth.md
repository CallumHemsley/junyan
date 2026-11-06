---
id: 99
title: Strengthen foliage and rooftop material depth
status: doing
priority: high
type: feature
created: 2026-11-06
---

## Why

The current palette and light response compress foreground material separation and contact depth. Actual screenshots support a targeted material pass, not an assumed global-overlay fix.

## Done when

- Foliage and rooftop structures have clear material/value hierarchy, grounded contacts and readable foreground silhouettes while retaining the accepted cozy palette.
- Morning and evening, desktop and phone, canopy overlap, inherited alpha and native actor scale remain coherent. Mandarin learning fog is unchanged.
- Independent source-label-withheld comparison against real publisher references identifies remaining gaps and drives further iterations; stills alone cannot accept physics or animation.
- Relevant material, shadow, foliage and route checks, production build, console and actual-App visual inspection pass. New raw QA stays private.

## Notes

- Centrally reserved with 0098/0100 from main `37fb62c`. Owner GPT-6.1 Sol High, branch `codex/0099-material-depth`, worktree `/private/tmp/junyan-world-material-depth`, strict ports 5534/5535.
- Exclusive paths: `src/world/art/landscape/foliage.ts` (palette/value allocation only), `src/world/art/rooftop/index.ts` (materials and local contacts), focused tests in those directories, and this ticket. Optional canopy cast response in `src/world/atmosphere/index.ts` with its existing shadow test requires explicit coordination before editing.
- Do not edit 0098's landscape ground/draw/index, shared contracts, dependencies, content, audio, actor/common15 calibration or map geometry. Keep foliage bounds and silhouette unchanged in this first pass.
- No global veil was found: dominant grass pixels match the authored material through morning lighting; background forest alpha is intentional. Landscape trunk contact remains with 0098.
- Private preparation: `/private/tmp/junyan-world-private-qa/next-contrast/proposal.md`. Use matched source/camera/time captures, then real movement checks.

### First candidate — 2026-11-06

- Working from shared allocation `d3374f2`, isolated worktree and strict Vite 5534. First pass strengthens existing foliage low/mid values without changing its native painted mask, silhouette or bounds. Rooftop material ramps now distinguish soil, warm pots/timber and cooler paving; compact ground contacts attach to the existing bed bases and actual support feet. No atmosphere/shared shader edits, landscape 0098-file edits, actor calibration, world geometry or word-fog changes.
- Private actual-App baseline and matched first-pass capture sets: `/private/tmp/junyan-world-private-qa/0099/{before,after-v1}/`. Saved arrival fixtures use `createGame(content,42)` (stored RNG seed `955863294`), day 1, empty journal with learning fog intact, served 0 for morning or three legitimately served customer records/valid earnings for evening. Park `(15.7,52)`, riverbank wash terrace `(40,74)`, roof `(24,27.3)`, facing east. Validated IndexedDB saves load through `/` without `?test=1`. Desktop 1440×1000 and phone 390×844, reduced motion, fixed browser wall clock and recorded canvas/state clocks. These are declared saved arrivals, not proof of reaching each location from a new game.
- Node 22.23.4: 50 focused rules/material/shadow/occlusion/surface checks and full 614-test suite pass; TypeScript plus Vite production build pass. New native-coverage digest checks preserve the accepted canopy mask; rooftop proof verifies compact contacts, single material shading and inherited-alpha restoration. Browser drawing of all three canopy families at inherited `.45` produces uniform alpha 115/255 without internal overlap accumulation.
- Actual normal-motion keyboard input moved the player in all six map/viewport fixtures, with clean console. Raw movement stills, per-case coordinates/clocks, native opacity samples and videos remain private under `0099/movement-v1/`. Matched morning/evening phone and desktop images inspected; clearer shade and soil/foot contacts are incremental, with repeated canopy shapes and sparse scenery still visible. This is not a quality acceptance claim.
- Separate harsh source-label-withheld review, exact-source final captures and the full opening/service/change/journal browser journey remain pending. Status stays `doing`; no branch publication before root review.
