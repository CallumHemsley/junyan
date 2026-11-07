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

- Early candidate: existing variant0 now paints low broad leaf rosettes; variant1 sparse upright paired leaves; variant2 worked soil with three remaining low plants. Timber, soil inset, prop depth/culling and map are unchanged. Taller stems intentionally reach1.25 world units inside the bed inset; final tests and player-depth inspection pending.
- Four matched actual App before/candidate phone390×844 and desktop1440×1000 morning/night originals captured privately under0141/native. Seed42, courtyard23/23, north pose, life42000ms and frozen clock; clean consoles. Capture fixture restores a validated save, so it establishes rendering, not map traversal.
- Early source freeze for independent preference; ticket remains doing. No broad QA run before that gate. Latest main14b8f7b6 reconciliation, material/variant/alpha/bounds checks, normal/reduced inspection and required real journeys remain pending.

- Gate01 rejected f50175bf: baseline preferred in all four blind full-view comparisons. Sparse leaves lost readable planted mass, especially at phone/night. Rejected source and captures retained.
- Candidate02 restores15 broad shaded clusters in the large bed, dense paired rows of lanceleaf fans in variant1, and six substantial broadleaf clusters around a bounded soil gap in variant2. Timber/soil and actual prop identity remain unchanged; all foliage points stay inside the .13 soil inset. Four matched candidate02 originals inspected at native phone/desktop morning/night with clean consoles. This is a second early freeze for blind preference, not a QA completion claim.
