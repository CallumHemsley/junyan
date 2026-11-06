---
id: 134
title: Reduce measured cold world-navigation preparation cost
status: doing
priority: high
type: explore
created: 2026-11-07
---

## Why

Cold exit-component/navigation preparation is near one second in measured outdoor maps and rises roughly9percent with the retained denser shore. Independent warm App probes did not reproduce the scratch-loop tails, so diagnose the real cold preparation path rather than assuming per-frame NPC pathfinding.

## Done when

- Profile actual cold preparation and user-visible map entry with source attribution, separate from warm frame costs. Preserve baseline/raw attempts and compare alternating runs.
- Propose a measured pure optimization before edits; preserve exact collision/radius/walk/route/exit outputs, deterministic tie behavior and mutable-input correctness. No stale geometry cache or unrelated renderer change.
- Verify static and dynamic maps, adversarial boundaries, actual old-save recovery and normal/touch movement; demonstrate meaningful measured improvement before production promotion.
- Independent source/runtime review must confirm correctness and scope; reject an unhelpful experiment rather than claiming unproved global FPS.

## Notes

- Owner navigation-performance writer; branch codex/0134-cold-navigation-cost; worktree /private/tmp/junyan-world-cold-navigation-cost; strict ports5612/5613. Base reviewed combined131candidate for the real updated river geometry.
- First inspect source and profile. Candidate ideas include eliminating repeated rectangle allocation or per-query spatial preparation; no proposed cache may silently assume mutable data is immutable.
- Raw QA private under /private/tmp/junyan-world-private-qa/0134. No dependencies/save/schema/landscape/actor changes without root coordination.

- Initial browser CPU profile attributes the dominant cold preparation work to the collider callback in `canStand`, including its repeated distance calculation. Cold riverbank exit-component preparation produced 25,707 ordered points in 775.5 ms in this diagnostic run; park produced 19,691 in 246.3 ms. These are machine-local diagnostics, not a controlled final comparison.
- Ordinary valid washing-position App entry did not produce a >50 ms task in the initial probe. A formerly dry `(44,74.5)` shoreline save did trigger cold recovery: 667–707 ms main-thread tasks and first rendered riverbank canvas at 819–905 ms. Keep this scenario distinction; no per-frame NPC-path attribution.
- Approved optimization retains the original closest-point calculation and exact `Math.hypot` fallback, skipping it only when one axis alone proves the collider is farther than the radius. No new cache, geometry preparation, schema or dependency.
- Private exact baseline/candidate differential: 296,192 stand checks, 650 walk segments, 57 complete paths and 13 complete ordered exit components over ten static and three dynamic maps agree. Numeric probes include tangent, nonfinite, negative/NaN radius and overflow inputs; focused source regressions cover mutable rectangles/arrays, support and bounds.
- Verification is in progress. An initial full run and a two-worker repeat each passed 651/652 tests, with the unchanged actor alpha/hash loop exceeding its existing five-second timeout under concurrent CPU work. Production types/build pass. Retain both attempts privately; finish the broad rerun and browser gates before promotion.
