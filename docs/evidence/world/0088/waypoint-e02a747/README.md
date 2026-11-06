# Independent waypoint correction verification

Exact head `e02a747c3b4d4fc6a476ea744ecb6bdc1a738132`. No application edits, checkout change, browser, server or build. The owner d772aa1 waypoint reproduction was treated as a hypothesis and independently rerun against the actual new geometry and authored workshop map.

## Narrow correction confirmed

The full real workshop route from `(7.999999306418678,6.799999583851207)` to `(8,10.8)` is `[(11,7.5),(11,10.5),(8,10.8)]`. The prior viewport controller sequence independently reproduces stalls at20ms,33.3333333333ms and40ms, but arrives at16ms and16.6666666667ms.

The actual new `advanceRoute` arrives at the target for **all five frame intervals**, with no blocked signal and every step accepted by production `canWalk`. It also passes a mixed sequence including zero-time frames and a duplicate/residual-waypoint sequence. Actual viewport source lines68–69 delegates to this helper and no longer clears the route merely because a residual delta is below the outer moving threshold.

| Step milliseconds | Prior controller | New helper |
|---|---|---|
|16|Arrives|Arrives,114frames|
|16.6666666667|Arrives|Arrives,110frames|
|20|Stops at intermediate waypoint|Arrives,91frames|
|33.3333333333|Stops at intermediate waypoint|Arrives,55frames|
|40|Stops at intermediate waypoint|Arrives,46frames|

The correction is not simply suppressing all blocked results: a separate solid-wall control terminates with `blocked:true`, keeps the player standable atx4.7 before wallx5, and clears its impossible remaining route. Zero-time and empty-route controls preserve the input position. The helper's epsilon consumption at `src/world/locomotion.ts:7` and continuation through remaining budget avoid the earlier residual-as-collision behavior.

This is exact-source function/controller evidence, **not production input traversal or worker-race acceptance**. Parent still needs the real production route to the lamp bench and normal interactions. Production `canWalk` is the same geometry implementation, so segment validation is not an independently implemented collision proof.

## Exit-connected edit safety still unresolved

The complete `safeAfterEdit` function is byte-for-byte unchanged from23be251 (recorded comparison true in results.json); only dynamic map construction above it changed. The previous two synthetic sealed-pocket findings in ../edit-safety-23be251 therefore still apply to this function. No new normal-player apartment trap is claimed. Reload implementation was not rerun for this head.

## Reproduce

From reviewer repo root:

```
/workspace/.junyan-tools/node_modules/node/bin/node docs/evidence/world/0088/waypoint-e02a747/repro.cjs
```

The script extracts exact head source/map with git, transpiles geometry and locomotion, computes the actual full path and executes assertions. Exact source, authored map, timing results and controls are retained alongside this report. No producer PASS was trusted and no application fixes were made.
