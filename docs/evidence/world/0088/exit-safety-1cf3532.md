# Independent exit-safety review — 1cf3532

Exact head: `1cf3532e9b40cbdd99d51ee860562e8f292a1d4e`. Goal ACTIVE. Git fetch authentication was unavailable; exact files and commit identity were acquired with the GitHub connector, not inferred from another checkout. Blob hashes, SHA256 hashes, fetched source, synthetic maps and results are retained in `exit-safety-1cf3532-probe/`. No application edits, browser, deployment or full-build claim.

## Confirmed: empty exit component throws through edit and restore APIs

Use a10×8 map, full walkable rectangle, default spawn(1,4), exit rect `{x:.5,y:3,width:1,height:2}`, player(8,4). Before has no colliders. After adds collider `{x:0,y:2,width:3,height:4}` covering all exit support points. The player remains standable.

Executed exact-source results:

| Check | Actual result |
|---|---|
|Before player exit-connected|true|
|After player standable|true|
|After exit component size|0|
|`createMapRegistry([after])`|accepts map|
|`safeExitPosition(after, player)`|throws `No exit-connected support in edit-room`|
|`safeAfterEdit(before, after, player)`|same throw|
|`restoreWorld` with schema-valid serialized saved world and after-map|same throw|
|`restoreWorld` with malformed world `{version:99}` and after-map fallback|returns default spawn(1,4), which is not standable|

`src/world/exit-safety.ts:38` deliberately throws, but its callers do not consistently implement a controlled rejection/recovery path. The comment at36 that registry validation guarantees a usable exit/spawn is unsupported: actual `src/world/registry.ts:4–13` validates shape and ID uniqueness only, and the exact registry function accepted this fixture. Dynamically added colliders also bypass registry construction.

This is a confirmed **public API failure on synthetic geometry**, not a reproduction of a legal current apartment placement or a naturally produced corrupt save. The authored furniture inventory, placement rules, actual current edit anchor and whole browser save pipeline were not exercised. Severity of ordinary-player impact remains contingent on such reachability; the recovery contract still needs a total, explicit policy for invalid support.

## Caller handling: source-verified, not full runtime claims

- `src/neighbourhood/transitions.ts:139–142` computes after-map then calls `safeAfterEdit` without a catch or explicit rejection result. It cannot return the previous game on this exception.
- `src/App.tsx:103` invokes the reducer before checkpointing or assigning `sessionRef` at127. A synchronous throw therefore occurs before this dispatch commits state; do not describe this as demonstrated partial-save corruption. It is still an uncaught action failure, without deliberate rejection feedback.
- `src/world/state.ts:19` calls `safeExitPosition` directly; a schema-valid saved world can throw when its supplied dynamic map has no exit support. The malformed-world branch returns `createWorld` without validating its fallback spawn (executed above).
- `src/save.ts:110` propagates `restoreWorld` from validation. `loadGame` at135–136 invokes validation inside `transaction.oncomplete` without catching thrown exceptions. If this exact failure reaches that asynchronous callback, source control flow leaves the wrapping promise without resolve/reject; this is a **source-supported load-hang risk**, not an independently reproduced IndexedDB/browser hang.
- `src/App.tsx:158–164` does catch localStorage checkpoint validation failures. That handling is distinct from the IndexedDB callback and from render-time `restoreWorld` at88.

Writer action: choose explicit behavior when an edit removes all exit support (normally reject the edit and preserve the previous state), and a deterministic valid fallback/quarantine policy for invalid restored geometry. Make restore/load settle predictably and expose recovery feedback. Do not silently reintroduce a trapped position or move to a non-standable default.

## What the correction does fix

Both earlier sealed-pocket probes now recover to an exit-connected point: still-standable(5,5) → (5,2.5), overlap(5,6.25) → (5,7.5). The full-divider control recovers(8,4) → (4.5,4). These controls pass using actual new functions. Thus the previous standability-only error is corrected when an exit-connected component exists; the empty-component boundary remains open.

## Missing meaningful checks

1. A single edit covers every exit seed while player remains standable: assert explicit rejected edit and unchanged world/furniture/journal, not an uncaught exception.
2. Schema-valid serialized world with invalid dynamic support: assert deterministic load completion and valid recovery/error state.
3. Malformed-world fallback with invalid spawn: assert no non-standable output.
4. Actual current apartment legal edits and reload, including paid-furniture semantics after main reconciliation; synthetic geometry does not substitute for that journey.

Run the independent probe from the reviewer repository root:

```
/workspace/.junyan-tools/node_modules/node/bin/node docs/evidence/world/0088/exit-safety-1cf3532-probe/repro.cjs
```

It uses the connector-acquired source, TypeScript transpilation, actual Zod map/world schemas, actual `restoreLife` definitions and actual `restoreWorld`. It extracts only `safeAfterEdit` from dynamic.ts to avoid loading the production map registry; no recovery algorithm is rewritten or mocked. Registry-function validation is executed without module-level map glob loading. These are narrow function checks, not a production build PASS.
