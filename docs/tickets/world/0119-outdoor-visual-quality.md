---
id: 119
title: Review and improve outdoor world craft against actual native views
status: done
priority: high
type: feature
created: 2026-11-06
---

## Why

The user wants different levels reviewed and improved in parallel. Outdoor scenes need coherent materials, grounded construction, purposeful framing and character rather than more generic acreage.

## Done when

- Review actual town, park and riverbank gameplay views at desktop and phone and record the strongest defects with native evidence.
- Implement the two highest-impact compatible art/composition improvements within the existing native style; preserve true routes, water/shore boundaries, doors and deliberate scene identity.
- Inspect morning/evening/night where relevant, collision/occlusion and material/contact hierarchy; no random clutter, fake paths, text in art or copied third-party assets.
- Independent harsh version-withheld visual review and source/gameplay checks verify gains and regressions honestly; overall Stardew quality remains open until supported.

## Notes

- Owner: Codex outdoor writer. Branch: codex/0119-outdoor-visual-quality. Worktree: /private/tmp/junyan-world-outdoor-quality. Native Vite port: 5578, strict.
- Native review: town roof grids flatten construction; park/river crowns read as detached leaf pads on sparse branches. Improve authored canopy mass and tiled roof construction, without changing bounds or gameplay geometry. Detailed evidence stays private under /private/tmp/junyan-world-private-qa/0119.
- Candidate frozen: original staggered slate tiles, RGB material-value ramps, ridge/eave construction and connected interior boughs. Maps, water, routes, doors, actor/fade bounds and shared rendering are untouched. An initial geometric canopy backplate was rejected.
- Verification: 683 rules passed with two workers, 23 outdoor navigation checks passed, six final art checks passed, TypeScript/build passed; desktop and phone opening/service/change/journal journeys passed. Detailed matched native captures and remaining journey results stay private.
- Learning: the shared color shader treats exposure as sunlight strength, so traditional face factors do not establish material values; root coordinates that contract separately. Flat acreage, repeated building shapes and phone framing still limit quality.
- Independent source and version-withheld visual gates are pending; this ticket remains doing and the broad Stardew craftsmanship bar remains open.

- Centrally reserved by root. Branch codex/0119-outdoor-visual-quality; worktree /private/tmp/junyan-world-outdoor-quality.
- Lease art/town and art/landscape modules only initially. Propose any map/geometry/shared rendering change before editing. No restaurant/residential/shared painter/camera/schema/dependency changes. Ports5578/5579 strict.
- All detailed plans, new native captures, traces and reports stay private under /private/tmp/junyan-world-private-qa/0119; no public raw QA or merges before independent gates.

- Main-only release127: independently accepted bounded art/source gains ported without the reading-room chapter or experimental renderer. Exact release passes645 rules tests/99files, types/build,12 desktop/phone service/save/navigation journeys and two production offline checks. Phone and desktop native affected scenes inspected. This completes the scoped repair, while broader authored-world and character quality work remains active.
