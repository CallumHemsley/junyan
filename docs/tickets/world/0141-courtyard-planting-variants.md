---
id: 141
title: Give courtyard planting beds distinct authored silhouettes
status: doing
priority: high
type: feature
created: 2026-11-07
---

## Why

Independent district review finds four planting beds rendered as repeated cuboids even though map content already gives them variants. Use those existing distinctions to make the domestic yard feel tended and specific.

## Done when

- Propose a coherent small treatment first: existing variants should create distinct low rosettes, taller sparse foliage and partly empty soil, rather than more pixel noise or extra props.
- Preserve bed timber/support/footprint, actual variant/state identity, culling/occlusion, nearby routes/cat activity, palette and single authoritative shading. No new gameplay/harvest state or map/content changes.
- Early matched original phone/desktop day/night views must earn independent preference before broad QA. No forced wow/AAA.
- Complete relevant material/variant/alpha/bounds tests, rules/types/build and required real journeys; inspect native normal/reduced behavior and cross-review exact final source before merge.

## Notes

- Owner courtyard plant writer; branch codex/0141-courtyard-planting-variants; worktree /private/tmp/junyan-world-courtyard-planting-variants; strict ports5634/5635.
- Base accepted main6d11a876; reconcile latest main later. Independent critique private district-critic/review.md. Shared courtyard art source only; no current writer uses that module.
- All new raw QA private /private/tmp/junyan-world-private-qa/0141; source/tests/ticket only committed. Parent owns reviewers and merges.
