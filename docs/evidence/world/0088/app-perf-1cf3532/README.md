# Actual App restore-cost review

**The hot-path defect is runtime-confirmed at 1cf3532; the caller-boundary correction is independently verified at 2a7dc57.** Do not report the old defect as unresolved on the newer head. Whole-world acceptance, physical-phone performance and the independent empty-exit recovery defect are outside this verdict.

## Identity and checks

- Before: `1cf3532e9b40cbdd99d51ee860562e8f292a1d4e`, connector-verified snapshot at `/workspace/junyan-review-1cf3532`; provenance is ../exit-safety-1cf3532/snapshot-manifest.json. TypeScript and ordinary Vite production build pass. All **447 rules tests across59 files pass**, serial run41.19s. No inherited old-head failure claimed.
- After: exact git archive `2a7dc57a9163d9f49019fd3c29673b87548ebf4d` at `/workspace/junyan-review-2a7-perf`. TypeScript and ordinary production build pass; full rules were not rerun on this follow-up. It precedes the subsequently reported e1e seating-catalog change.
- Chromium cloud Linux at390×664 phone CSS viewport, device emulation; no CPU throttling and no physical-phone claim.5 cores; pre-run load0.00/0.14/0.40. No competing deliberate heavy command during samples. Strict port5490 stopped after runs.
- Source, production chunks, diagnostic chunks and fixture hashes are in identity.json. No application file was edited. External configs/scripts and reports are confined to reviewer evidence.

## Actual runtime method

`perf.spec.ts` drives the complete production App through the normal opening first. Five held-key movement samples, each400ms in one direction then400ms back, run in the ordinary restaurant. The normal opening test uses no seeded state. A separate labelled diagnostic then restores the **recorded ordinary e02 phone journey save**, which contains ten real return positions. Only current map/position/activity and pending furniture selection are adjusted for bounded town/apartment scenarios. This is not a new all-region traversal proof. Fixture copy and origin hash are retained.

Five movement samples each run in town and apartment. Actual DOM controls then perform five alternating cushion-colour changes and five rug-size changes. Five reloads exercise the saved result. Errors, frames, long tasks and exact states are recorded incrementally; final position/colour persistence and no page errors are asserted. The fixture has only its bed placed; these restyles are not a worst-case furniture relocation or obstructed-exit edit.

The unchanged production1cf run passed in25.3s. A separate diagnostic build uses an external TypeScript-AST Vite transform to wrap existing function bodies in timing/count probes. The source files remain untouched. It instruments App, mapsForNeighbourhood, restoreWorld, safeExitPosition, isExitConnected and exitComponent. Native behavior/returns are retained. A separate diagnostic run at2a7 uses the same instrumentation and scenarios. All three runtime runs pass. Service workers are blocked for measurement; offline acceptance is not claimed.

**Boundaries are not whole frames.** App timing covers its render function, not all React reconciliation/child painting. restoreWorld includes nested connectivity costs. isExitConnected totals are nested within restoreWorld; **do not add them together**. Independent requestAnimationFrame intervals and browser long-task observations measure whole-page responsiveness. Instrumentation adds overhead. Versions ran sequentially, not in an interleaved benchmark; report call-boundary correctness and measured ranges, not a general percentage speedup.

## Before: actual per-movement restoration is expensive

At1cf, App.tsx87–88 calls map construction/restore on every render. transitions.ts66–67 calls them again for movement/clock/interact/close. The claim that exit connectivity runs "never on a movement frame" is false at this head.

Unmodified production, five samples per scenario:

| Scenario | Median maximum RAF gap | Range of per-sample maximum gaps |
|---|---:|---:|
| Ordinary restaurant |16.8ms|16.8–16.8ms|
| Town with ten saved returns |66.6ms|50.1–66.7ms|
| Apartment with ten saved returns |50.1ms|50.0–66.6ms|

There was one57ms long task during apartment movement. Town's single initial diagnostic reload had a183.4ms maximum RAF gap; that single cold observation is not a repeated percentile. Restyle colour/rug samples stayed around16.7–16.8ms maximum RAF gaps, while their input-to-two-frames latency includes Playwright's input scheduling. Five apartment reloads had maximum gaps33.3–49.9ms. No console/page exception was recorded by the pageerror collector; console messages were not independently asserted in this harness.

Separate instrumented1cf movement samples (~0.8s each):

| Scenario | restoreWorld calls median(range) | Total restoreWorld time median(range) |
|---|---:|---:|
| Ordinary restaurant |98(97–99)|6.9ms(6.6–10.0)|
| Populated-return town |42(41–43)|646.8ms(639.1–666.1)|
| Populated-return apartment |43(40–45)|619.0ms(588.7–625.4)|

For the first town sample,20 App renders led to42 restoreWorld calls and462 isExitConnected calls. Nested connectivity accounted for660.7ms of666.1ms restoration. This demonstrates actual caller repetition and substantial main-thread cost, rather than a cold-spawn pure-function microbenchmark. Town geometry/rendering also differs from the restaurant, so the unchanged-production frame comparison alone was not used to assign causality; exact boundary timing supplies that attribution.

**No exitComponent BFS invocation occurred in these diagnostic scenarios**, including reloads: the selected valid positions/returns were accepted through direct exit connections. Consequently this run does not measure first component-build versus warm component-cache cost. It establishes expensive repeated direct connectivity checking even without BFS. A cache-construction number must come from a separately identified workload.

## After: movement skips connectivity, restore/load still checks it

Exact2a7 diagnostic observed **zero safeExitPosition/isExitConnected/exitComponent calls during every held-movement sample**, despite continuing App and cheap restoreWorld calls. This closes the specific caller-boundary runtime gate, not every recovery condition.

| Scenario | restoreWorld calls median(range) | Total restoreWorld time median(range) |
|---|---:|---:|
| Ordinary restaurant |97(96–99)|2.7ms(2.3–5.3)|
| Populated-return town |97(95–99)|10.4ms(9.3–16.7)|
| Populated-return apartment |97(95–98)|9.4ms(7.2–12.5)|

Town diagnostic maximum RAF gaps were16.7–16.8ms. Apartment median maximum gap was16.8ms, with one sample reaching50.1ms; do not claim universally perfect frames. Colour/rug restyles also performed zero connectivity calls in these sampled cases. Each reload retained11 isExitConnected calls and one safeExitPosition call, confirming the check remains at the load boundary. Five reloads had restoreWorld totals19.3–27.9ms; these include boundary work. Final position and restyle state survived.

This is diagnostic after-fix frame evidence, not a second untouched-production timing run. The strongest after verdict is exact observed call-boundary correction. Retain all frame caveats and repeat representative dense-world checks on the final integrated head.

## Reproduction and setup failure disclosure

From `/workspace/junyan`, with the recorded snapshot builds present:

```
PERF_MODE=production PLAYWRIGHT_BROWSERS_PATH=/workspace/.junyan-tools/browsers /workspace/.junyan-tools/node_modules/node/bin/node node_modules/@playwright/test/cli.js test --config docs/evidence/world/0088/app-perf-1cf3532/perf.config.ts
PERF_MODE=instrumented PLAYWRIGHT_BROWSERS_PATH=/workspace/.junyan-tools/browsers /workspace/.junyan-tools/node_modules/node/bin/node node_modules/@playwright/test/cli.js test --config docs/evidence/world/0088/app-perf-1cf3532/perf.config.ts
PERF_MODE=2a7-instrumented PERF_ROOT=/workspace/junyan-review-2a7-perf PERF_HEAD=2a7dc57a9163d9f49019fd3c29673b87548ebf4d PLAYWRIGHT_BROWSERS_PATH=/workspace/.junyan-tools/browsers /workspace/.junyan-tools/node_modules/node/bin/node node_modules/@playwright/test/cli.js test --config docs/evidence/world/0088/app-perf-1cf3532/perf.config.ts
python docs/evidence/world/0088/app-perf-1cf3532/summarize.py
```

The2a7 diagnostic compiler emitted its chunks but initially failed its offline closeBundle hook because that plugin hardcodes the ordinary `dist` directory and this fresh archive had none. The measured diagnostic run used those emitted chunks with service workers blocked. Subsequently the ordinary production build and diagnostic rebuild both passed, and every measured diagnostic JS chunk matched its prior SHA256 (`2a7-measured-chunks.sha256`). This is a disclosed review-build setup error, not a hidden application failure. `build-2a7.log` preserves it; `production-build-2a7.log` and `build-2a7-recheck.log` record completion.

Pstack benchmark checklist applied. Raw measurements and summary retain every sample, boundary count/time and frame interval. Generated instrumented-dist directories are local runtime copies, not intended committed application code. No fixes, commits, pushes or deployment performed by this sub-reviewer.
