# Edit/reload safety — independently reproduced API defect

Head: `23be251185d989f7b97d36391a8f6478344b1a3b`. No production edits, browser, save seeding or server used. This is synthetic map geometry using the production recovery and geometry functions, plus the actual bundled `restoreWorld`. It is **not evidence that the current apartment UI lets an ordinary player build this trap**. Current furniture placement legality, ownership inventory and the near-edge editing anchor were not exercised.

## Confirmed scope

`src/world/dynamic.ts:15` returns a still-standable position without checking whether its AFTER-map component reaches an exit. Line21 chooses the nearest standable candidate reachable in the BEFORE map, again without checking AFTER-map exit reachability. `src/neighbourhood/transitions.ts:123–125` calls this function on changes to a dynamic map. Actual `restoreWorld` at `src/world/state.ts:18` likewise retains a standable saved position, so reload does not repair either fixture.

A small room has a U-shaped shelf enclosure and a one-tile south opening. The same single added cabinet closes that opening in both cases. Both original positions have an actual production path to the room exit before editing. The added cabinet completes a continuous solid rectangular ring: top y3–4, sides x3–4 and x6–7, bottom y6–7. This gives an analytic no-exit certificate for the inside pocket, independent of any pathfinder returning an empty path. All colliders and player-radius checks are explicit in fixtures.json.

| Fixture | Before position | After result | Actual restoreWorld after JSON serialization | Result |
|---|---|---|---|---|
| Still standable pocket | (5,5) | (5,5), unchanged | (5,5) | Inside sealed ring, no exit route |
| Overlap at closing opening | (5,6.25) | (5,5.75) | (5,5.75) | Nearest safe spot is inside sealed ring |

For the second fixture the input intersects the newly added cabinet. Recovery chooses the interior point only .5 tiles away, even though (5,7.25) is standable outside the ring and has a direct route to exit (9,8). Thus the result is not merely an unavoidable no-safe-space fallback. For both fixtures the production `findPath` also returns no after-map exit path, while the before-map exit paths are nonempty. JSON roundtrip and production restoration preserve the trapped results.

## Missing checks / writer action

Foundation owns recovery. Establish the intended exit-connected AFTER-map component, preserve the previous position only if it belongs to that safe component, and choose deterministic candidates within it. Tests should cover both fixtures, an ordinary preserved exit-connected point, tied candidates, no-exit/no-valid-spawn cases, and serialized restoration. Preserve the ordinary furniture rules separately; do not treat these synthetic fixtures as a reproduction through legal current apartment controls.

The published contract at `docs/world-program/contract-v1.md:94` requires deterministic nearest reachable recovery in the same connected component, while the user's requested stronger acceptance explicitly requires an exit-connected AFTER-map result. These results demonstrate why standability and BEFORE-map segment reachability cannot establish that invariant.

## Reproduce

From reviewer repo root run:

```
/workspace/.junyan-tools/node_modules/node/bin/node docs/evidence/world/0088/edit-safety-23be251/repro.cjs
```

The script extracts exact-head geometry and the complete safeAfterEdit function using git, then transpiles without changing logic. `state.bundle.cjs` is the actual state module bundled with dependencies from the exact-head integration checkout; no stub restoreLife is used. Regenerate at the exact head with:

```
node_modules/.pnpm/esbuild@0.28.2/node_modules/esbuild/bin/esbuild src/world/state.ts --bundle --platform=node --format=cjs --outfile=/workspace/junyan/docs/evidence/world/0088/edit-safety-23be251/state.bundle.cjs
```

Results and complete synthetic before/after maps are retained. No application fix or commit authored by this reviewer.
