---
id: 134
title: Reduce measured cold world-navigation preparation cost
status: done
priority: high
type: explore
created: 2026-11-07
---

## Why

Cold exit-component/navigation preparation approached one second in measured outdoor maps and rose roughly 9% with the retained denser shore. Independent warm App probes did not reproduce the isolated scratch-loop tails. This work profiles the cold preparation path and actual map entry separately.

## Done when

- Profile actual cold preparation and user-visible map entry with source attribution, separate from warm frame costs. Preserve baseline/raw attempts and compare alternating runs.
- Propose a measured pure optimization before edits; preserve exact collision/radius/walk/route/exit outputs, deterministic tie behavior and mutable-input correctness. No stale geometry cache or unrelated renderer change.
- Verify static and dynamic maps, adversarial boundaries, actual old-save recovery and normal/touch movement; demonstrate meaningful measured improvement before production promotion.
- Independent source/runtime review must confirm correctness and scope; reject an unhelpful experiment rather than claiming unproved global FPS.

## Notes

- Owner: navigation-performance writer. Branch `codex/0134-cold-navigation-cost`; worktree `/private/tmp/junyan-world-cold-navigation-cost`; strict ports 5612/5613. Reviewed shoreline base `a97bcb2c`, allocation `614ebdc4`, implementation `2522873a`; merged main53 `a5d951c1` afterward, changing only ticket0131 documentation. All raw QA remains private under `/private/tmp/junyan-world-private-qa/0134`.
- CPU profiles identify the collider callback in `canStand` as the dominant cold preparation work. The approved two-line optimization retains the closest-point clamp and exact `Math.hypot` fallback, skipping the norm only when either absolute axis distance already exceeds the radius. Bounds, walkable-footprint coverage, sampling, path search/ties and existing caches remain unchanged. No new cache, geometry preparation, dependency, renderer, map, actor or save-format change.
- Exact equivalence evidence: 347,412 stand comparisons, 800 walk segments, 73 complete paths and 16 complete ordered exit components, including ten static maps, initial dynamic maps, a moved/rotated apartment table, mature garden and day-two courtyard. Numeric probes include tangencies, nonfinite points, negative/NaN/nonfinite radii and extreme finite coordinates. Three committed tests cover contact, radius/point limits and immediate mutations to collider rectangles/arrays, support and bounds. The contract is schema-valid map geometry; arbitrary malformed map objects are outside this claim.

### Controlled cold measurement

Four alternating rounds at each viewport (1440×1000 and 390×844), fresh browser contexts, identical current map data and equivalent module interception/cache policy for both versions. Chromium uses the same machine CPU at both widths, with no artificial throttling or clock stepping. The first recovery pair at each width includes CPU profiling. Coordinator and bed writer confirmed their browser/test work had ended; OS background work is uncontrolled. All sixteen raw cases are retained, with no outlier removal.

- Riverbank exit component: median **785.5 → 404.0 ms (48.6% lower)**; all-anchor paths **730.5 → 388.8 ms (46.8% lower)**. Park component **275.6 → 138.3 ms (49.8% lower)**; paths **563.2 → 317.2 ms (43.7% lower)**. Every complete ordered component and path matches.
- Actual old-shoreline save recovery at `(44,74.5)`: first rendered canvas median **831.3 → 491.7 ms desktop**, **839.4 → 494.9 ms phone viewport**. Main-thread long-task medians **664.5 → 327.5 ms** and **678.5 → 327.5 ms**. Every case recovers to exactly `(43,75.5)`, without console/page errors. CPU profiles reduce collider-callback self time from approximately 504–508 ms to 182–184 ms while other `canStand` work stays near 95–106 ms.
- Ordinary valid washing-position entry has no >50 ms tasks in either version in these runs. Desktop first-canvas median **113.0 → 114.0 ms**; phone viewport **127.4 → 115.2 ms**. This control does not establish a general entry-speed or warm-FPS improvement. The remaining roughly 328 ms recovery pause is still substantial, and viewport emulation is not physical-phone evidence.
- Preserve two earlier overlapping timing attempts as diagnostics: the first overlaps broad agent/test CPU work and the writer's differential tail; the second overlaps another writer's final phone journey. Neither supports the controlled result. Initial diagnostic profiles and baseline attempts also remain private.

### Verification and review

- **652 rules tests / 101 files pass**, using two workers and an explicit 15-second CLI timeout; the unchanged actor alpha/hash loop actually completes in 1.886 seconds. Two earlier runs each passed 651/652 and exceeded that loop's existing five-second timeout under shared CPU load (5.35/6.77 seconds). Both failures are retained; no timeout configuration or actor code changed. Focused geometry/exit checks also pass 14/14.
- TypeScript and production Vite build pass; existing large-chunk and Zod annotation warnings remain visible. **12 desktop/phone opening, waiter and physical-door journeys pass**, including serving, change and journal use. **12 keyboard/touch normal/reduced-motion bridge checks pass** with safe sampled feet/segments; those bridge checks deliberately step the browser clock and do not measure wall-clock smoothness.
- **Four actual historical-bank saves** preserve journal, earnings, served/day/seed and story discoveries while recovering nearby dry exit-connected feet. **Four production offline recoveries** preserve the same exact positions and progress, with the current service worker and no development hooks. Native desktop and phone screenshots were inspected; console/page errors are empty.
- Independent coordinator source review found no introduced defect within the validated-map contract. Coordinator independently recomputed all eight final baseline/candidate pairs: exact ordered components, paths and recovered positions agree, errors are empty, and the bounded timing summaries agree. Final promotion remains subject to coordinator inspection of this exact final head and normal PR checks.
- Learned: an axis-distance early-out removes substantial cold collision work without a spatial framework or new cache. It halves this measured recovery task, while ordinary valid entry already avoids it. This does not explain the older scratch-loop tail, establish per-frame NPC-path causality, certify broad FPS, or complete the wider world-quality goal.
