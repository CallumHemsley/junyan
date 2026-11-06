# Independent exit-safety correction recheck — e89831

Exact head `e89831bf65a4d7a7fd0ecca17e3deca047b011b0`. Executed after the parent confirmed the separate whole-app timing window had ended. No browser, port, application edit, checkout change or production build. Goal ACTIVE; findings below are narrow pure-function evidence, not legal current furniture UI acceptance.

## Confirmed corrected behavior

The same10×8 room fixture covers every exit support point with collider `{x:0,y:2,width:3,height:4}`, while player(8,4) remains standable. Executing actual source now gives:

| Boundary | Actual result |
|---|---|
|`safeExitPosition` / `safeAfterEdit`|`null`, no throw|
|Schema-valid JSON-roundtripped world in blocked apartment|Falls back to valid restaurant spawn(1,4)|
|World-life state on that fallback|Preserved, including elapsedMs4321|
|Actual post-feature commit tail with blocked candidate map|Returns the identical previous game object; feature, journal, world and coins unchanged|
|Same commit tail with valid divider recovery|Commits candidate feature/journal, recovers player to exit-connected(4.5,4)|
|Earlier standable sealed-pocket fixture|Recovers(5,5) → (5,2.5), exit-connected|
|Earlier overlapping sealed-pocket fixture|Recovers(5,6.25) → (5,7.5), exit-connected|

The helper correction is at `src/world/exit-safety.ts:38`; the atomic caller rejection is at `src/neighbourhood/transitions.ts:141–143`; schema-valid corrupt-map fallback is at `src/world/state.ts:19–20`. The previous empty-component throw is resolved for these boundaries. Because no throw occurs in this reproduced path, the earlier source-supported IndexedDB callback propagation concern is not reproduced by this fixture on the corrected helper.

Atomicity scope: the probe executes the exact post-feature commit tail with supplied prior/candidate feature state, journal and map resolver. It asserts identity and full JSON equality on rejection, and a successful acceptance control. This is not execution of the complete feature reducer, legal furniture placement, paid-furniture purchase or browser persistence. Those remain separate integrated checks.

## Remaining confirmed API boundary: malformed-world fallback can produce blocked feet

`restoreWorld({version:99}, {apartment:blockedMap, restaurant:validMap}, 'apartment')` returns the apartment default spawn(1,4). Production `canStand` is false there because the same collider covers that spawn. The schema-invalid early return at `src/world/state.ts:16` calls `createWorld(maps,location)`; `createWorld` at10–12 copies the selected map's spawn without checking it. It therefore bypasses the newly added safe restaurant fallback used for schema-valid worlds at20.

This is a synthetic invalid-world + invalid-dynamic-map combination. **No naturally generated corrupt save or normal-player legal apartment trap is claimed.** It remains relevant to the advertised corrupt-restoration contract: malformed input should not produce non-standable state when a known valid restaurant fallback exists.

Writer action: validate the fallback used by malformed/missing-world branches, or route that recovery through a known valid safe map. Add a regression combining malformed saved world, apartment location, invalid apartment spawn/support, and valid restaurant fallback; assert standable returned feet and deterministic completion. Existing safe edit rejection and positive recovery tests should remain green.

## Method and reproduction

Source was acquired with `git show` at the full local commit, with Git blob and SHA256 manifests retained. The probe transpiles the exact geometry, exit-safety, world schema, actual restoreLife definitions and restoreWorld. It extracts the exact safeAfterEdit function and post-feature commit tail to avoid constructing the application's module-level registry. No recovery algorithm is substituted. Results are in `results.json`; source snapshots and fixtures are alongside it.

```
/workspace/.junyan-tools/node_modules/node/bin/node docs/evidence/world/0088/exit-safety-e89831/repro.cjs
```

All correction assertions and positive controls completed. The malformed fallback is recorded as an observed unresolved result (`malformedFallbackStillInvalid:true`), not hidden behind an overall PASS label. Production UI, persistence, main reconciliation and full experience acceptance remain open.
