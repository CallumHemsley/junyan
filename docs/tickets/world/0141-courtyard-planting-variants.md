---
id: 141
title: Give courtyard planting beds distinct authored silhouettes
status: done
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

- Owner courtyard plant writer; branch codex/0141-courtyard-planting-variants; worktree /private/tmp/junyan-world-courtyard-planting-variants; strict ports 5634/5635.
- Base accepted main6d11a876; reconcile latest main later. Independent critique private district-critic/review.md. Shared courtyard art source only; no current writer uses that module.
- All new raw QA private /private/tmp/junyan-world-private-qa/0141; source/tests/ticket only committed. Parent owns reviewers and merges.

- Early candidate: existing variant0 now paints low broad leaf rosettes; variant1 sparse upright paired leaves; variant2 worked soil with three remaining low plants. Timber, soil inset, prop depth/culling and map are unchanged. Taller stems intentionally reach1.25 world units inside the bed inset; final tests and player-depth inspection pending.
- Four matched actual App before/candidate phone390×844 and desktop1440×1000 morning/night originals captured privately under0141/native. Seed42, courtyard23/23, north pose, life42000ms and frozen clock; clean consoles. Capture fixture restores a validated save, so it establishes rendering, not map traversal.
- Early source freeze for independent preference; ticket remains doing. No broad QA run before that gate. Latest main14b8f7b6 reconciliation, material/variant/alpha/bounds checks, normal/reduced inspection and required real journeys remain pending.

- Gate01 rejected f50175bf: baseline preferred in all four blind full-view comparisons. Sparse leaves lost readable planted mass, especially at phone/night. Rejected source and captures retained.
- Candidate02 restores15 broad shaded clusters in the large bed, dense paired rows of lanceleaf fans in variant1, and six substantial broadleaf clusters around a bounded soil gap in variant2. Timber/soil and actual prop identity remain unchanged; all foliage points stay inside the .13 soil inset. Four matched candidate02 originals inspected at native phone/desktop morning/night with clean consoles. This is a second early freeze for blind preference, not a QA completion claim.

- Gate02 returned revise: candidate02 narrowly preferred in both night views; original baseline narrowly preferred in both morning views. No overall improvement established. Prior source and originals retained.
- Candidate03 keeps the same plant counts and upper leaf families, adds continuous low shaded leafy bodies/skirts, closes the widest internal soil channels and offsets selected cluster centers. The variant2 gap is a narrow soil window. One stable composition serves all phases. Four matched originals under0141/native/candidate03 inspected at native dimensions with clean consoles; broad QA remains pending the independent gate.

- Gate03 retained candidate03: all four blind preferences favored it. Accepted art then stayed byte-identical (SHA256 ed83441546f9afecea88d5661df7f9c220568d43473aaef43e53cabe77ddee18); no further art expansion.
- Reconciled accepted main dedd81e6a2e8a39c48aa1b5fd79488435d56bc57 once before final QA. All 107 files / 678 tests and TypeScript/production build pass. Two focused tests cover all four authored bed dimensions, soil-inset/height bounds, unchanged support materials, inherited grading/alpha/depth, time/motion invariance and 32 phone/desktop edge cases.
- Required Playwright checks 10/10 pass across desktop/phone: ward-to-service/change/journal/progression, physical world doors/stairs, courtyard motion harness and scene visibility/preference scheduling. Private QA root explicitly `/private/tmp/junyan-world-private-qa/0141/journeys`; strict ports 5634/5635. Final native original morning/night normal/reduced views, all four beds from near/far, visible cat corridor, phone camera edges and actual pad movement in both motion modes inspected; consoles clean. Provenance/scripts/reports and all raw media remain private under `/private/tmp/junyan-world-private-qa/0141`.
- Ready for independent exact-source/native review; status stays doing until it resolves. Remaining modest art limits: the middle bed is intentionally less full and cultivated rows remain visible. Variant2's fixed composition is authored for its current 3×1.6 bed; future size reuse needs a new arrangement/check. No map, gameplay state, schema, save, route, text or audio changes.

- Completed after independent `courtyard_final_141` review approved exact source freeze `7aba1d566085b09bcb2ec1c2586bef00d06893dc` and independently confirmed unchanged art/test hashes, all 40 private native PNGs and the 10 passing journey results. Final evidence and hashes remain in `/private/tmp/junyan-world-private-qa/0141/provenance-final.json` and `final-writer-report.md`; this completion change touches ticket metadata only.
- Learned: silhouette differences needed overlapping lower leaf volume to survive phone daylight as well as night. Gate 03 improved all four blind comparisons; the final review retains the modest middle-bed/row-pattern limits and current-size-only variant 2 arrangement documented above.
