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
