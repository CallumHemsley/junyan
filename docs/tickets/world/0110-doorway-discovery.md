---
id: 110
title: Identify the nearby residence landing with a usable cue
status: done
priority: high
type: bug
created: 2026-11-06
---

## Why

Ordinary-input play found that clicking the open residence door face did not route to its working ground threshold. The doorway works from its landing, but silent elevation-dependent picking weakens discovery of the connected home areas. A pathfinding defect is not established.

## Done when

- Reproduce the actual projected-door click and distinguish art picking from an unreachable destination.
- Provide a restrained canonical-word cue at the actual nearby residence landing, using existing movement and collision rules. Distant elevated facade clicks remain unsupported; this ticket does not claim to fix them.
- Cover desktop and touch, ordinary ground selection and occlusion; no teleporting, fabricated walkable floor, or invisible hot spot unrelated to the rendered opening.
- Independent review and relevant rules/browser checks pass. All new raw QA stays private.

## Notes

- Owner: root. Branch: codex/0110-doorway-discovery. Worktree: /private/tmp/junyan-world-doorway-discovery. Reserved port: 5562 (strict).
- Initial evidence: private normal-input gameplay audit at frozen 13b80620. First task is diagnosis; no claim of a confirmed pathfinding bug.

- Owner: GPT-6.1 Sol High; branch codex/0110-doorway-discovery, worktree /private/tmp/junyan-world-doorway-discovery, strict port5562. Root approved the nearby threshold-cue scope after a pure reproduction distinguished blocked elevated inverse picking from a valid existing4-waypoint route. Exact face picking would need wider accurate occlusion work and is explicitly deferred.
- Pre-implementation desktop/phone fixtures inspected: near landing is exposed by existing cutaway; far audit approach remains behind opaque roof. Use the authored threshold rectangle with a0.75-unit apron, direct canWalk and short reach; reuse canonical apartment.home and its exact native recording, existing44px target/cycling/lookup, and normal worker movement. No camera/pointer/tick, new state/action, renderer or fake floor. Raw QA remains private0110.

- Implemented: only the residence exit opts into a registered-word cue; the pure selector omits unknown references, requires its small threshold apron and direct collision-free ground access. Existing target/cycle/word-card controls route through the existing worker and real movement/exit transition. Target source ordering is total with the new exit case.
- Verification: focused regression first failed on missing landing target, then passed.661 unit tests across101 files, TypeScript and production build pass. Fresh normal-input opening/physical-route proof passed: distant elevated face still does nothing; clear nearby landing shows canonical 家, its word card/native recording works, and both desktop mouse and actual Chromium touch activation visibly walk into the existing hall transition. Console clean. Existing full hospital/waiter journey passed on desktop and phone (all four customers/change/journal/progress). Independent review remains pending.

- Cross-review caught the generated map metadata missing from author-map.py. Fixed the residence exit authoring source and regenerated only in a disposable temp tree: complete parsed map and variants are identical to committed authored values, including apartment.home. No real map/art regeneration occurred. Private generator-check.json records the comparison.

- Main release acceptance: independent source/still review at d6868b2d found no actionable defect. Exact main source passed 628 tests across 93 files, TypeScript/build, both full opening/service/change/journal/next-day journeys, and ordinary mouse/touch landing-cue activation with canonical lookup/audio and small real steps before hall entry. Fresh desktop/phone main screenshots inspected; console clean. Far elevated face selection remains unsupported.
