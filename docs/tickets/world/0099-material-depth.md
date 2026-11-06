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
