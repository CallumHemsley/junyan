# Published town pathfinding measurement

Verdict **ISSUES in the isolated click harness; integrated production severity pending**. Exact published `findPath` blocked real browser click processing for 103–198ms on representative town detours. This is measured work on actual authored geometry, not a complexity estimate. No production viewport or physical-phone performance claim is made.

## Identity and method

- Foundation `9f144d512cfc0e74cfd7c1c9f43b75f7bf954a6c`, town `3747266683d3ec18f7d3af2fb99fcf88942cb098`.
- `geometry.ts` is byte-for-byte extracted with git show. Existing TypeScript transpileModule removes types without algorithm changes; geometry.mjs runs the actual exported functions. SHA256 source and JSON hashes are in identity.json.
- Actual town is 80x64 tiles, 17 walkable rectangles, 95 colliders. Origin is its real default spawn (34,32).
- Node22.23.4 and Chromium155.0.8059.79 on the cloud host. Five cores; initial load average0.08/0.05/0.01. No CPU throttling. Browser viewport390x664 with a390x312 canvas mapping the complete town. This is a review harness, not the production camera/render loop.
- One warmup per workload, then seven measured runs each. Workload order reverses on alternating rounds. Node times only synchronous findPath; correctness checks occur after the timer. Browser uses real mouse clicks, maps their integer viewport coordinates to world coordinates, times findPath inside the event handler, consumes the route by drawing it, and records the next animation-frame callback. Handler-to-frame includes harness drawing and validation, but excludes scheduling before the handler starts. Actual rounded click destinations are retained in browser-results.json.
- All35Node and35timed browser workloads produced expected path/no-path results. Every returned segment passed exported canWalk, and browser paths ended at the actual clicked coordinate. This is consistency validation against the same geometry module, not independent collision correctness proof. No browser page errors.

## Results

| Actual target category | Node median, range ms | Browser search median, range ms | Browser handler-to-frame median, range ms |
|---|---:|---:|---:|
| Riverbank far detour |214.87,209.93–220.00|144.90,142.30–198.00|146.70,144.10–199.50|
| Courtyard detour |151.74,150.43–154.54|105.50,103.00–135.40|106.80,104.10–136.60|
| Tea terrace detour |155.41,152.77–155.90|108.40,103.20–155.30|109.80,104.50–156.60|
| Workshop far direct |1.18,1.13–1.24|0.70,0.50–1.00|1.90,1.60–2.30|
| Blocked building target |0.007,0.006–0.016|0.00,0.00–0.10|0.40,0.20–0.50|

Each cell summarizes seven runs. These are two runtimes and different input quantization, not a before/after speedup comparison. Browser PerformanceObserver retained24long tasks of104–199ms across warmup plus measured detour clicks. Near-zero blocked-target timings are early rejections, not successful path searches. The slow detour median spends about99% of handler-to-frame time inside findPath in this minimal harness.

Half-tile standing topology inspection found7462valid nodes in one connected component. All authored entrance/landmark/anchor probe targets returned paths. No valid-but-disconnected real town destination was found. Therefore this report contains no fabricated unreachable full-search measurement. The blocked building case is explicitly an invalid endpoint, not an exhausted BFS. Continuous-space topology and other maps remain unverified.

## Limiter and impact

A separate Node CPU-profile run, excluded from reported timing samples, spent1528.6ms self time in the collider callback inside canStand and532.4ms in canWalk, versus78.9ms in findPath itself and155.8ms garbage collection. The actual bottleneck is repeated full collider scanning during swept path checks in the BFS, not network or rendering. See profile-summary.json and retained cpuprofile. Source locations at the pinned foundation are src/world/geometry.ts:11–15,18–20,36–65.

For a synchronous production click call on the same workload, this function can consume multiple frame budgets before the UI can react. The parent must measure the actual integrated click path and representative visible destinations before assigning final production severity. A full-map overview click may not correspond to a currently visible destination in the production scrolling camera. Do not label these harness numbers as user-device latency.

Missing regression: production far/obstacle click with a live animation-frame heartbeat, repeated unreachable or blocked clicks, preserving responsive input and collision-valid results. Avoid solving only the benchmark endpoint; test realistic varying origins and routes across the authored map graph. No fixes were authored.

## Reproduce

From repository root, using existing cloud tools:

```
/workspace/.junyan-tools/node_modules/node/bin/node docs/evidence/0088/pathfinding/prepare.cjs
/workspace/.junyan-tools/node_modules/node/bin/node docs/evidence/0088/pathfinding/measure.mjs
/workspace/.junyan-tools/node_modules/node/bin/node docs/evidence/0088/pathfinding/browser.cjs
```

The browser runner binds only127.0.0.1:5492, refuses an occupied listener and closes its browser/server in finally. Post-run ss confirmed no listener on5492. phone-harness.png was inspected; it shows the actual walkable/collider topology and the final blocked-target observation. No application code, dependencies, main build, branch state or shared configuration was changed. No commit/push by this reviewer.
