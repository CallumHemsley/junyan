# Production checkpoint movement cost

Verdict: **no frame stall observed in this cloud run**. Per-frame synchronous checkpoint writes are confirmed, but this measurement does not establish a physical-phone regression or justify a claim that checkpointing is free.

Exact source `e6270d095dead66ccb1d6fe9fb1815bbee86d702`, isolated checkout `/workspace/junyan-review-integration`. Production JS `index-CJaIrm45.js` SHA256 `83bbee0a8bdfa1db819e86d13abcc3c9297c368897de48905fefac78db2debc3`. No product source/dist changes. Chromium on cloud Linux emulates iPhone13 viewport 390x664; no CPU throttling. Node22 and existing Chromium. Strict port5493 is stopped after the run.

## Method and limitations

The ordinary first sample follows the real hospital opening and genuine keyboard movement. Fresh opening saves have no world field until the first world action, so an unmeasured 100ms held movement initializes it. The first probe failed this precondition; `precondition-failure.json` preserves that setup failure.

Five two-second held-walk samples per load alternate ordinary/full-journal. Movement follows the real production key handlers, one second toward the kitchen and one second back. The ordinary save has4 journal words and2026 UTF-8 JSON bytes. The full-journal diagnostic save has267 distinct existing content word IDs and20553 bytes. It is explicitly seeded in IndexedDB, then reloaded through the production save loader; it is not evidence that a user organically acquired every word. Subsequent ordinary samples restore the captured ordinary save for comparable geometry.

Observational wrappers retain native `Storage.prototype.setItem` and `JSON.stringify`; timings cover their native calls. Blob byte counting, wrapper bookkeeping and an independent requestAnimationFrame observer add overhead. Native writes must actually occur (over30 per sample), journal size must survive, no page errors may occur, and the final moved position must survive reload. All assertions passed. Empty checkpoint after700ms idle was observed in every sample.

Host had5 cores and load averages1.57/0.52/0.18 before the run and1.66/0.87/0.36 after. Other independent cloud browser reviews ran concurrently. Alternation reduces drift but does not isolate hardware or prove behaviour on a slower device. No source optimization was compared and no speedup is claimed.

## Results

Median with range over5 samples, each approximately2 seconds:

| Metric | Ordinary4-word save | Diagnostic267-word save |
|---|---|---|
| Checkpoint writes |121 (120–122)|121 (120–122)|
| Native setItem total |6.9ms (5.2–7.1)|10.0ms (8.0–13.2)|
| JSON.stringify total |4.0ms (3.2–4.7)|8.1ms (7.2–8.5)|
| Maximum observed RAF gap |16.8ms (16.8–16.8)|16.8ms (16.8–16.8)|
| Gaps over50ms |0 in every sample|0 in every sample|

The fuller save increases serialization/storage work, but the combined measured native work remains around18ms over a2-second sample here, under1% of wall time. The browser frame cadence is the practical limit in this run, not synchronous storage saturation. A separate unreported one-second CDP CPU profile is retained;877 samples were idle versus45 program samples, with remaining samples sparse rendering/application work. It does not support attributing a stall to checkpoint writes.

This is early restaurant-only production viewport coverage. It does not prove cost with a fully populated town, NPC traffic, atmosphere, long histories, low-end phone storage, or simultaneous interactions. Repeat against integrated scenes and representative slower hardware before blanket performance acceptance. The earlier stale-checkpoint rollback reproduction is separate; this run checks settled movement persistence only, not all recovery race orderings.

## Rerun and evidence

Run from `/workspace/junyan` while the isolated source build remains at the recorded head:

```
PLAYWRIGHT_BROWSERS_PATH=/workspace/.junyan-tools/browsers /workspace/.junyan-tools/node_modules/node/bin/node node_modules/@playwright/test/cli.js test --config docs/evidence/world/0088/checkpoint-perf/perf.config.ts
```

`measurements.json` preserves every native write duration/size, serialization time, frame interval, save position and error count. `summary.json` contains medians/ranges. `results.json` records the passing40.4-second browser case. `separate-profile.json` is diagnostic only and excluded from timing statistics. Pstack benchmark checklist was read before measuring. No application edits, fixes, commit or push.
